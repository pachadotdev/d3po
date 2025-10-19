import * as d3 from 'd3';
import D3po from '../D3po.js';
import { validateData, showTooltip, hideTooltip } from '../utils.js';

/**
 * Pie chart visualization
 * @augments D3po
 */
export default class PieChart extends D3po {
  /**
   * Creates a pie chart
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.size - Size field name
   * @param {string} options.group - Group field name
   * @param {string} [options.color] - Color field name
   * @param {boolean} [options.donut] - Whether to render as donut
   * @param {number} [options.innerRadius] - Inner radius ratio (0-1) for donut charts
   * @param {number} [options.startAngle] - Start angle in radians (default: 0)
   * @param {number} [options.endAngle] - End angle in radians (default: 2*PI)
   */
  constructor(container, options) {
    super(container, options);

    if (!options.size || !options.group) {
      throw new Error('Pie chart requires size and group fields');
    }

    this.sizeField = options.size;
    this.groupField = options.group;
    this.colorField = options.color;
    this.donut = options.donut || false;
    this.innerRadiusRatio =
      options.innerRadius !== undefined
        ? options.innerRadius
        : this.donut
          ? 0.5
          : 0;
    this.startAngle = options.startAngle !== undefined ? options.startAngle : 0;
    this.endAngle =
      options.endAngle !== undefined ? options.endAngle : 2 * Math.PI;
  }

  /**
   * Renders the pie chart
   * @returns {PieChart} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.sizeField, this.groupField]);

    const width = this.getInnerWidth();
    const height = this.getInnerHeight();
    
    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
      console.error('Invalid chart dimensions:', { width, height });
      return this;
    }
    
    const radius = Math.min(width, height) / 2;

    // Calculate the total angle range for percentage calculations
    const totalAngle = this.endAngle - this.startAngle;
    const isHalfChart = totalAngle <= Math.PI;

    // Calculate center position
    const centerX = this.options.margin.left + width / 2;
    
    // Adjust vertical position for half charts to use space better
    // For half charts, position the center so the chart uses available space
    let centerY;
    if (isHalfChart) {
      // For half charts, position based on whether it's top or bottom half
      if (this.startAngle < 0 && this.endAngle > 0) {
        // Bottom half (e.g., -π/2 to π/2)
        centerY = this.options.margin.top + radius;
      } else if (this.startAngle >= 0 && this.endAngle <= Math.PI) {
        // Top half
        centerY = this.options.margin.top + height - radius;
      } else {
        // Other half configurations
        centerY = this.options.margin.top + height / 2;
      }
    } else {
      // Full circle - center it vertically
      centerY = this.options.margin.top + height / 2;
    }

    // Move chart to center
    this.chart.attr(
      'transform',
      `translate(${centerX},${centerY})`
    );

    // Create pie layout
    const pie = d3
      .pie()
      .value(d => d[this.sizeField])
      .sort(null)
      .startAngle(this.startAngle)
      .endAngle(this.endAngle);

    // Create arc generator
    const arc = d3
      .arc()
      .innerRadius(radius * this.innerRadiusRatio)
      .outerRadius(radius);

    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

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

    // Capture field names for tooltips and labels
    const groupField = this.groupField;
    const sizeField = this.sizeField;
    const colorField = this.colorField;

    // Draw slices
    const slices = this.chart
      .selectAll('.slice')
      .data(pie(this.data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    const arcs = slices
      .append('path')
      .attr('d', arc)
      .attr('fill', d =>
        this.colorField
          ? d.data[this.colorField]
          : d3.interpolateViridis(Math.random())
      )
      .each(
        function (d) {
          // Store original color on the data
          d._originalColor = this.colorField
            ? d.data[this.colorField]
            : d3.select(this).attr('fill'); // Get the actual rendered color
        }.bind(this)
      )
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 1);

    // Save font settings for tooltip handlers
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

    arcs
      .on('mouseover', function (event, d) {
        const color = d3.color(d._originalColor);
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
        d3.select(this).attr('fill', highlightColor);

        showTooltip(
          event,
          `<strong>${d.data[groupField]}</strong>` +
            `Value: ${d.data[sizeField]}<br/>` +
            `Percentage: ${(((d.endAngle - d.startAngle) / totalAngle) * 100).toFixed(1)}%`,
          fontFamily,
          fontSize
        );
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Add category labels
    slices
      .append('text')
      .attr('transform', d => {
        const [x, y] = labelArc.centroid(d);
        return `translate(${x},${y - 8})`;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', d => {
        const color = colorField ? d.data[colorField] : '#999';
        return getTextColor(color);
      })
      .style('font-weight', 'bold')
      .text(d => {
        const percent = ((d.endAngle - d.startAngle) / totalAngle) * 100;
        return percent > 5 ? d.data[groupField] : '';
      });

    // Add percentage labels
    slices
      .append('text')
      .attr('transform', d => {
        const [x, y] = labelArc.centroid(d);
        return `translate(${x},${y + 8})`;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', d => {
        const color = colorField ? d.data[colorField] : '#999';
        return getTextColor(color);
      })
      .style('font-weight', 'bold')
      .text(d => {
        const percent = ((d.endAngle - d.startAngle) / totalAngle) * 100;
        return percent > 5 ? `${percent.toFixed(1)}%` : '';
      });

    return this;
  }
}
