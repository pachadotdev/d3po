import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import D3po from '../D3po.js';
import { validateData, showTooltip, hideTooltip, getHighlightColor, escapeHtml, resolveTooltipFormatter } from '../utils.js';

/**
 * Geographic map visualization
 * @augments D3po
 */
export default class GeoMap extends D3po {
  /**
   * Creates a geographic map
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.group - Group/ID field name
   * @param {object} options.map - TopoJSON map data
   * @param {string} [options.color] - Color field name
   * @param {string} [options.size] - Size/value field name
   * @param {string} [options.tooltip] - Tooltip field name
   */
  constructor(container, options) {
    super(container, options);

    if (!options.group || !options.map) {
      throw new Error('GeoMap requires group and map fields');
    }

    this.groupField = options.group;
    this.mapData = options.map;
    this.colorField = options.color;
    this.sizeField = options.size;
    this.tooltipField = options.tooltip;
  }

  /**
   * Renders the geographic map
   * @returns {GeoMap} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.groupField]);

    // Add clipping path to prevent overflow into title area
    const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.getInnerWidth())
      .attr('height', this.getInnerHeight());

    this.chart.attr('clip-path', `url(#${clipId})`);

    // Create data lookup
    const dataMap = new Map(this.data.map(d => [d[this.groupField], d]));

    // Extract features from TopoJSON
    const key = Object.keys(this.mapData.objects)[0];
    const features = topojson.feature(
      this.mapData,
      this.mapData.objects[key]
    ).features;

    // Create projection
    const projection = d3
      .geoMercator()
      .fitSize([this.getInnerWidth(), this.getInnerHeight()], {
        type: 'FeatureCollection',
        features: features,
      });

    const path = d3.geoPath().projection(projection);

    // Draw map
    const colorField = this.colorField;
    const tooltipField = this.tooltipField;
    const sizeField = this.sizeField;

    // resolve tooltip formatter: prefer compiled this.tooltip from base, then tooltipField/options
    let tooltipFormatter = null;
    if (typeof this.tooltip === 'function') {
      tooltipFormatter = this.tooltip;
    } else if (typeof tooltipField === 'function') {
      tooltipFormatter = tooltipField;
    } else if (typeof tooltipField === 'string') {
  const tf = resolveTooltipFormatter(null, tooltipField);
  if (tf) tooltipFormatter = tf;
    }

    const paths = this.chart
      .selectAll('.region')
      .data(features)
      .enter()
      .append('path')
      .attr('class', 'region')
      .attr('d', path)
      .attr('fill', d => {
        const data = dataMap.get(d.id);
        if (!data) return '#e0e0e0';
        return colorField ? data[colorField] : '#69b3a2';
      })
      .each(function (d) {
        // Store original color on the element's data
        const data = dataMap.get(d.id);
        d._originalColor =
          data && colorField ? data[colorField] : data ? '#69b3a2' : '#e0e0e0';
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('opacity', 1);

    // Save font settings for tooltip handlers
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

    paths
      .on('mouseover', function (event, d) {
  const highlightColor = getHighlightColor(d._originalColor);
  d3.select(this).attr('fill', highlightColor);

        const data = dataMap.get(d.id);
        if (!data) return;

        // If we have a tooltip formatter (function), prefer it. Call with (value, row)
        if (tooltipFormatter) {
          try {
            const content = tooltipFormatter(null, data);
            showTooltip(event, content, fontFamily, fontSize);
            return;
          } catch (e) {
            // fall through to default rendering
            void 0;
          }
        }

  const fieldValue = (tooltipField && typeof tooltipField === 'string') ? (data[tooltipField] != null ? escapeHtml(data[tooltipField]) : escapeHtml(d.id)) : escapeHtml(d.id);
  const tooltipContent = `<strong>Region: ${fieldValue}</strong>` + (sizeField ? ` Value: ${escapeHtml(String(data[sizeField]))}` : '');

        showTooltip(event, tooltipContent, fontFamily, fontSize);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on('zoom', event => {
        this.chart.selectAll('path').attr('transform', event.transform);
      });

    this.svg.call(zoom);

    return this;
  }
}
