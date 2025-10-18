import * as d3 from 'd3';
import D3po from '../D3po.js';
import { validateData, showTooltip, hideTooltip } from '../utils.js';

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
      .style('opacity', 1)
      .on('mouseover', function (event, d) {
        const color = d3.color(d._originalColor);
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
        d3.select(this).attr('fill', highlightColor);

        const percentage = ((d.value / total) * 100).toFixed(1);

        showTooltip(
          event,
          `<strong>${d.data.name}</strong>` +
            `Value: ${d.data.value}<br/>` +
            `Percentage: ${percentage}%`
        );
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Add text labels for category names
    cells
      .append('text')
      .attr('x', 5)
      .attr('y', 16)
      .text(d => d.data.name)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', d => getTextColor(d.data.color || '#999'))
      .attr('stroke', d => getTextStroke(d.data.color || '#999'))
      .attr('stroke-width', 0)
      .attr('paint-order', 'stroke')
      .attr('pointer-events', 'none')
      .each(function (d) {
        const bbox = this.getBBox();
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;
        // Remove if text doesn't fit in cell
        if (bbox.width > cellWidth - 10 || cellHeight < 20) {
          d3.select(this).remove();
        }
      });

    // Add percentage labels
    cells
      .append('text')
      .attr('x', 5)
      .attr('y', 32)
      .text(d => {
        const percentage = ((d.value / total) * 100).toFixed(1);
        return `${percentage}%`;
      })
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', d => getTextColor(d.data.color || '#999'))
      .attr('stroke', d => getTextStroke(d.data.color || '#999'))
      .attr('stroke-width', 0)
      .attr('paint-order', 'stroke')
      .attr('pointer-events', 'none')
      .each(function (d) {
        const bbox = this.getBBox();
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;
        // Remove if percentage doesn't fit in cell
        if (bbox.width > cellWidth - 10 || cellHeight < 35) {
          d3.select(this).remove();
        }
      });

    return this;
  }
}
