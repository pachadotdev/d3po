import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  showTooltip,
  hideTooltip,
  getHighlightColor,
  escapeHtml,
  resolveTooltipFormatter,
  normalizeColorString,
} from '../utils.js';

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

        const xScale = d3
          .scaleLinear()
          .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
          .range([80, width - 80]); // More margin for labels

        const yScale = d3
          .scaleLinear()
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

    // If R provided a literal palette (array or named vector/object), build a palette map
    let paletteMap = null;
    if (
      Array.isArray(colorField) ||
      (colorField && typeof colorField === 'object')
    ) {
      const paletteArr = Array.isArray(colorField)
        ? colorField
        : Object.values(colorField || {});
      const palette = paletteArr.length ? paletteArr : null;
      if (palette) {
        paletteMap = {};
        // Use node index order to assign palette entries deterministically
        this.nodes.forEach((node, i) => {
          paletteMap[node.id] = normalizeColorString(
            palette[i % palette.length]
          );
        });
      }
    }

    const node = this.chart
      .selectAll('.node')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => sizeScale(d[this.sizeField] || 8))
      .attr('fill', d => {
        if (paletteMap) return paletteMap[d.id] || '#69b3a2';
        if (typeof colorField === 'string') return d[colorField] || '#69b3a2';
        return d3.interpolateViridis(Math.random());
      })
      .each(function (d) {
        // Store original color on the element's data
        d._originalColor = paletteMap
          ? paletteMap[d.id]
          : typeof colorField === 'string'
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

    // resolve tooltip formatter: prefer this.tooltip (from D3po base) then options.tooltip
    let tooltipFormatter = resolveTooltipFormatter(
      this.tooltip,
      this.options && this.options.tooltip
    );

    node
      .on('mouseover', function (event, d) {
        const highlightColor = getHighlightColor(d._originalColor);
        d3.select(this).attr('fill', highlightColor);

        // If a formatter is provided, use it: (value, row)
        if (tooltipFormatter) {
          try {
            const out = tooltipFormatter(null, d);
            if (out != null) {
              showTooltip(event, out, fontFamily, fontSize);
              return;
            }
          } catch (e) {
            // ignore and fall through to default
          }
        }

        // Default tooltip: match Treemap style but show the actual numeric field name (e.g., 'size: 10' or 'value: 20')
        const typeLabel = escapeHtml(d.id || 'Node');
        // Determine which numeric field to show: prefer explicit sizeField, then common names 'value' or 'size', then 'count'
        const numericFieldCandidates = [];
        if (sizeField) numericFieldCandidates.push(sizeField);
        numericFieldCandidates.push('value', 'size', 'count');

        let chosenField = null;
        let chosenValue = null;
        for (const f of numericFieldCandidates) {
          if (d[f] != null) {
            chosenField = f;
            chosenValue = d[f];
            break;
          }
        }

        let tooltipContent = `<strong>${typeLabel}</strong>`;
        if (chosenField != null) {
          tooltipContent += `${escapeHtml(String(chosenField))}: ${escapeHtml(String(chosenValue))}`;
        }
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
