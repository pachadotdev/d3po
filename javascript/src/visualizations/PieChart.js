import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  showTooltip,
  hideTooltip,
  getTextColor,
  getHighlightColor,
  normalizeColorString,
  resolveTooltipFormatter,
  showTooltipWithFormatter,
} from '../utils.js';

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
    // labelMode: 'percent' (default) or 'count' — controls inner labels
    this.labelMode = options.labelMode || 'percent';
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

    // Calculate center position
    const centerX = this.options.margin.left + width / 2;
    const centerY = this.options.margin.top + height / 2;

    // Move chart to center
    this.chart.attr('transform', `translate(${centerX},${centerY})`);

    // Create pie layout
    const pie = d3
      .pie()
      .value(d => d[this.sizeField])
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc()
      .innerRadius(radius * this.innerRadiusRatio)
      .outerRadius(radius);

    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    // use shared getTextColor/getHighlightColor from utils

    // Capture field names for tooltips and labels
    const groupField = this.groupField;
    const sizeField = this.sizeField;
    const colorField = this.colorField;
    // preserve class instance for inner DOM callbacks
    const self = this;

    // Build palette map when user provides an explicit palette (array or named vector/object)
    let paletteMap = null;
    if (
      Array.isArray(this.colorField) ||
      (this.colorField && typeof this.colorField === 'object')
    ) {
      const paletteArr = Array.isArray(this.colorField)
        ? this.colorField
        : Object.values(this.colorField || {});
      const palette = paletteArr.length ? paletteArr : null;
      if (palette) {
        paletteMap = {};
        // unique group keys in data order
        const grpKeys = [...new Set(this.data.map(d => d[groupField]))];
        grpKeys.forEach((g, i) => {
          paletteMap[g] = normalizeColorString(palette[i % palette.length]);
        });
      }
    }

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
      .attr('fill', d => {
        if (paletteMap)
          return paletteMap[d.data[groupField]] || Object.values(paletteMap)[0];
        if (colorField && typeof colorField === 'string')
          return normalizeColorString(d.data[colorField]);
        return d3.interpolateViridis(Math.random());
      })
      .each(function (d) {
        // Store original color on the data. Keep `this` as DOM element.
        if (paletteMap) d._originalColor = paletteMap[d.data[groupField]];
        else if (colorField && typeof colorField === 'string')
          d._originalColor = normalizeColorString(d.data[colorField]);
        else d._originalColor = d3.select(this).attr('fill'); // Get the actual rendered color
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 1);

    // Save font settings for tooltip handlers
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

    // Tooltip formatter: prefer compiled this.tooltip from base, otherwise evaluate options.tooltip
    var tooltipFormatter = resolveTooltipFormatter(
      this.tooltip,
      this.options && this.options.tooltip
    );

    arcs
      .on('mouseover', function (event, d) {
        const highlightColor = getHighlightColor(d._originalColor);
        d3.select(this).attr('fill', highlightColor);

        if (tooltipFormatter) {
          try {
            // Compute percentage relative to total data values (as 0-100)
            var pct = 0;
            try {
              // Prefer using numeric size field if available
              var total = 0;
              // data may be in outer scope; if not, derive from current d3 selection
              if (Array.isArray(d.data.__pie_source__)) {
                total = d.data.__pie_source__.reduce(
                  (s, x) => s + (x[sizeField] || 0),
                  0
                );
              } else if (this && this.data) {
                total = this.data.reduce((s, x) => s + (x[sizeField] || 0), 0);
              } else {
                // Fallback: derive from arc angles (full circle)
                pct = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
              }
              if (total > 0) {
                pct = (d.data[sizeField] / total) * 100;
              }
            } catch (e) {
              pct = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
            }

            // For consistency with other charts, call formatter as (value, row)
            const fallback = () =>
              `<strong>${d.data[groupField]}</strong>` +
              `Value: ${d.data[sizeField]}<br/>` +
              `Percentage: ${(((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100).toFixed(1)}%`;
            showTooltipWithFormatter(
              event,
              tooltipFormatter,
              pct,
              d.data,
              fontFamily,
              fontSize,
              fallback
            );
            return;
          } catch (e) {
            console.warn('PieChart: tooltip formatter failed', e);
            // fallthrough to default content
          }
        }

        showTooltip(
          event,
          `<strong>${d.data[groupField]}</strong>` +
            `Value: ${d.data[sizeField]}<br/>` +
            `Percentage: ${(((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100).toFixed(1)}%`,
          fontFamily,
          fontSize
        );
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Add labels inside slices. If labelMode === 'count' render two lines:
    // line 1 = category, line 2 = count. Otherwise fall back to previous
    // single-line behavior (category when percent > 5).
    const labelText = slices
      .append('text')
      .attr('transform', d => {
        const [x, y] = labelArc.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', d => {
        const color = colorField ? d.data[colorField] : '#999';
        return getTextColor(color);
      })
      .style('font-weight', 'bold');

    labelText.each(function (d) {
      const node = d3.select(this);
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
      // clear any existing content
      node.selectAll('*').remove();

      if (self.labelMode === 'count') {
        // first line: category
        node
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '-6')
          .text(d.data[groupField] || '');
        // second line: count
        node
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '14')
          .text(d.data[sizeField] != null ? d.data[sizeField].toString() : '');
      } else {
        // default behavior: show category + percent (two lines) when percent > 5
        if (percent > 5) {
          node
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '-6')
            .text(d.data[groupField] || '');
          node
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '14')
            .text(`${percent.toFixed(1)}%`);
        }
      }

      // Measure and hide if label is too wide for the slice arc
      try {
        const bbox = node.node().getBBox();
        const textWidth = bbox.width || 0;
        const labelRadius = radius * 0.7; // same radius used for labelArc
        const arcLen = (d.endAngle - d.startAngle) * labelRadius;
        // hide if text width exceeds available arc length (with small padding)
        if (textWidth > arcLen * 0.9) {
          node.style('display', 'none');
        }
      } catch (e) {
        // ignore measurement errors
      }
    });

    return this;
  }
}
