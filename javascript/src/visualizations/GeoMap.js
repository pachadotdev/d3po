import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import D3po from '../D3po.js';
import {
  validateData,
  showTooltip,
  hideTooltip,
  getHighlightColor,
  escapeHtml,
  resolveTooltipFormatter,
} from '../utils.js';
import { normalizeColorString } from '../utils.js';

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
    this.gradient = options.gradient;
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

    // optional chart title (class `title`) placed above the plotting area
    // Match other visualizations by adding/updating the title on `this.chart`
    if (this.options && this.options.title) {
      const existingChartTitle = this.chart.select('text.title');
      if (!existingChartTitle.empty()) {
        existingChartTitle
          .attr('text-anchor', 'middle')
          .attr('x', this.getInnerWidth() / 2)
          .attr(
            'y',
            this.options.titleOffsetY ? this.options.titleOffsetY : -10
          )
          .style(
            'font-family',
            this.options && this.options.fontFamily
              ? this.options.fontFamily
              : null
          )
          .style(
            'font-size',
            this.options && this.options.titleFontSize
              ? `${this.options.titleFontSize}px`
              : this.options && this.options.fontSize
                ? `${Number(this.options.fontSize) + 2}px`
                : '16px'
          )
          .text(String(this.options.title));
      } else {
        this.chart
          .append('text')
          .attr('class', 'title')
          .attr('text-anchor', 'middle')
          .attr('x', this.getInnerWidth() / 2)
          .attr(
            'y',
            this.options.titleOffsetY ? this.options.titleOffsetY : -10
          )
          .style(
            'font-family',
            this.options && this.options.fontFamily
              ? this.options.fontFamily
              : null
          )
          .style(
            'font-size',
            this.options && this.options.titleFontSize
              ? `${this.options.titleFontSize}px`
              : this.options && this.options.fontSize
                ? `${Number(this.options.fontSize) + 2}px`
                : '16px'
          )
          .text(String(this.options.title));
      }
    }

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

    // If R provided a literal palette (array or named vector/object), handle it
    let paletteMap = null;
    let customGradientScale = null;

    if (
      Array.isArray(colorField) ||
      (colorField && typeof colorField === 'object')
    ) {
      const paletteArr = Array.isArray(colorField)
        ? colorField
        : Object.values(colorField || {});
      const palette = paletteArr.length ? paletteArr : null;

      if (palette) {
        if (this.gradient && sizeField) {
          // Create custom gradient scale using the provided palette colors
          const vals = Array.from(dataMap.values())
            .map(d => d && d[sizeField])
            .filter(v => typeof v === 'number' && !isNaN(v));

          if (vals.length > 0) {
            const min = d3.min(vals);
            const max = d3.max(vals);
            if (min !== undefined && max !== undefined && min !== max) {
              // Create interpolator from custom palette
              const normalizedPalette = palette.map(c =>
                normalizeColorString(c)
              );
              const customInterpolator =
                d3.interpolateRgbBasis(normalizedPalette);
              customGradientScale = d3
                .scaleSequential(customInterpolator)
                .domain([min, max]);
            } else if (min !== undefined && max !== undefined) {
              // degenerate domain: use middle color from palette
              const midIndex = Math.floor(palette.length / 2);
              customGradientScale = () =>
                normalizeColorString(palette[midIndex]);
            }
          }
        } else {
          // Discrete palette mapping (existing behavior)
          paletteMap = {};
          features.forEach((f, i) => {
            paletteMap[f.id] = normalizeColorString(
              palette[i % palette.length]
            );
          });
        }
      }
    }

    // If color is not provided but sizeField is numeric, build a choropleth scale
    let choroplethScale = null;
    if (!colorField && sizeField) {
      // collect numeric values from dataMap
      const vals = Array.from(dataMap.values())
        .map(d => d && d[sizeField])
        .filter(v => typeof v === 'number' && !isNaN(v));
      if (vals.length > 0) {
        const min = d3.min(vals);
        const max = d3.max(vals);
        if (min !== undefined && max !== undefined && min !== max) {
          choroplethScale = d3
            .scaleSequential(d3.interpolateViridis)
            .domain([min, max]);
        } else if (min !== undefined && max !== undefined) {
          // degenerate domain: use constant scale
          choroplethScale = () => d3.interpolateViridis(0.5);
        }
      }
    }

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
        if (customGradientScale) return customGradientScale(data[sizeField]);
        if (paletteMap) return paletteMap[d.id] || '#e0e0e0';
        if (typeof colorField === 'string') return data[colorField];
        if (choroplethScale) return choroplethScale(data[sizeField]);
        return '#69b3a2';
      })
      .each(function (d) {
        // Store original color on the element's data
        const data = dataMap.get(d.id);
        d._originalColor = data
          ? customGradientScale
            ? customGradientScale(data[sizeField])
            : paletteMap
              ? paletteMap[d.id]
              : typeof colorField === 'string'
                ? data[colorField]
                : choroplethScale
                  ? choroplethScale(data[sizeField])
                  : '#69b3a2'
          : '#e0e0e0';
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

        const fieldValue =
          tooltipField && typeof tooltipField === 'string'
            ? data[tooltipField] != null
              ? escapeHtml(data[tooltipField])
              : escapeHtml(d.id)
            : escapeHtml(d.id);
        const tooltipContent =
          `<strong>Region: ${fieldValue}</strong>` +
          (sizeField ? ` Value: ${escapeHtml(String(data[sizeField]))}` : '');

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

    // Add legend for choropleth on the right side when applicable
    if (choroplethScale || customGradientScale) {
      try {
        // Legend sizing and placement: moved slightly left, taller for longer gradient
        const legendWidth = 12;
        const legendHeight = Math.min(280, this.getInnerHeight() * 0.8); // increased length
        const svgLeft = this.options.margin.left || 0;
        // position the legend a bit inside the chart area (left of the previous right-edge placement)
        const legendX = svgLeft + this.getInnerWidth() - 36; // moved left by ~48px from right edge
        const legendY = this.options.margin.top + 40;

        const legendId = `legend-${Math.random().toString(36).substr(2, 9)}`;

        const defs = this.svg.select('defs') || this.svg.append('defs');
        const lg = defs
          .append('linearGradient')
          .attr('id', legendId)
          .attr('x1', '0%')
          .attr('y1', '100%')
          .attr('x2', '0%')
          .attr('y2', '0%');

        // create more stops for a smoother gradient
        const stops = 40;
        const activeScale = customGradientScale || choroplethScale;
        const domain = activeScale.domain ? activeScale.domain() : [0, 1];
        for (let i = 0; i <= stops; i++) {
          const t = i / stops;
          const v = domain[0] + t * (domain[1] - domain[0]);
          lg.append('stop')
            .attr('offset', `${t * 100}%`)
            .attr('stop-color', activeScale(v));
        }

        // draw legend group
        const legendGroup = this.svg
          .append('g')
          .attr('class', 'd3po-choropleth-legend')
          .attr('transform', `translate(${legendX},${legendY})`);

        // legend rect
        legendGroup
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .attr('fill', `url(#${legendId})`)
          .attr('stroke', '#999');

        // legend axis scale
        const scaleVals = d3
          .scaleLinear()
          .domain(domain)
          .range([legendHeight, 0]);
        const axis = d3.axisRight(scaleVals).ticks(5);
        legendGroup
          .append('g')
          .attr('transform', `translate(${legendWidth + 8},0)`) // slightly larger gap
          .call(axis)
          .selectAll('text')
          .style('font-size', '12px'); // larger tick text
      } catch (e) {
        // ignore legend errors
        void 0;
      }
    }

    return this;
  }
}
