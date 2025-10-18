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
  }

  /**
   * Renders the network
   * @returns {Network} This instance for chaining
   */
  render() {
    const width = this.getInnerWidth();
    const height = this.getInnerHeight();

    // Create size scale
    const sizeScale = this.sizeField
      ? d3
          .scaleSqrt()
          .domain(d3.extent(this.nodes, d => d[this.sizeField]))
          .range([5, 20])
      : () => 8;

    // Create simulation
    const simulation = d3
      .forceSimulation(this.nodes)
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
      .style('cursor', 'pointer')
      .call(
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
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
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

        showTooltip(event, tooltipContent);
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

    return this;
  }
}
