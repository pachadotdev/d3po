import * as d3 from 'd3';
import D3po from '../D3po.js';
import { showTooltip, hideTooltip } from '../utils.js';

/**
 * Network/Graph visualization
 * @augments D3po
 */
export default class Network extends D3po {
  /**
   * Creates a network visualization
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {Array} options.nodes - Array of node objects with id field
   * @param {Array} options.links - Array of link objects with source/target fields
   * @param {string} [options.size] - Size field name for nodes
   * @param {string} [options.color] - Color field name for nodes
   * @param {string} [options.layout] - Layout type (force, circle, grid)
   * @param {boolean} options.move - Whether nodes can be dragged and repositioned
   */
  constructor(container, options) {
    super(container, options);

    if (!options.nodes || !options.links) {
      throw new Error('Network requires nodes and links');
    }

    this.nodes = options.nodes;
    this.links = options.links;
    this.sizeField = options.size;
    this.colorField = options.color;
    this.layout = options.layout || 'force';
    this.movable = options.move !== undefined ? options.move : false;
  }

  /**
   * Renders the network
   * @returns {Network} This instance for chaining
   */
  render() {
    const width = this.getInnerWidth();
    const height = this.getInnerHeight();

    // Add clipping path to prevent overflow into title area
    const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    this.chart.attr('clip-path', `url(#${clipId})`);

    // Create size scale
    const sizeScale = this.sizeField
      ? d3
          .scaleSqrt()
          .domain(d3.extent(this.nodes, d => d[this.sizeField]))
          .range([5, 20])
      : () => 8;

    // Check if this is a manual layout (coordinates provided from R)
    const isManualLayout = this.options.layout === 'manual';
    
    if (isManualLayout) {
      // For manual layout, scale coordinates from R to fit the viewport
      const xExtent = d3.extent(this.nodes, d => d.x);
      const yExtent = d3.extent(this.nodes, d => d.y);
      const xRange = xExtent[1] - xExtent[0];
      const yRange = yExtent[1] - yExtent[0];
      
      // Check if coordinates are already in pixel space (roughly 0-width, 0-height)
      // vs. layout algorithm space (typically small values like -5 to +5)
      const needsScaling = xRange < width * 0.5 || yRange < height * 0.5;
      
      if (needsScaling) {
        // Use a fixed domain based on the actual extent with some padding
        // This ensures consistent scaling even when individual nodes are moved
        const xPadding = Math.max(xRange * 0.15, 0.5); // At least 0.5 units of padding
        const yPadding = Math.max(yRange * 0.15, 0.5);
        
        const xScale = d3.scaleLinear()
          .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
          .range([80, width - 80]); // More margin for labels
        
        const yScale = d3.scaleLinear()
          .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
          .range([80, height - 80]);
        
        // Scale and fix nodes at their positions
        this.nodes.forEach(d => {
          if (d.x === undefined || d.y === undefined) {
            d.x = width / 2;
            d.y = height / 2;
          } else {
            // Scale the coordinates to viewport
            d.x = xScale(d.x);
            d.y = yScale(d.y);
          }
          // Fix nodes at their scaled positions
          d.fx = d.x;
          d.fy = d.y;
        });
        
      } else {
        // Coordinates are already in pixel space, use them directly
        this.nodes.forEach(d => {
          if (d.x === undefined || d.y === undefined) {
            d.x = width / 2;
            d.y = height / 2;
          }
          // Fix nodes at their positions (already in pixel space)
          d.fx = d.x;
          d.fy = d.y;
        });
        
      }
    }
    
    // Create simulation
    const simulation = d3.forceSimulation(this.nodes);
    
    if (isManualLayout) {
      // For manual layouts, add minimal link force just to connect nodes
      // Use strength 0 so it doesn't move nodes
      simulation.force(
        'link',
        d3
          .forceLink(this.links)
          .id(d => d.id)
          .distance(0)
          .strength(0)
      );
      
      // Run simulation once to initialize link references, then stop
      simulation.tick();
      simulation.stop();
    } else {
      // For automatic layouts (fr, kk, etc.), use force simulation
      simulation
        .force(
          'link',
          d3
            .forceLink(this.links)
            .id(d => d.id)
            .distance(100)
        )
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'collision',
          d3.forceCollide().radius(d => sizeScale(d[this.sizeField] || 8) + 5)
        );
    }

    // Draw links
    const link = this.chart
      .selectAll('.link')
      .data(this.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 2);

    // Draw nodes
    const sizeField = this.sizeField;
    const colorField = this.colorField;

    const node = this.chart
      .selectAll('.node')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => sizeScale(d[this.sizeField] || 8))
      .attr('fill', d =>
        this.colorField
          ? d[this.colorField]
          : d3.interpolateViridis(Math.random())
      )
      .each(function (d) {
        // Store original color on the element's data
        d._originalColor = colorField
          ? d[colorField]
          : d3.interpolateViridis(Math.random());
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', this.movable ? 'move' : 'pointer');

    // Add drag behavior only if movable is true
    if (this.movable) {
      node.call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', event => {
            if (!event.active) simulation.alphaTarget(0);
            // Keep the node fixed at the dropped position
            // Don't set fx/fy to null - this keeps it where user placed it
          })
      );
    }

    // Save font settings for tooltip handlers
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

    node
      .on('mouseover', function (event, d) {
        const color = d3.color(d._originalColor);
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);

        d3.select(this).attr('fill', highlightColor);

        const tooltipContent =
          `<strong>${d.id || 'Node'}</strong>` +
          (sizeField ? `Size: ${d[sizeField]}` : '');

        showTooltip(event, tooltipContent, fontFamily, fontSize);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Add labels
    const labels = this.chart
      .selectAll('.label')
      .data(this.nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .text(d => d.id || '');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);

      labels.attr('x', d => d.x).attr('y', d => d.y);
    });

    // For manual layouts, immediately position elements
    if (isManualLayout) {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);

      labels.attr('x', d => d.x).attr('y', d => d.y);
    }

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5]) // Allow zoom from 50% to 500%
      .on('zoom', event => {
        // Apply transform to all network elements
        link.attr('transform', event.transform);
        node.attr('transform', event.transform);
        labels.attr('transform', event.transform);
      });

    this.svg.call(zoom);

    return this;
  }
}
