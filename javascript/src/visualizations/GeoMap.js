import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import D3po from '../D3po.js';
import {
  showTooltip,
  hideTooltip,
  getHighlightColor,
  escapeHtml,
} from '../utils.js';

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
    const geo = this.options.geomap_data || this.geom || this.data && this.data.geomap_data || null;
    if (!geo) {
      // nothing to draw
      console.warn('[GeoMap] No geo data found');
      return this;
    }

    console.log('[GeoMap] Geo data received:', geo);
    console.log('[GeoMap] Type:', geo.type);
    console.log('[GeoMap] Has features?', !!geo.features);
    console.log('[GeoMap] Has objects?', !!geo.objects);

    // Clear previous content
    this.chart.selectAll('*').remove();

    // If topology (TopoJSON) was provided convert to GeoJSON features
    let features = geo.features;
    if (!features && geo.objects) {
      // topojson -> geojson
      const keys = Object.keys(geo.objects);
      console.log('[GeoMap] TopoJSON objects keys:', keys);
      if (keys.length > 0) {
        features = topojson.feature(geo, geo.objects[keys[0]]).features;
      }
    }

    if (!features) {
      console.warn('[GeoMap] No features found after processing');
      return this;
    }

    console.log('[GeoMap] Number of features:', features.length);
    if (features.length > 0) {
      console.log('[GeoMap] First feature:', features[0]);
      console.log('[GeoMap] First feature geometry type:', features[0].geometry?.type);
      console.log('[GeoMap] First feature properties:', features[0].properties);
      
      // Log ALL feature names to see what we actually have
      console.log('[GeoMap] All feature names:');
      features.forEach((f, i) => {
        const name = f.properties?.region || f.properties?.name || f.properties?.region_iso || 'unknown';
        const geomType = f.geometry?.type;
        const coordsLength = f.geometry?.coordinates?.length;
        console.log(`  [${i}] ${name} (${geomType}, ${coordsLength} coord arrays)`);
      });
      
      if (features[0].geometry?.coordinates) {
        console.log('[GeoMap] First feature coords structure:', 
          Array.isArray(features[0].geometry.coordinates) ? 
          `Array length: ${features[0].geometry.coordinates.length}` : 
          'Not an array');
        if (Array.isArray(features[0].geometry.coordinates) && features[0].geometry.coordinates.length > 0) {
          console.log('[GeoMap] First coordinate element type:', 
            Array.isArray(features[0].geometry.coordinates[0]) ? 
            `Array length: ${features[0].geometry.coordinates[0].length}` : 
            typeof features[0].geometry.coordinates[0]);
        }
      }
    }

    // Calculate bounds manually and scale to fit
    const featureCollection = {
      type: 'FeatureCollection',
      features: features
    };
    
    console.log('[GeoMap] Creating projection with manual bounds calculation');
    console.log('[GeoMap] Inner width:', width, 'Inner height:', height);
    console.log('[GeoMap] Number of features to render:', features.length);
    
    // Use null projection first to get raw bounds
    const rawPath = d3.geoPath().projection(null);
    const bounds = rawPath.bounds(featureCollection);
    
    // Calculate scale and translate to fit in available space
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    
    const scale = 0.9 / Math.max(dx / width, dy / height);
    const translate = [width / 2 - scale * x, height / 2 - scale * y];
    
    console.log('[GeoMap] Bounds:', bounds);
    console.log('[GeoMap] Scale:', scale, 'Translate:', translate);
    
    // Create projection with calculated parameters
    const projection = d3.geoIdentity()
      .scale(scale)
      .translate(translate);
    
    const pathGen = d3.geoPath().projection(projection);

    // Debug: Test path generation for first feature
    if (features.length > 0) {
      const testPath1 = pathGen(features[0]);
      console.log('[GeoMap] Test path for first feature (first 400 chars):', testPath1?.substring(0, 400));
      console.log('[GeoMap] Test path for first feature (FULL LENGTH):', testPath1?.length);
      
      // Check if the path has multiple disconnected regions (look for 'M' commands)
      const mCount = (testPath1?.match(/M/g) || []).length;
      console.log('[GeoMap] Number of M commands in first feature path:', mCount);
    }

    // Build a lookup map from group field to data rows for tooltip information
    const dataMap = new Map();
    if (this.data && this.groupField) {
      this.data.forEach(row => {
        const key = row[this.groupField];
        if (key != null) {
          dataMap.set(String(key), row);
        }
      });
      console.log('[GeoMap] Data map created with', dataMap.size, 'entries');
    }

    // Set up color scale
    let colorScale;
    if (this.options.gradient && this.sizeField && this.data) {
      // Gradient mode: use sequential color scale based on size field
      const values = this.data.map(d => d[this.sizeField]).filter(v => v != null);
      const extent = d3.extent(values);
      colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain(extent);
      console.log('[GeoMap] Using gradient scale, domain:', extent);
    } else if (this.colorField && this.data) {
      // Explicit color field provided
      const uniqueValues = [...new Set(this.data.map(d => d[this.colorField]))];
      colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(uniqueValues);
      console.log('[GeoMap] Using color field scale');
    } else if (this.groupField && this.data) {
      // Default: color by group field
      const uniqueGroups = [...new Set(this.data.map(d => d[this.groupField]))];
      colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(uniqueGroups);
      console.log('[GeoMap] Using default group-based coloring');
    }

    // Draw map group
    const g = this.chart.append('g').attr('class', 'map');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])  // Allow zooming from 1x to 8x
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    // Apply zoom to the SVG
    this.svg.call(zoom);

    const regions = g
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', (d, i) => {
        const path = pathGen(d);
        if (i < 3) {  // Log first 3 paths
          const name = d.properties?.region || d.properties?.name || 'unknown';
          console.log(`[GeoMap] Path ${i} (${name}):`);
          console.log(`  Length: ${path?.length || 0}`);
          console.log(`  First 300 chars: ${path?.substring(0, 300)}`);
          console.log(`  Last 300 chars: ${path?.substring(Math.max(0, (path?.length || 0) - 300))}`);
          const mCount = (path?.match(/M/g) || []).length;
          console.log(`  M commands (polygons): ${mCount}`);
        }
        return path;
      })
      .attr('fill', (d) => {
        // Get the identifier for this feature
        const identifier = d.properties?.[this.groupField] ||
          d.properties?.region_iso ||
          d.properties?.name ||
          d.properties?.NAME;
        
        const dataRow = dataMap.get(String(identifier));
        
        if (colorScale) {
          if (this.options.gradient && this.sizeField && dataRow) {
            // Gradient: color by size value
            return colorScale(dataRow[this.sizeField]);
          } else if (this.colorField && dataRow) {
            // Color by explicit color field
            return colorScale(dataRow[this.colorField]);
          } else if (identifier) {
            // Default: color by group
            return colorScale(identifier);
          }
        }
        
        // Fallback to default fill
        return this.options.fill || '#cce5df';
      })
      .attr('stroke', this.options.stroke || '#333')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    console.log('[GeoMap] Number of path elements created:', regions.size());
    console.log('[GeoMap] Total paths in chart after render:', this.chart.selectAll('path').size());

    // Add gradient legend if in gradient mode
    if (this.options.gradient && colorScale && this.sizeField) {
      const legendWidth = 20;
      const legendHeight = 200;
      const legendX = width - legendWidth - 10;
      const legendY = 20;
      
      const legend = this.chart.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX}, ${legendY})`);
      
      // Create gradient definition
      const defs = this.svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', `gradient-${this.container.id}`)
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');
      
      // Add color stops
      const stops = 10;
      for (let i = 0; i <= stops; i++) {
        const t = i / stops;
        linearGradient.append('stop')
          .attr('offset', `${t * 100}%`)
          .attr('stop-color', colorScale(colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0])));
      }
      
      // Draw legend rectangle
      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', `url(#gradient-${this.container.id})`)
        .style('stroke', '#333')
        .style('stroke-width', 1);
      
      // Add scale labels
      const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([legendHeight, 0]);
      
      const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d3.format('.0f'));
      
      legend.append('g')
        .attr('transform', `translate(${legendWidth}, 0)`)
        .call(legendAxis)
        .style('font-size', this.options.fontSize || '12px')
        .style('font-family', this.options.fontFamily || 'sans-serif');
    }

    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;
    const self = this;

    regions
      .on('mouseover', function (event, d) {
        const el = d3.select(this);
        const orig = el.attr('fill');
        const highlight = getHighlightColor(orig);
        el.attr('fill', highlight);

        // Try to get the identifier from properties - check multiple possible fields
        const identifier = (d.properties && (
          d.properties[self.groupField] ||  // Try the group field first (e.g., region_iso)
          d.properties.region_iso ||
          d.properties.name || 
          d.properties.NAME || 
          d.properties.id
        )) || 'Region';
        
        // Look up corresponding data row for this feature using the group field value
        const dataRow = dataMap.get(String(identifier));
        
        // Build tooltip content - use the tooltip field if available, otherwise the identifier
        const displayName = dataRow && self.tooltipField && dataRow[self.tooltipField] 
          ? dataRow[self.tooltipField] 
          : identifier;
        
        let content = `<strong>${escapeHtml(String(displayName))}</strong>`;
        
        if (dataRow) {
          // Add size field if available
          if (self.sizeField && dataRow[self.sizeField] != null) {
            content += `<br/>Value: ${escapeHtml(String(dataRow[self.sizeField]))}`;
          }
        }
        
        showTooltip(event, content, fontFamily, fontSize);
      })
      .on('mouseout', function () {
        const el = d3.select(this);
        el.attr('fill', self.options.fill || '#cce5df');
        hideTooltip();
      });

    return this;
  }
}
