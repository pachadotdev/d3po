import * as d3 from 'd3';
import {
  validateData,
  triggerDownload,
  maybeEvalJSFormatter,
  escapeHtml,
  getTextColor,
} from './utils.js';

/**
 * Base D3po class for creating interactive visualizations
 * @class
 */
export default class D3po {
  /**
   * Creates a new D3po instance
   * @param {string|HTMLElement} container - CSS selector or DOM element
   * @param {Object} options - Configuration options
   * @param {number} [options.width] - Chart width in pixels
   * @param {number} [options.height] - Chart height in pixels
   * @param {Object} [options.margin] - Chart margins
   * @param {string} [options.title] - Chart title
   * @param {string} [options.background] - Background color
   * @param {string} [options.fontFamily] - Font family
   * @param {number} [options.fontSize] - Font size
   */
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Default options
    this.options = {
      width: options.width || this.container.clientWidth || 800,
      height: options.height || this.container.clientHeight || 600,
      margin: options.margin || { top: 60, right: 40, bottom: 80, left: 60 },
      title: options.title || '',
      background: options.background || '#ffffff',
      fontFamily: options.fontFamily || '"Noto Sans", "Fira Sans", sans-serif',
      fontSize: options.fontSize || 12,
      download: options.download !== undefined ? options.download : true,
      ...options,
    };

    this.data = null;
    this.svg = null;
    this.chart = null;

    // Optional formatters/templates provided by the R or JS layer
    // tooltip: string/function
    this.tooltip = options.tooltip || null;
    // axisFormatters: { x: fn, y: fn }
    this.axisFormatters = options.axisFormatters || null;

    // If user passed axis_x / axis_y (convenience for direct JS usage), evaluate
    // JS.* strings into functions and populate options.axisFormatters so
    // visualizations can read this.options.axisFormatters.
    if (options.axis_x !== undefined) {
      this.options.axisFormatters = this.options.axisFormatters || {};
      const fx = maybeEvalJSFormatter(options.axis_x);
      this.options.axisFormatters.x = fx || null;
    }
    if (options.axis_y !== undefined) {
      this.options.axisFormatters = this.options.axisFormatters || {};
      const fy = maybeEvalJSFormatter(options.axis_y);
      this.options.axisFormatters.y = fy || null;
    }

