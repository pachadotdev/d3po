import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import D3po from '../D3po.js';
import {
  showTooltip,
  hideTooltip,
  getHighlightColor,
  escapeHtml,
} from '../utils.js';
import { createColorScale } from '../colors.js';

/**
 * Geographic map visualization
 * @augments D3po
 */
export default class GeoMap extends D3po {
  constructor(container, options) {
    super(container, options);
    // expect geo data in options.geomap_data or this.data.geomap_data
    this.geom = options && options.geomap_data ? options.geomap_data : null;

    // Store field mappings from options
    this.groupField = options.group;
    this.sizeField = options.size;
    this.tooltipField = options.tooltip;
    this.colorField = options.color;
  }

  render() {
    const width = this.getInnerWidth();
    const height = this.getInnerHeight();

    // Prefer geomap_data passed via options then fallback to this.options.geomap_data
    const geo =
      this.options.geomap_data ||
      this.geom ||
      (this.data && this.data.geomap_data) ||
      null;
    if (!geo) {
      // nothing to draw
      return this;
    }

    // Clear previous content
    this.chart.selectAll('*').remove();

    // If topology (TopoJSON) was provided convert to GeoJSON features
    let features = geo.features;
    if (!features && geo.objects) {
      // topojson -> geojson
      const keys = Object.keys(geo.objects);
      if (keys.length > 0) {
        features = topojson.feature(geo, geo.objects[keys[0]]).features;
      }
    }

    if (!features) {
      return this;
    }

    // Calculate bounds manually and scale to fit
    const featureCollection = {
      type: 'FeatureCollection',
      features: features,
    };

    // Use null projection first to get raw bounds
    const rawPath = d3.geoPath().projection(null);
    const bounds = rawPath.bounds(featureCollection);

    // Reserve space for legend if gradient mode will be used
    // We need to check this early to adjust the map positioning
    const willShowLegend =
      (this.options.gradient ||
        (this.options.discrete_palette &&
          Array.isArray(this.options.discrete_palette) &&
          this.options.discrete_palette.length > 0)) &&
      this.sizeField &&
      this.data;

    // Allocate significant space for legend "column" - about 15% of width or minimum 100px
    const legendColumnWidth = willShowLegend ? Math.max(100, width * 0.15) : 0;

    // Adjust available width for map to leave space for legend column
    const mapWidth = width - legendColumnWidth;

    // Calculate scale and translate to fit in available space
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    // Use a factor to make the map more elongated vertically (taller)
    // This allows the map to stretch more vertically relative to horizontally
    const verticalFactor = 0.85; // Adjust this value: lower = more elongated vertically
    const scale = 1.0 / Math.max((dx / mapWidth) * verticalFactor, dy / height);

    // When reflecting Y, we need to adjust the Y translation
    // Center the map in the available space (left of legend)
    const translate = [
      mapWidth / 2 - scale * x,
      height / 2 + scale * y, // Changed from minus to plus for reflectY
    ];

    // Create projection with calculated parameters and flip Y-axis
    const projection = d3
      .geoIdentity()
      .reflectY(true) // Flip Y-axis so north is up
      .scale(scale)
      .translate(translate);

    const pathGen = d3.geoPath().projection(projection);

    // Build a lookup map from group field to data rows for tooltip information
    const dataMap = new Map();
    if (this.data && this.groupField) {
      this.data.forEach(row => {
        const key = row[this.groupField];
        if (key != null) {
          dataMap.set(String(key), row);
        }
      });
    }

    // Set up color scale
    let colorScale;
    let useDiscreteGradient = false;
    let isNamedVector = false;

    // Helper to check if colorField is a named vector (object with string keys/color values)
    const checkIsNamedVector = input => {
      if (!input || typeof input !== 'object' || Array.isArray(input))
        return false;
      const keys = Object.keys(input);
      return keys.length > 0 && keys.every(k => typeof input[k] === 'string');
    };

    // Check if colorField is a named vector for continent-based coloring
    if (checkIsNamedVector(this.colorField)) {
      isNamedVector = true;
      // Use createColorScale to handle named vector mapping
      // Pass the feature properties data so it can find continent field
      const mockData = features.map(f => f.properties).filter(p => p);
      colorScale = createColorScale(
        mockData,
        this.colorField,
        d3.scaleOrdinal(d3.schemeCategory10)
      );
    }

    // Check if a discrete palette is provided
    const hasDiscretePalette =
      this.options.discrete_palette &&
      Array.isArray(this.options.discrete_palette) &&
      this.options.discrete_palette.length > 0;

    if (
      hasDiscretePalette &&
      this.options.gradient &&
      this.sizeField &&
      this.data
    ) {
      // Continuous gradient with custom palette: interpolate between provided colors
      const colorPalette = this.options.discrete_palette;
      const values = this.data
        .map(d => d[this.sizeField])
        .filter(v => v != null && !isNaN(v));

      if (values.length > 0) {
        const extent = d3.extent(values);
        // Create interpolator from the custom palette
        const interpolator = d3.interpolateRgbBasis(colorPalette);
        colorScale = d3.scaleSequential(interpolator).domain(extent);
      }
    } else if (hasDiscretePalette && this.sizeField && this.data) {
      // Discrete gradient mode (no gradient flag): map custom palette to quantiles of size field
      const colorPalette = this.options.discrete_palette;
      const values = this.data
        .map(d => d[this.sizeField])
        .filter(v => v != null && !isNaN(v));

      if (values.length > 0) {
        // Use d3.scaleQuantile for automatic quantile-based binning
        // This will divide the data into N equal-sized groups where N = colorPalette.length
        colorScale = d3.scaleQuantile().domain(values).range(colorPalette);

        useDiscreteGradient = true;
      }
    } else if (this.options.gradient && this.sizeField && this.data) {
      // Gradient mode: use sequential color scale based on size field
      const values = this.data
        .map(d => d[this.sizeField])
        .filter(v => v != null);
      const extent = d3.extent(values);
      colorScale = d3.scaleSequential(d3.interpolateViridis).domain(extent);
    } else if (this.colorField && this.data) {
      // Explicit color field provided
      // Check if values look like colors (hex codes or color names)
      const uniqueValues = [...new Set(this.data.map(d => d[this.colorField]))];
      const looksLikeColors =
        uniqueValues.length > 0 &&
        uniqueValues.every(v => {
          if (typeof v !== 'string') return false;
          // Check for hex color
          return /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?([0-9A-Fa-f]{2})?$/.test(v);
        });

      if (looksLikeColors) {
        // Color field contains actual color values - use identity scale (no mapping)
        colorScale = null; // Will use values directly in the fill function
      } else {
        // Color field contains categories - map to color scheme
        colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueValues);
      }
    } else if (this.groupField && this.data) {
      // Default: color by group field
      const uniqueGroups = [...new Set(this.data.map(d => d[this.groupField]))];
      colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueGroups);
    }

    // Draw map group
    const g = this.chart.append('g').attr('class', 'map');

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8]) // Allow zooming from 1x to 8x
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    // Apply zoom to the SVG
    this.svg.call(zoom);

    const regions = g
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', pathGen)
      .attr('fill', d => {
        // Get the identifier for this feature
        const identifier =
          d.properties?.[this.groupField] ||
          d.properties?.region_iso ||
          d.properties?.name ||
          d.properties?.NAME;

        const dataRow = dataMap.get(String(identifier));

        if (colorScale) {
          if (isNamedVector) {
            // Named vector: pass the feature properties directly to colorScale
            // which will look up the continent field
            return colorScale(d.properties);
          } else if (useDiscreteGradient && this.sizeField && dataRow) {
            // Discrete gradient: color by size value using quantile-based palette
            return colorScale(dataRow[this.sizeField]);
          } else if (this.options.gradient && this.sizeField && dataRow) {
            // Gradient: color by size value
            return colorScale(dataRow[this.sizeField]);
          } else if (this.colorField && dataRow) {
            // Color by explicit color field using scale
            return colorScale(dataRow[this.colorField]);
          } else if (identifier) {
            // Default: color by group
            return colorScale(identifier);
          }
        } else if (this.colorField && dataRow && dataRow[this.colorField]) {
          // Color field with no scale means direct color values
          return dataRow[this.colorField];
        }

        // Fallback to default fill
        return this.options.fill || '#cce5df';
      })
      .attr('stroke', this.options.stroke || '#333')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // Add legend if in gradient or discrete gradient mode
    if (
      (this.options.gradient || useDiscreteGradient) &&
      colorScale &&
      this.sizeField
    ) {
      const legendWidth = 20;
      const legendHeight = 200;
      const legendX = width - legendWidth - 10;
      const legendY = (height - legendHeight) / 2; // Center vertically

      const legend = this.chart
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX}, ${legendY})`);

      if (useDiscreteGradient) {
        // Discrete gradient legend: show color blocks for each quantile
        const colorPalette = this.options.discrete_palette;
        const blockHeight = legendHeight / colorPalette.length;

        // Get quantiles from the scale
        const quantiles = colorScale.quantiles();

        // Get min and max values
        const values = this.data
          .map(d => d[this.sizeField])
          .filter(v => v != null && !isNaN(v));
        const minVal = d3.min(values);
        const maxVal = d3.max(values);

        // Draw color blocks
        colorPalette.forEach((color, i) => {
          legend
            .append('rect')
            .attr('x', 0)
            .attr('y', legendHeight - (i + 1) * blockHeight)
            .attr('width', legendWidth)
            .attr('height', blockHeight)
            .style('fill', color)
            .style('stroke', '#333')
            .style('stroke-width', 0.5);
        });

        // Add labels for quantile boundaries
        // For N colors, we have N-1 quantile boundaries, plus min and max
        const boundaries = [minVal, ...quantiles, maxVal];
        boundaries.forEach((val, i) => {
          const y = legendHeight - i * blockHeight;
          legend
            .append('text')
            .attr('x', legendWidth + 5)
            .attr('y', y)
            .attr('dy', '0.3em')
            .style('font-size', this.options.fontSize || '10px')
            .style('font-family', this.options.fontFamily || 'sans-serif')
            .text(d3.format('.1f')(val));
        });
      } else {
        // Continuous gradient legend
        // Create gradient definition
        const defs = this.svg.append('defs');
        const linearGradient = defs
          .append('linearGradient')
          .attr('id', `gradient-${this.container.id}`)
          .attr('x1', '0%')
          .attr('y1', '100%')
          .attr('x2', '0%')
          .attr('y2', '0%');

        // Add color stops
        const stops = 10;
        for (let i = 0; i <= stops; i++) {
          const t = i / stops;
          linearGradient
            .append('stop')
            .attr('offset', `${t * 100}%`)
            .attr(
              'stop-color',
              colorScale(
                colorScale.domain()[0] +
                  t * (colorScale.domain()[1] - colorScale.domain()[0])
              )
            );
        }

        // Draw legend rectangle
        legend
          .append('rect')
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .style('fill', `url(#gradient-${this.container.id})`)
          .style('stroke', '#333')
          .style('stroke-width', 1);

        // Add scale labels
        const legendScale = d3
          .scaleLinear()
          .domain(colorScale.domain())
          .range([legendHeight, 0]);

        const legendAxis = d3
          .axisRight(legendScale)
          .ticks(5)
          .tickFormat(d3.format('.0f'));

        legend
          .append('g')
          .attr('transform', `translate(${legendWidth}, 0)`)
          .call(legendAxis)
          .style('font-size', this.options.fontSize || '12px')
          .style('font-family', this.options.fontFamily || 'sans-serif');
      }
    }

    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;
    const self = this;

    regions
      .on('mouseover', function (event, d) {
        const el = d3.select(this);
        const orig = el.attr('fill');
        // Store original color on the element
        el.attr('data-original-fill', orig);
        const highlight = getHighlightColor(orig);
        el.attr('fill', highlight);

        // Try to get the identifier from properties - check multiple possible fields
        const identifier =
          (d.properties &&
            (d.properties[self.groupField] || // Try the group field first (e.g., region_iso)
              d.properties.region_iso ||
              d.properties.name ||
              d.properties.NAME ||
              d.properties.id)) ||
          'Region';

        // Look up corresponding data row for this feature using the group field value
        const dataRow = dataMap.get(String(identifier));

        // Build tooltip content - use the tooltip field if available, otherwise the identifier
        const displayName =
          dataRow && self.tooltipField && dataRow[self.tooltipField]
            ? dataRow[self.tooltipField]
            : identifier;

        let content = `<strong>${escapeHtml(String(displayName))}</strong>`;

        if (dataRow) {
          // Add size field if available
          if (self.sizeField && dataRow[self.sizeField] != null) {
            content += `Value: ${escapeHtml(String(dataRow[self.sizeField]))}`;
          }
        }

        showTooltip(event, content, fontFamily, fontSize);
      })
      .on('mouseout', function () {
        const el = d3.select(this);
        // Restore the original color
        const originalFill = el.attr('data-original-fill');
        if (originalFill) {
          el.attr('fill', originalFill);
        }
        hideTooltip();
      });

    return this;
  }
}
