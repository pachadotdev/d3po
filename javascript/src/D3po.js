import * as d3 from 'd3';
import { validateData } from './utils.js';

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
      ...options,
    };

    this.data = null;
    this.svg = null;
    this.chart = null;

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

    // Add title if provided
    if (this.options.title) {
      this.svg
        .append('text')
        .attr('x', this.options.width / 2)
        .attr('y', this.options.margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', `${this.options.fontSize * 1.5}px`)
        .style('font-weight', 'bold')
        .text(this.options.title);
    }

    // Create main chart group
    this.chart = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.options.margin.left},${this.options.margin.top})`
      );

    // Add download functionality
    this._addDownloadButtons();
  }

  /**
   * Adds download buttons for SVG/PNG export
   * @private
   */
  _addDownloadButtons() {
    const buttonGroup = this.svg
      .append('g')
      .attr('class', 'd3po-download-buttons')
      .attr(
        'transform',
        `translate(${this.options.width - 100}, ${this.options.margin.top / 2})`
      );

    // SVG download button
    buttonGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .text('📥 SVG')
      .on('click', () => this.downloadSVG());

    // PNG download button
    buttonGroup
      .append('text')
      .attr('x', 50)
      .attr('y', 0)
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .text('📥 PNG')
      .on('click', () => this.downloadPNG());
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
    this.svg.select('text').text(title);
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
   * @returns {D3po} This instance for chaining
   */
  setFont(fontFamily, fontSize) {
    this.options.fontFamily = fontFamily;
    this.options.fontSize = fontSize;
    this.svg
      .style('font-family', fontFamily)
      .style('font-size', `${fontSize}px`);
    return this;
  }

  /**
   * Downloads the chart as SVG
   */
  downloadSVG() {
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'd3po-chart.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Downloads the chart as PNG
   */
  downloadPNG() {
    const svgNode = this.svg.node();

    // Clone the SVG and remove download buttons
    const clonedSvg = svgNode.cloneNode(true);
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
      ctx.fillStyle = this.options.background || 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'd3po-chart.png';
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.onerror = error => {
      console.error('Failed to load SVG into image:', error);
      alert('PNG export failed. Please try SVG export instead.');
    };

    // Use unescape and encodeURIComponent for proper UTF-8 encoding
    const base64 = btoa(unescape(encodeURIComponent(svgData)));
    img.src = 'data:image/svg+xml;base64,' + base64;
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
    this.svg
      .attr('width', width)
      .attr('height', height);

    // Update title position
    if (this.options.title) {
      this.svg.select('text')
        .attr('x', width / 2);
    }

    // Update download buttons position
    this.svg.select('.d3po-download-buttons')
      .attr('transform', `translate(${width - 100}, ${this.options.margin.top / 2})`);

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
  }
}