    // If tooltip provided, try to compile it to a callable formatter.
    // Priority:
    // 1. If options.tooltip is a JS.* string or function, maybeEvalJSFormatter
    //    will return a function.
    // 2. If it's a plain string containing {field} placeholders, compile a
    //    simple template function that substitutes values from the row.
    // 3. Otherwise leave this.tooltip null (visualizers may fallback to
    //    default content behavior).
    if (options.tooltip !== undefined) {
      const tf = maybeEvalJSFormatter(options.tooltip);
      if (tf) {
        this.tooltip = tf;
      } else if (
        typeof options.tooltip === 'string' &&
        options.tooltip.indexOf('{') >= 0
      ) {
        const template = options.tooltip;
        this.tooltip = function (_v, row) {
          if (!row) return '';
          return template.replace(/\{([^}]+)\}/g, function (_, key) {
            var val = row[key];
            if (val === null || val === undefined) return '';
            return escapeHtml(String(val));
          });
        };
      } else {
        this.tooltip = null;
      }
    }

    // Accept formattedCols and axisLabels produced by the R side
    // formattedCols: { name: '__label_name' }
    if (options.formattedCols !== undefined) {
      this.options.formattedCols = options.formattedCols;
    }
    // axisLabels: { x: 'label text', y: 'label text' }
    if (options.axisLabels !== undefined) {
      // mirror into options.xLabel / options.yLabel for backward compatibility
      if (!this.options.xLabel && options.axisLabels.x !== undefined)
        this.options.xLabel = options.axisLabels.x;
      if (!this.options.yLabel && options.axisLabels.y !== undefined)
        this.options.yLabel = options.axisLabels.y;
      this.options.axisLabels = options.axisLabels;
    }

    // Mirror options.axisFormatters to this.axisFormatters for convenience
    this.axisFormatters = this.options.axisFormatters || this.axisFormatters;

    this._initializeSVG();
  }

  /**
   * Initializes the SVG container
   * @private
   */
  _initializeSVG() {
    // Clear existing content
    d3.select(this.container).selectAll('*').remove();

    // Create SVG
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background', this.options.background)
      .style('font-family', this.options.fontFamily)
      .style('font-size', `${this.options.fontSize}px`);

    // Apply text-transform if specified
    if (this.options.textTransform) {
      this.svg.style('text-transform', this.options.textTransform);
    }

    // Determine theme (dark vs light) by sampling the container background color.
    let bg = this.options.background;
    if (!bg) {
      try {
        bg = window.getComputedStyle(this.container).backgroundColor || bg;
      } catch (e) {
        bg = bg || '#ffffff';
      }
    }
    try {
      const rgb = d3.color(bg) || d3.rgb('#ffffff');
      const luminance =
        (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
      this.isDark = luminance <= 0.5;
    } catch (e) {
      this.isDark = false;
    }

    // Honor explicit theme overrides passed via options.theme = { axis: '#fff', tooltips: '#000' }
    if (this.options && this.options.theme) {
      this.explicitTheme = this.options.theme;
      try {
        if (this.explicitTheme.axis) {
          const c = d3.color(this.explicitTheme.axis);
          if (c) {
            const luminanceA =
              (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
            // If explicit axis color suggests light background, prefer light mode for text defaults
            this.isDark = luminanceA <= 0.5 ? true : false;
          }
        }
      } catch (e) {
        void 0;
      }
    }

    // Set data attributes so utilities can detect theme and explicit overrides
    try {
      const theme = this.isDark ? 'dark' : 'light';
      this.svg.attr('data-d3po-theme', theme);
      if (this.container && this.container.setAttribute)
        this.container.setAttribute('data-d3po-theme', theme);
      if (this.explicitTheme) {
        try {
          if (this.explicitTheme.axis) {
            this.svg.attr('data-d3po-axis', this.explicitTheme.axis);
            if (this.container && this.container.setAttribute)
              this.container.setAttribute(
                'data-d3po-axis',
                this.explicitTheme.axis
              );
          }
          if (this.explicitTheme.tooltips) {
            this.svg.attr('data-d3po-tooltips', this.explicitTheme.tooltips);
            if (this.container && this.container.setAttribute)
              this.container.setAttribute(
                'data-d3po-tooltips',
                this.explicitTheme.tooltips
              );
          }
        } catch (e) {
          void 0;
        }
      }
    } catch (e) {
      void 0;
    }

    // Inject strong theme CSS to resist external overrides
    try {
      this._injectThemeStyles();
    } catch (e) {
      void 0;
    }

    // If explicit axis color is provided, install a MutationObserver to
    // enforce inline styles for axis lines and labels when they're added
    try {
      if (
        this.explicitTheme &&
        this.explicitTheme.axis &&
        this.svg &&
        this.svg.node
      ) {
        // apply immediately in case axes are created synchronously later
        this._applyExplicitAxisColors(this.explicitTheme.axis);

        const svgNode = this.svg.node();
        const mo = new MutationObserver(muts => {
          // On DOM changes under the SVG, re-apply explicit colors
          this._applyExplicitAxisColors(this.explicitTheme.axis);
        });
        mo.observe(svgNode, { childList: true, subtree: true });
        // store observer so it can be disconnected on destroy
        this._axisMutationObserver = mo;
      }
    } catch (e) {
      void 0;
    }

    // Add title if provided
    if (this.options.title) {
      const t = this.svg
        .append('text')
        .attr('class', 'title')
        .attr('x', this.options.width / 2)
        .attr('y', this.options.margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', `${this.options.fontSize * 1.5}px`)
        .style('font-weight', 'bold')
        .text(this.options.title);
      // If explicit axis color provided, enforce title color inline
      try {
        if (this.explicitTheme && this.explicitTheme.axis) {
          t.style('fill', this.explicitTheme.axis);
        } else {
          t.style('fill', this.isDark ? '#eee' : '#111');
        }
      } catch (e) {
        void 0;
      }
    }

    // Create main chart group
    this.chart = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.options.margin.left},${this.options.margin.top})`
      );

    // Add download functionality if enabled
    if (this.options.download) {
      this._addDownloadButtons();
    }
  }

  /**
   * Inject CSS rules that enforce axis/label/title colors and menu styles.
   * Uses data attributes (data-d3po-theme and data-d3po-axis) and !important
   * to make rules robust against global page themes.
   * @private
   */
  _injectThemeStyles() {
    const id = 'd3po-explicit-theme-styles';
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = id;

    const explicitAxis =
      (this.explicitTheme && this.explicitTheme.axis) || null;
    const explicitTooltips =
      (this.explicitTheme && this.explicitTheme.tooltips) || null;

    const lightAxis = explicitAxis || '#333';
    const darkAxis = explicitAxis || 'rgba(255,255,255,0.85)';
    const lightText = explicitAxis || '#111';
    const darkText = explicitAxis || '#eee';

    const tooltipBg = explicitTooltips || (this.isDark ? '#252543' : 'white');
    const tooltipText = explicitTooltips
      ? getTextColor(tooltipBg) === 'white'
        ? '#eee'
        : '#111'
      : this.isDark
        ? '#eee'
        : '#333';

    style.textContent = `
      /* Axis and ticks */
      [data-d3po-theme="light"] .axis path,
      [data-d3po-theme="light"] .axis line,
      [data-d3po-theme="light"] g.tick line,
      [data-d3po-theme="light"] path.domain {
        stroke: ${lightAxis} !important;
      }
      [data-d3po-theme="light"] g.tick text,
      [data-d3po-theme="light"] .x-axis-label,
      [data-d3po-theme="light"] .y-axis-label,
  [data-d3po-theme="light"] .title,
  [data-d3po-theme="light"] .treemap-subtitle,
  [data-d3po-theme="light"] .treemap-back {
        fill: ${lightText} !important;
      }

      [data-d3po-theme="dark"] .axis path,
      [data-d3po-theme="dark"] .axis line,
      [data-d3po-theme="dark"] g.tick line,
      [data-d3po-theme="dark"] path.domain {
        stroke: ${darkAxis} !important;
      }
      [data-d3po-theme="dark"] g.tick text,
      [data-d3po-theme="dark"] .x-axis-label,
      [data-d3po-theme="dark"] .y-axis-label,
  [data-d3po-theme="dark"] .title,
  [data-d3po-theme="dark"] .treemap-subtitle,
  [data-d3po-theme="dark"] .treemap-back {
        fill: ${darkText} !important;
      }

      /* Force menu/tooltip text color for SVG-attached menus */
      .d3po-menu text { fill: ${tooltipText} !important; }
      .d3po-menu rect { fill: ${tooltipBg} !important; }
    `;

    document.head.appendChild(style);
  }

  /**
   * Apply inline axis/label colors directly to SVG elements. This is the
   * strongest way to resist external CSS overrides.
   * @private
   */
  _applyExplicitAxisColors(color) {
    try {
      if (!color || !this.svg) return;
      const svgNode = this.svg.node();
      if (!svgNode) return;

      // Axis paths and lines
      const axisPaths = svgNode.querySelectorAll(
        '.axis path, .axis line, g.tick line, path.domain'
      );
      axisPaths.forEach(el => {
        try {
          el.setAttribute('stroke', color);
          // also set style attribute to be extra-robust
          el.style.stroke = color;
        } catch (e) {
          void 0;
        }
      });

      // Tick text and axis labels
      const texts = svgNode.querySelectorAll(
        'g.tick text, .x-axis-label, .y-axis-label, .title'
      );
      texts.forEach(el => {
        try {
          el.setAttribute('fill', color);
          el.style.fill = color;
        } catch (e) {
          void 0;
        }
      });
    } catch (e) {
      // ignore failures
    }
  }

  /**
   * Adds download buttons for SVG/PNG export
   * @private
   */
  _addDownloadButtons() {
    // Store reference to this for use in event handlers
    const self = this;

    const buttonGroup = this.svg
      .append('g')
      .attr('class', 'd3po-download-buttons')
      .attr('transform', `translate(${this.options.width - 40}, 20)`);

    // Hamburger icon container
    const hamburger = buttonGroup
      .append('g')
      .attr('class', 'd3po-hamburger')
      .style('cursor', 'pointer');

    // Add invisible larger hit area for easier clicking
    hamburger
      .append('rect')
      .attr('x', -12)
      .attr('y', -12)
      .attr('width', 24)
      .attr('height', 24)
      .style('fill', 'transparent')
      .style('stroke', 'none');

    // Hamburger icon (three lines)
    const lineData = [-4, 0, 4];
    lineData.forEach(y => {
      hamburger
        .append('line')
        .attr('x1', -6)
        .attr('x2', 6)
        .attr('y1', y)
        .attr('y2', y)
        .style('stroke', '#666')
        .style('stroke-width', '2px')
        .style('stroke-linecap', 'round')
        .style('pointer-events', 'none'); // Let the rect handle events
    });

    // Dropdown menu (initially hidden)
    const menu = buttonGroup
      .append('g')
      .attr('class', 'd3po-menu')
      .attr('transform', 'translate(-80, 20)')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Menu background - prefer explicit tooltip bg if provided
    const tooltipBg =
      (this.explicitTheme && this.explicitTheme.tooltips) ||
      (this.isDark ? '#252543' : 'white');
    let tooltipStroke;
    try {
      tooltipStroke =
        this.explicitTheme && this.explicitTheme.tooltips
          ? d3.color(tooltipBg).darker(0.8).toString()
          : this.isDark
            ? 'rgba(255,255,255,0.08)'
            : '#999';
    } catch (e) {
      tooltipStroke = this.isDark ? 'rgba(255,255,255,0.08)' : '#999';
    }
    const tooltipTextColor =
      this.explicitTheme && this.explicitTheme.tooltips
        ? getTextColor(tooltipBg) === 'white'
          ? '#eee'
          : '#111'
        : this.isDark
          ? '#eee'
          : '#333';

    menu
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 90)
      .attr('height', 60)
      .attr('rx', 4)
      .style('fill', tooltipBg)
      .style('stroke', tooltipStroke)
      .style('stroke-width', '1px')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    // SVG download menu item
    const svgItem = menu
      .append('g')
      .attr('class', 'd3po-menu-item')
      .attr('transform', 'translate(0, 0)')
      .style('cursor', 'pointer');

    svgItem
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 90)
      .attr('height', 30)
      .style('fill', 'transparent');

    svgItem
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .style('font-size', '12px')
      .style('fill', tooltipTextColor)
      .style('user-select', 'none')
      .text('📥 SVG');

    svgItem
      .on('click', function (event) {
        event.stopPropagation();
        self.downloadSVG();
        self._hideMenu();
      })
      .on('mouseover', function () {
        try {
          const hoverFill =
            self.explicitTheme && self.explicitTheme.tooltips
              ? d3.color(tooltipBg).brighter(0.5).toString()
              : self.isDark
                ? '#3a3a5a'
                : '#f0f0f0';
          d3.select(this).select('rect').style('fill', hoverFill);
        } catch (e) {
          d3.select(this).select('rect').style('fill', '#f0f0f0');
        }
      })
      .on('mouseout', function () {
        d3.select(this).select('rect').style('fill', 'transparent');
      });

    // PNG download menu item
    const pngItem = menu
      .append('g')
      .attr('class', 'd3po-menu-item')
      .attr('transform', 'translate(0, 30)')
      .style('cursor', 'pointer');

    pngItem
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 90)
      .attr('height', 30)
      .style('fill', 'transparent');

    pngItem
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .style('font-size', '12px')
      .style('fill', tooltipTextColor)
      .style('user-select', 'none')
      .text('📥 PNG');

    pngItem
      .on('click', function (event) {
        event.stopPropagation();
        self.downloadPNG();
        self._hideMenu();
      })
      .on('mouseover', function () {
        try {
          const hoverFill =
            self.explicitTheme && self.explicitTheme.tooltips
              ? d3.color(tooltipBg).brighter(0.5).toString()
              : self.isDark
                ? '#3a3a5a'
                : '#f0f0f0';
          d3.select(this).select('rect').style('fill', hoverFill);
        } catch (e) {
          d3.select(this).select('rect').style('fill', '#f0f0f0');
        }
      })
      .on('mouseout', function () {
        d3.select(this).select('rect').style('fill', 'transparent');
      });

    // Show menu on hover instead of click
    hamburger
      .on('mouseenter', function (event) {
        event.stopPropagation();
        // Highlight the hamburger
        d3.select(this).selectAll('line').style('stroke', '#333');
        self._showMenu();
      })
      .on('mouseleave', function () {
        // Reset hamburger color
        d3.select(this).selectAll('line').style('stroke', '#666');

        // Delay hiding to allow moving to menu
        setTimeout(() => {
          if (!self._isMouseOverMenu) {
            self._hideMenu();
          }
        }, 100);
      });

    // Keep menu open when hovering over it
    menu
      .on('mouseenter', function () {
        self._isMouseOverMenu = true;
      })
      .on('mouseleave', function () {
        self._isMouseOverMenu = false;
        self._hideMenu();
      });

    // Initialize mouse tracking
    this._isMouseOverMenu = false;

    // Store menu reference for show/hide
    this.menu = menu;
  }

  /**
   * Shows the download menu
   * @private
   */
  _showMenu() {
    if (this.menu) {
      this.menu
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('pointer-events', 'all');
    }
  }

  /**
   * Hides the download menu
   * @private
   */
  _hideMenu() {
    if (this.menu) {
      this.menu
        .transition()
        .duration(200)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    }
  }

  /**
   * Gets the inner width (excluding margins)
   * @returns {number} Inner width
   */
  getInnerWidth() {
    return (
      this.options.width - this.options.margin.left - this.options.margin.right
    );
  }

  /**
   * Gets the inner height (excluding margins)
   * @returns {number} Inner height
   */
  getInnerHeight() {
    return (
      this.options.height - this.options.margin.top - this.options.margin.bottom
    );
  }

  /**
   * Sets the data for the visualization
   * @param {Array} data - Array of data objects
   * @returns {D3po} This instance for chaining
   */
  setData(data) {
    validateData(data, []);
    this.data = data;
    return this;
  }

  /**
   * Updates the chart title
   * @param {string} title - New title
   * @returns {D3po} This instance for chaining
   */
  setTitle(title) {
    this.options.title = title;
    this.svg.select('.title').text(title);
    return this;
  }

  /**
   * Updates the background color
   * @param {string} color - Background color
   * @returns {D3po} This instance for chaining
   */
  setBackground(color) {
    this.options.background = color;
    this.svg.style('background', color);
    return this;
  }

  /**
   * Updates font settings
   * @param {string} fontFamily - Font family
   * @param {number} fontSize - Font size
   * @param {string} [textTransform] - CSS text-transform value
   * @returns {D3po} This instance for chaining
   */
  setFont(fontFamily, fontSize, textTransform) {
    this.options.fontFamily = fontFamily;
    this.options.fontSize = fontSize;
    if (textTransform) {
      this.options.textTransform = textTransform;
    }
    this.svg
      .style('font-family', fontFamily)
      .style('font-size', `${fontSize}px`);
    if (textTransform) {
      this.svg.style('text-transform', textTransform);
    }
    return this;
  }

  /**
   * Shows or hides the download buttons
   * @param {boolean} show - Whether to show download buttons
   * @returns {D3po} This instance for chaining
   */
  setDownload(show) {
    this.options.download = show;

    // Remove existing download buttons if they exist
    this.svg.select('.d3po-download-buttons').remove();

    // Add them back if show is true
    if (show) {
      this._addDownloadButtons();
    }

    return this;
  }

  /**
   * Downloads the chart as SVG
   */
  downloadSVG() {
    try {
      const svgNode = this.svg.node();

      // Clone the SVG and add proper namespace
      const clonedSvg = svgNode.cloneNode(true);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // Remove download buttons from the clone
      const downloadButtons = clonedSvg.querySelector('.d3po-download-buttons');
      if (downloadButtons) {
        downloadButtons.remove();
      }

      // Serialize with XML declaration
      const svgData =
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
        new XMLSerializer().serializeToString(clonedSvg);

      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      triggerDownload(blob, 'd3po-chart.svg');
    } catch (error) {
      console.error('Error in downloadSVG:', error);
      alert('Failed to download SVG: ' + error.message);
    }
  }

  /**
   * Downloads the chart as PNG
   */
  downloadPNG() {
    try {
      const svgNode = this.svg.node();

      // Clone the SVG and remove download buttons
      const clonedSvg = svgNode.cloneNode(true);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      const downloadButtons = clonedSvg.querySelector('.d3po-download-buttons');
      if (downloadButtons) {
        downloadButtons.remove();
      }

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = this.options.width;
      canvas.height = this.options.height;

      img.onload = () => {
        try {
          ctx.fillStyle = this.options.background || 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(blob => {
            if (blob) {
              triggerDownload(blob, 'd3po-chart.png');
            } else {
              console.error('Failed to create blob from canvas');
              alert('PNG export failed: Could not create image blob');
            }
          }, 'image/png');
        } catch (error) {
          console.error('Error converting to PNG:', error);
          alert('PNG export failed: ' + error.message);
        }
      };

      img.onerror = error => {
        console.error('Failed to load SVG into image:', error);
        alert('PNG export failed. Please try SVG export instead.');
      };

      // Convert SVG to base64 data URL
      const base64 = btoa(
        encodeURIComponent(svgData).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode('0x' + p1);
        })
      );
      img.src = 'data:image/svg+xml;base64,' + base64;
    } catch (error) {
      console.error('Error in downloadPNG:', error);
      alert('Failed to download PNG: ' + error.message);
    }
  }

  /**
   * Renders the visualization (to be implemented by subclasses)
   * @abstract
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Resizes the visualization
   * @param {number} width - New width
   * @param {number} height - New height
   * @returns {D3po} This instance for chaining
   */
  resize(width, height) {
    // Update options
    this.options.width = width;
    this.options.height = height;

    // Clear the chart group content (but keep the structure)
    this.chart.selectAll('*').remove();

    // Update SVG dimensions
    this.svg.attr('width', width).attr('height', height);

    // Update title position
    if (this.options.title) {
      this.svg.select('.title').attr('x', width / 2);
    }

    // Update download buttons position
    this.svg
      .select('.d3po-download-buttons')
      .attr('transform', `translate(${width - 40}, 20)`);

    // Re-render the chart with new dimensions
    if (this.data) {
      this.render();
    }

    return this;
  }

  /**
   * Destroys the visualization and cleans up
   */
  destroy() {
    d3.select(this.container).selectAll('*').remove();
    this.data = null;
    this.svg = null;
    this.chart = null;
    this.menu = null;
    this._isMouseOverMenu = false;
  }
}
