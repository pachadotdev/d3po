import * as d3 from 'd3';
import D3po from '../D3po.js';
import { validateData, showTooltip, hideTooltip, maybeEvalJSFormatter } from '../utils.js';

/**
 * Treemap visualization
 * @augments D3po
 */
export default class Treemap extends D3po {
  /**
   * Creates a treemap
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.size - Size field name
   * @param {string} options.group - Group field name
   * @param {string} [options.color] - Color field name
   * @param {Function} [options.tile] - Tiling method (e.g., d3.treemapSquarify, d3.treemapBinary)
   * @param {object} [options.labels] - Label positioning options
   */
  constructor(container, options) {
    super(container, options);

    if (!options.size || !options.group) {
      throw new Error('Treemap requires size and group fields');
    }

    this.sizeField = options.size;
    this.groupField = options.group;
    this.colorField = options.color;
    this.tile = options.tile || d3.treemapSquarify;
  this.labels = options.labels || { align: 'left', valign: 'top' };
  // labelMode: 'percent' (default) or 'count'
  this.labelMode = options.labelMode || 'percent';
  // tooltip can be a JS(...) string or a function; compile if needed
  this.tooltipFormatter = maybeEvalJSFormatter(options.tooltip);
  }

  /**
   * Renders the treemap
   * @returns {Treemap} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.sizeField, this.groupField]);

    // Prepare hierarchical data
    const root = d3
      .hierarchy({
        children: this.data.map(d => ({
          name: d[this.groupField],
          value: d[this.sizeField],
          color: this.colorField ? d[this.colorField] : null,
        })),
      })
      .sum(d => d.value);

    // Create treemap layout
    const treemap = d3
      .treemap()
      .tile(this.tile)
      .size([this.getInnerWidth(), this.getInnerHeight()])
      .padding(2)
      .round(true);

    treemap(root);

    // Calculate total for percentage
    const total = root.value;

    // Helper function to calculate luminance from hex color
    const getLuminance = hex => {
      const rgb = d3.rgb(hex);
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      const [rL, gL, bL] = [r, g, b].map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
    };

    // Helper function to determine text color based on background
    const getTextColor = bgColor => {
      const luminance = getLuminance(bgColor);
      return luminance > 0.5 ? 'black' : 'white';
    };

    // Helper function to get text stroke color (opposite of fill)
    const getTextStroke = bgColor => {
      const luminance = getLuminance(bgColor);
      return luminance > 0.5 ? 'white' : 'black';
    };

    // Draw rectangles
    const cells = this.chart
      .selectAll('.cell')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cells
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => d.data.color || d3.interpolateViridis(Math.random()))
      .each(function (d) {
        // Store original color on the data
        d._originalColor = d.data.color || d3.select(this).attr('fill');
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 1);

    // Add tooltip handlers with proper context
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

    // Use compiled formatter if provided; fallback to default HTML
    const tooltipFormatter = this.tooltipFormatter;

    cells.selectAll('rect')
      .on('mouseover', (event, d) => {
        const color = d3.color(d._originalColor);
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
        d3.select(event.currentTarget).attr('fill', highlightColor);

        const percentageNum = (d.value / total) * 100;
        const percentage = percentageNum.toFixed(1);

        // If a tooltip formatter exists, call it with (value, row)
        if (tooltipFormatter) {
          try {
            const out = tooltipFormatter(percentageNum, {
              name: d.data.name,
              value: d.data.value,
              color: d.data.color,
            });
            // If formatter returns a DOM node or string, show it; else fallback
            if (out != null) {
              showTooltip(event, out, fontFamily, fontSize);
              return;
            }
          } catch (err) {
            // Fall through to default tooltip on error
            // eslint-disable-next-line no-console
            console.error('Tooltip formatter error', err);
          }
        }

        // Default tooltip
        showTooltip(
          event,
          `<strong>${d.data.name}</strong>` +
            `Value: ${d.data.value}<br/>` +
            `Percentage: ${percentage}%`,
          fontFamily,
          fontSize
        );
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Calculate x position based on label align
    const getLabelX = (d, align) => {
      const cellWidth = d.x1 - d.x0;
      switch(align) {
        case 'center':
        case 'middle':
          return cellWidth / 2;
        case 'right':
        case 'end':
          return cellWidth - 5;
        case 'left':
        case 'start':
        default:
          return 5;
      }
    };

    // Calculate y position based on label valign (always returns numeric value)
    const getLabelY = (d, valign, lineNumber = 0, totalLines = 2) => {
      const cellHeight = d.y1 - d.y0;
      const lineHeight = this.options.fontSize * 1.4; // Dynamic line height based on font size
      const totalTextHeight = totalLines * lineHeight;
      const baseY = lineNumber * lineHeight;
      
      switch(valign) {
        case 'middle': {
          // Center the entire text block (both lines together)
          const startY = (cellHeight - totalTextHeight) / 2 + this.options.fontSize;
          return startY + baseY;
        }
        case 'bottom':
          return cellHeight - 5 - (lineHeight * (totalLines - lineNumber));
        case 'top':
        default:
          return this.options.fontSize + 4 + baseY; // Start below the top margin
      }
    };

    // Calculate text anchor based on align
    const getTextAnchor = (align) => {
      switch(align) {
        case 'center':
        case 'middle':
          return 'middle';
        case 'right':
        case 'end':
          return 'end';
        case 'left':
        case 'start':
        default:
          return 'start';
      }
    };

    // Always check if labels fit before adding them - check BEFORE adding
    const labels = this.labels;
    
    // Use arrow function to maintain 'this' context
    cells.each((d) => {
      // Find the cell group for this data point
      const cell = cells.filter((cd) => cd === d);
      const cellWidth = d.x1 - d.x0;
      const cellHeight = d.y1 - d.y0;
      
  const totalLines = 2; // We always try to show 2 lines (name + percentage or count)
      const lineHeight = this.options.fontSize * 1.4;
      const totalTextHeight = totalLines * lineHeight;
      
      // Helper to check if text fits (measure before adding)
      const checkTextFits = (text, lineNumber) => {
        // If labels are disabled, don't add
        if (!labels) return false;
        
        // Always check if it fits - simple and consistent behavior
        const x = getLabelX(d, labels.align);
        const y = getLabelY(d, labels.valign, lineNumber, totalLines);
        const textAnchor = getTextAnchor(labels.align);
        
        // For middle alignment, check if entire text block fits vertically
        if (labels.valign === 'middle') {
          if (totalTextHeight > cellHeight) {
            return false;
          }
        } else {
          // Quick vertical check: y position + fontSize must be <= cellHeight
          if (y + this.options.fontSize > cellHeight || y < this.options.fontSize) {
            return false;
          }
        }
        
        // Create temporary text to measure - append to the chart SVG root
        const tempText = this.chart.append('text')
          .attr('x', x)
          .attr('y', y)
          .text(text)
          .attr('font-size', `${this.options.fontSize}px`)
          .attr('font-family', this.options.fontFamily)
          .attr('font-weight', 'bold')
          .attr('text-anchor', textAnchor)
          .style('visibility', 'hidden');
        
        const bbox = tempText.node().getBBox();
        tempText.remove();
        
        // Calculate boundaries based on text-anchor with some margin
        const margin = 5;
        let left, right;
        if (textAnchor === 'start') {
          left = x;
          right = x + bbox.width;
        } else if (textAnchor === 'end') {
          left = x - bbox.width;
          right = x;
        } else { // middle
          left = x - bbox.width / 2;
          right = x + bbox.width / 2;
        }
        
        // Check if it fits within cell bounds with margins
        return left >= margin && right <= (cellWidth - margin);
      };
      
      const categoryName = d.data.name;
  const percentage = ((d.value / total) * 100).toFixed(1) + '%';
  const countText = d.data.value != null ? d.data.value.toLocaleString() : '';
      
      // Check and add category label (line 0)
      if (checkTextFits(categoryName, 0)) {
        cell.append('text')
          .attr('x', getLabelX(d, labels.align))
          .attr('y', getLabelY(d, labels.valign, 0, totalLines))
          .text(categoryName)
          .attr('font-size', `${this.options.fontSize}px`)
          .attr('font-family', this.options.fontFamily)
          .attr('font-weight', 'bold')
          .attr('text-anchor', getTextAnchor(labels.align))
          .attr('fill', getTextColor(d.data.color || '#999'))
          .attr('stroke', getTextStroke(d.data.color || '#999'))
          .attr('stroke-width', 0)
          .attr('paint-order', 'stroke')
          .attr('pointer-events', 'none');
      }
      
      // Check and add second-line label (percentage or count depending on labelMode)
      const secondLine = this.labelMode === 'count' ? countText : percentage;
      if (secondLine && checkTextFits(secondLine, 1)) {
        cell.append('text')
          .attr('x', getLabelX(d, labels.align))
          .attr('y', getLabelY(d, labels.valign, 1, totalLines))
          .text(secondLine)
          .attr('font-size', `${this.options.fontSize}px`)
          .attr('font-family', this.options.fontFamily)
          .attr('font-weight', 'bold')
          .attr('text-anchor', getTextAnchor(labels.align))
          .attr('fill', getTextColor(d.data.color || '#999'))
          .attr('stroke', getTextStroke(d.data.color || '#999'))
          .attr('stroke-width', 0)
          .attr('paint-order', 'stroke')
          .attr('pointer-events', 'none');
      }
    });

    return this;
  }
}
