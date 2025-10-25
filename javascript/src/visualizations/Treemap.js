import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  showTooltip,
  hideTooltip,
  maybeEvalJSFormatter,
  getTextColor,
  getHighlightColor,
  escapeHtml,
  resolveTooltipFormatter,
} from '../utils.js';

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
   * @param {object} [options.labels] - Label positioning options
   */
  constructor(container, options) {
    super(container, options);

    if (!options.size || !options.group) {
      throw new Error('Treemap requires size and group fields');
    }

    this.sizeField = options.size;
    this.groupField = options.group;
    this.colorField = options.color;
    this.subgroupField = options.subgroup; // NEW: optional subgroup
    // accept string name for tiling (e.g., 'squarify' or 'binary') or a function
    if (typeof options.tile === 'string') {
      this.tile =
        options.tile === 'binary' ? d3.treemapBinary : d3.treemapSquarify;
    } else {
      this.tile = options.tile || d3.treemapSquarify;
    }
    // labels may be an object with positioning (align/valign) and a
    // `fields` entry that can be a JS(...) formatter string/function.
    // Ensure `this.labels` is an object used for positioning while keeping
    // the raw formatter option separate so we can compile it.
    this.labels =
      options.labels && typeof options.labels === 'object'
        ? options.labels
        : { align: 'left', valign: 'top' };
    // compile a labels formatter if provided. The R side stores the
    // formatter under options.labels.fields; support `.formatter` or the
    // direct `options.labels` entry as well for flexibility.
    this.labelsOption = null;
    if (options.labels) {
      this.labelsOption =
        options.labels.fields || options.labels.formatter || options.labels;
    }
    this.labelsFormatter = maybeEvalJSFormatter(this.labelsOption);
    // labelMode: 'percent' (default) or 'count'
    this.labelMode = options.labelMode || 'percent';
    // subtitle can be provided in labels as a string or JS(...) formatter
    this.subtitleOption =
      options.labels && options.labels.subtitle
        ? options.labels.subtitle
        : null;
    this.subtitleFormatter = maybeEvalJSFormatter(this.subtitleOption);

    // helper to compute subtitle text based on mode and node context
    // mode: 'aggregated' | 'flat' | 'drilled'
    this.getSubtitleText = (mode, node) => {
      if (this.subtitleFormatter) {
        try {
          // call compiled formatter with (value, row) signature; provide a
          // row object with contextual fields so R-side formatters can use it.
          const ctx = {
            mode: mode,
            nodeName:
              node && node.data && node.data.name ? node.data.name : null,
            groupField: this.groupField,
            subgroupField: this.subgroupField,
          };
          const out = this.subtitleFormatter(null, ctx);
          if (out != null) return out;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Subtitle formatter error', err);
        }
      }

      // Fallback behavior: keep existing defaults
      if (mode === 'aggregated') return this.groupField;
      if (mode === 'flat') return this.groupField;
      return this.subgroupField || this.groupField;
    };
    // tooltip can be a JS(...) string, a compiled this.tooltip from base, or a function; resolve with helper
    this.tooltipFormatter = resolveTooltipFormatter(
      this.tooltip,
      options && options.tooltip
    );
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

    // Prepare hierarchical data. If a subgroup is provided, build a two-level
    // hierarchy: root -> groups -> subgroups (leaves). Otherwise build a
    // single-level hierarchy (one leaf per group).
    let hierarchyData;
    if (this.subgroupField) {
      // group by groupField then subgroupField
      const map = new Map();
      this.data.forEach(d => {
        const g = d[this.groupField];
        const sg = d[this.subgroupField] || 'None';
        const color = this.colorField ? d[this.colorField] : null;
        const key = `${g}|||${sg}`;
        // accumulate counts for subgroup leaves (sizeField assumed numeric count)
        if (!map.has(key))
          map.set(key, { group: g, subgroup: sg, color, value: 0, rows: [] });
        const entry = map.get(key);
        entry.value += Number(d[this.sizeField]) || 0;
        entry.rows.push(d);
      });

      const groups = new Map();
      for (const entry of map.values()) {
        if (!groups.has(entry.group))
          groups.set(entry.group, { name: entry.group, children: [] });
        groups.get(entry.group).children.push({
          name: entry.subgroup,
          value: entry.value,
          color: entry.color,
          __rows: entry.rows,
        });
      }

      hierarchyData = { children: Array.from(groups.values()) };
    } else {
      hierarchyData = {
        children: this.data.map(d => ({
          name: d[this.groupField],
          value: d[this.sizeField],
          color: this.colorField ? d[this.colorField] : null,
          __row: d,
        })),
      };
    }

    const fullRoot = d3.hierarchy(hierarchyData).sum(d => d.value);

    // Create treemap layout builder
    const treemap = d3
      .treemap()
      .tile(this.tile)
      .size([this.getInnerWidth(), this.getInnerHeight()])
      .padding(2)
      .round(true);

    // If subgroupField provided, build an aggregated group root for top-level
    let groupRoot = null;
    if (this.subgroupField) {
      // Build an aggregated groups array where each group is a single leaf
      // with value equal to the sum of its subgroups. This ensures the
      // top-level treemap draws one rectangle per group.
      const aggregated = hierarchyData.children.map(g => {
        const sum = (g.children || []).reduce((s, c) => s + (c.value || 0), 0);
        // choose a representative color (first child's color) if available
        const color =
          g.children && g.children.length && g.children[0].color
            ? g.children[0].color
            : null;
        return { name: g.name, value: sum, color, isAggregated: true };
      });
      groupRoot = d3.hierarchy({ children: aggregated }).sum(d => d.value || 0);
      // compute layout for aggregated groups
      treemap(groupRoot);
    }

    // always compute full layout for drill-in
    treemap(fullRoot);

    // keep a reference to current root for drill-in/out
    // start at aggregated groups if available, otherwise at full root
    let currentRoot = groupRoot || fullRoot;

    // Calculate total for percentage (top-level total from full data)
    const total = fullRoot.value;

    // use shared getTextColor/getHighlightColor from utils
    const getTextStroke = bgColor =>
      getTextColor(bgColor) === 'black' ? 'white' : 'black';

    // Draw rectangles. If subgroupField is provided show aggregated groupRoot children
    // (one rectangle per group). Otherwise show leaves.
    let initialNodes;
    if (this.subgroupField && groupRoot && groupRoot.children) {
      // Show aggregated groups (one rectangle per Type1)
      initialNodes = groupRoot.children;
    } else {
      // Show all leaves (flat view)
      initialNodes = fullRoot.leaves();
    }

    // Store original color on each node in initialNodes
    initialNodes.forEach(d => {
      if (!d._originalColor) {
        d._originalColor = d.data.color || d3.interpolateViridis(Math.random());
      }
    });

    const cells = this.chart
      .selectAll('.cell')
      .data(initialNodes)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cells
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => d._originalColor)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 1);

    // Subtitle and back button container (simple text elements inside chart)
    // remove previous subtitle/back if re-rendering
    this.chart.selectAll('.treemap-subtitle').remove();
    this.chart.selectAll('.treemap-back').remove();

    const subtitle = this.chart
      .append('text')
      .attr('class', 'treemap-subtitle')
      .attr('x', this.getInnerWidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', `${this.options.fontSize * 0.9}px`)
      .attr('font-family', this.options.fontFamily)
      .style('display', this.subgroupField ? null : 'none')
      .text(this.groupField);

    const backBtn = this.chart
      .append('text')
      .attr('class', 'treemap-back')
      .attr('x', 0)
      .attr('y', -10)
      .attr('font-size', `${this.options.fontSize * 0.9}px`)
      .attr('font-family', this.options.fontFamily)
      .attr('fill', 'blue')
      .attr('cursor', 'pointer')
      .style('display', 'none')
      .text('← Back')
      .on('click', () => {
        // Return to top-level aggregated view if available, otherwise full root
        currentRoot = groupRoot || fullRoot;
        update(currentRoot);
      });

    // Add tooltip handlers with proper context
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

    // Use compiled formatter if provided; fallback to default HTML
    const tooltipFormatter = this.tooltipFormatter;

    cells
      .selectAll('rect')
      .on('mouseover', (event, d) => {
        const highlightColor = getHighlightColor(d._originalColor);
        d3.select(event.currentTarget).attr('fill', highlightColor);

        const percentageNum = (d.value / total) * 100;
        const percentage = percentageNum.toFixed(1);

        // If a tooltip formatter exists, call it with (value, row)
        if (tooltipFormatter) {
          try {
            // Prefer passing the original source row (if available) so
            // templates using original column names work. Fall back to
            // a small object with mapped fields when original row is missing.
            // Build a row object for the formatter. Prefer explicit original
            // row (`__row`) or first `__rows` entry; for aggregated nodes
            // create a synthetic row that matches the expected column names
            // (e.g. type1, count, color).
            let rowObj =
              d.data && d.data.__row
                ? d.data.__row
                : d.data && d.data.__rows
                  ? d.data.__rows[0]
                  : null;
            const isAggregated = !!(
              groupRoot &&
              (d.parent === groupRoot || (d.data && d.data.isAggregated))
            );
            if (!rowObj) {
              if (isAggregated) {
                rowObj = {
                  [this.groupField]: d.data.name,
                  count: d.value,
                  color: d.data.color,
                };
                // also provide friendly aliases used in examples
                rowObj[this.groupField] = d.data.name;
                rowObj.name = d.data.name;
              } else {
                rowObj = {
                  name: d.data.name,
                  value: d.value,
                  color: d.data.color,
                };
              }
            }
            // ensure count exists for formatters that expect it
            if (rowObj.count == null)
              rowObj.count = rowObj.value != null ? rowObj.value : d.value;

            const out = tooltipFormatter(percentageNum, rowObj);
            // If formatter returns a DOM node or string, show it; else fallback
            if (out != null) {
              showTooltip(event, out, fontFamily, fontSize);
              return;
            }
          } catch (err) {
            // Fall through to default tooltip on error
            // eslint-disable-next-line no-console
            console.error('Tooltip formatter error', err);
          }
        }

        // Build a display name that matches the label logic (parent + child when drilled)
        const displayName =
          d.data && d.data.name
            ? this.subgroupField &&
              d.parent &&
              d.parent.data &&
              d.parent.data.name
              ? `${d.parent.data.name} ${d.data.name}`
              : d.data.name
            : '';

        // Build a clean row object for the formatter: prefer original __row or
        // first __rows entry; otherwise synthesize a minimal object containing
        // the group/subgroup fields and a `count` property. Do NOT expose
        // legacy `value` fields to the formatter.
        let rowObj = null;
        if (d.data && d.data.__row) rowObj = d.data.__row;
        else if (d.data && d.data.__rows && d.data.__rows.length)
          rowObj = d.data.__rows[0];
        const isAggregated = !!(
          groupRoot &&
          (d.parent === groupRoot || (d.data && d.data.isAggregated))
        );
        if (!rowObj) {
          rowObj = {};
          // top-level aggregated nodes: groupField -> name, count from d.value
          rowObj[this.groupField] = d.data && d.data.name ? d.data.name : null;
          if (this.subgroupField && !isAggregated) {
            // leaf synthesized: subgroup name stored in d.data.name
            rowObj[this.subgroupField] =
              d.data && d.data.name ? d.data.name : null;
          }
          rowObj.count = d.value;
          rowObj.color = d.data && d.data.color ? d.data.color : null;
          rowObj.name = d.data && d.data.name ? d.data.name : null;
        }
        if (rowObj.count == null) rowObj.count = d.value;

        // If formatter provided, let it render the tooltip using the clean rowObj.
        if (tooltipFormatter) {
          try {
            const out = tooltipFormatter(percentageNum, rowObj);
            if (out != null) {
              showTooltip(event, out, fontFamily, fontSize);
              return;
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Tooltip formatter error', err);
          }
        }

        // Default fallback always uses and the synthesized displayName
        showTooltip(
          event,
          `<strong>${escapeHtml(displayName)}</strong>` +
            `Value: ${escapeHtml(String(rowObj.count))}<br/>` +
            `Percentage: ${percentage}%`,
          fontFamily,
          fontSize
        );
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget).attr('fill', d._originalColor);
        hideTooltip();
      });

    // Click behavior: map clicks from aggregated group nodes to the full hierarchy
    cells.selectAll('rect').on('click', (event, d) => {
      // If we're showing aggregated groups (check via isAggregated flag or parent),
      // find the corresponding group node in the full root and drill into it.
      if (groupRoot && (d.parent === groupRoot || d.data.isAggregated)) {
        const name = d.data.name;
        const target = fullRoot.children.find(ch => ch.data.name === name);
        if (target) {
          currentRoot = target;
          update(currentRoot);
        }
        return;
      }

      // Otherwise if this node has children (in fullRoot), drill in
      if (d.children && d.children.length) {
        currentRoot = d;
        update(currentRoot);
      }
    });

    // update function to re-render layout for a given root (drill)
    const update = newRoot => {
      // We support three modes:
      // 1) aggregated group view (newRoot === groupRoot): show groupRoot.children
      // 2) full flat view (newRoot === fullRoot): show fullRoot.leaves()
      // 3) drilled group view (newRoot is a node inside fullRoot): show its children scaled to fill

      // clear and recreate cells for simplicity
      this.chart.selectAll('.cell').remove();

      if (this.subgroupField && newRoot === groupRoot) {
        // aggregated top-level: show nodes from groupRoot (one per group)
        treemap(groupRoot);
        const nodesToShow = groupRoot.children || [];

        // Store original colors
        nodesToShow.forEach(d => {
          if (!d._originalColor) {
            d._originalColor =
              d.data.color || d3.interpolateViridis(Math.random());
          }
        });

        const newCells = this.chart
          .selectAll('.cell')
          .data(nodesToShow)
          .enter()
          .append('g')
          .attr('class', 'cell')
          .attr('transform', d => `translate(${d.x0},${d.y0})`);
        newCells
          .append('rect')
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', d => d._originalColor)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
        addLabelsToCells(newCells, 1, 1);

        // Add hover effects
        newCells
          .selectAll('rect')
          .on('mouseover', (event, d) => {
            const highlightColor = getHighlightColor(d._originalColor);
            d3.select(event.currentTarget).attr('fill', highlightColor);
            const percentageNum = (d.value / total) * 100;
            const percentage = percentageNum.toFixed(1);
            const displayName =
              d.data && d.data.name
                ? this.subgroupField &&
                  d.parent &&
                  d.parent.data &&
                  d.parent.data.name
                  ? `${d.parent.data.name} ${d.data.name}`
                  : d.data.name
                : '';

            // Try formatter first for aggregated nodes, otherwise show Count
            if (tooltipFormatter) {
              try {
                let rowObj =
                  d.data && d.data.__row
                    ? d.data.__row
                    : d.data && d.data.__rows
                      ? d.data.__rows[0]
                      : null;
                const isAggregated = !!(
                  groupRoot &&
                  (d.parent === groupRoot || (d.data && d.data.isAggregated))
                );
                if (!rowObj) {
                  if (isAggregated) {
                    rowObj = {
                      [this.groupField]: d.data.name,
                      count: d.value,
                      color: d.data.color,
                    };
                    rowObj.name = d.data.name;
                  } else {
                    rowObj = {
                      name: d.data.name,
                      value: d.value,
                      color: d.data.color,
                    };
                  }
                }
                if (rowObj.count == null)
                  rowObj.count = rowObj.value != null ? rowObj.value : d.value;
                const out = tooltipFormatter(percentageNum, rowObj);
                if (out != null) {
                  showTooltip(event, out, fontFamily, fontSize);
                  return;
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Tooltip formatter error', err);
              }
            }

            showTooltip(
              event,
              `<strong>${escapeHtml(displayName)}</strong>Value: ${escapeHtml(String(d.value))}<br/>Percentage: ${percentage}%`,
              fontFamily,
              fontSize
            );
          })
          .on('mouseout', (event, d) => {
            d3.select(event.currentTarget).attr('fill', d._originalColor);
            hideTooltip();
          })
          .on('click', (event, d) => {
            // clicking a group should drill into that group's corresponding node in fullRoot
            const name = d.data.name;
            const target =
              fullRoot.children &&
              fullRoot.children.find(ch => ch.data.name === name);
            if (target) {
              currentRoot = target;
              update(currentRoot);
            }
          });

        backBtn.style('display', 'none');
        subtitle.text(this.getSubtitleText('aggregated', null));
        return;
      }

      if (!this.subgroupField && newRoot === fullRoot) {
        // flat full view: show all leaves (only when no subgroup is requested)
        treemap(fullRoot);
        const nodesToShow = fullRoot.leaves();

        // Store original colors
        nodesToShow.forEach(d => {
          if (!d._originalColor) {
            d._originalColor =
              d.data.color || d3.interpolateViridis(Math.random());
          }
        });

        const newCells = this.chart
          .selectAll('.cell')
          .data(nodesToShow)
          .enter()
          .append('g')
          .attr('class', 'cell')
          .attr('transform', d => `translate(${d.x0},${d.y0})`);
        newCells
          .append('rect')
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', d => d._originalColor)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
        addLabelsToCells(newCells, 1, 1);
        // clicking on a group node's rectangle should drill into its children if present
        newCells.selectAll('rect').on('click', (event, d) => {
          if (d.children && d.children.length) {
            currentRoot = d;
            update(currentRoot);
          }
        });
        backBtn.style('display', 'none');
        subtitle.text(this.getSubtitleText('flat', null));
        return;
      }

      // Otherwise drill into a node inside fullRoot: create a subtree rooted
      // at newRoot and compute a fresh treemap over the full available area
      // so the children are renormalized to fill the chart (no extra blank space).
      // Build a new hierarchy from the drilled node's data and preserve children.
      const subtreeData = JSON.parse(JSON.stringify(newRoot.data));
      // If the drilled node carries children as d.children (already in hierarchy),
      // make sure subtreeData has the same nested structure. For nodes coming from
      // fullRoot, newRoot.data should already contain children arrays for leaves.
      const subtreeRoot = d3.hierarchy(subtreeData).sum(d => d.value || 0);

      // Compute treemap on subtreeRoot sized to full inner dimensions so it fills
      // the available area (renormalized).
      treemap.size([this.getInnerWidth(), this.getInnerHeight()]);
      treemap(subtreeRoot);

      // use the leaves of the subtree as the visible cells
      const leaves = subtreeRoot.leaves();

      // Store original colors on the subtree leaves. Try to map back to original
      // nodes by name where possible to reuse original _originalColor if present.
      leaves.forEach(d => {
        if (!d._originalColor) {
          // try find matching leaf in fullRoot by name and value
          const match = fullRoot
            .leaves()
            .find(
              f =>
                f.data &&
                d.data &&
                f.data.name === d.data.name &&
                f.value === d.value
            );
          d._originalColor =
            match && match._originalColor
              ? match._originalColor
              : (d.data && d.data.color) ||
                d3.interpolateViridis(Math.random());
        }
      });

      const newCells = this.chart
        .selectAll('.cell')
        .data(leaves)
        .enter()
        .append('g')
        .attr('class', 'cell')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);
      newCells
        .append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => d._originalColor)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
      addLabelsToCells(newCells, 1, 1);
      newCells
        .selectAll('rect')
        .on('mouseover', (event, d) => {
          const highlightColor = getHighlightColor(d._originalColor);
          d3.select(event.currentTarget).attr('fill', highlightColor);
          const percentageNum = (d.value / total) * 100;
          const percentage = percentageNum.toFixed(1);
          const displayName =
            d.data && d.data.name
              ? this.subgroupField &&
                d.parent &&
                d.parent.data &&
                d.parent.data.name
                ? `${d.parent.data.name} ${d.data.name}`
                : d.data.name
              : '';
          let rowObj =
            d.data && d.data.__row
              ? d.data.__row
              : d.data && d.data.__rows
                ? d.data.__rows[0]
                : null;
          const isAggregated = !!(
            groupRoot &&
            (d.parent === groupRoot || (d.data && d.data.isAggregated))
          );
          if (!rowObj) {
            if (isAggregated) {
              rowObj = {
                [this.groupField]: d.data.name,
                count: d.value,
                color: d.data.color,
              };
              rowObj.name = d.data.name;
            } else {
              rowObj = {
                name: d.data.name,
                value: d.value,
                color: d.data.color,
              };
            }
          }
          if (rowObj.count == null)
            rowObj.count = rowObj.value != null ? rowObj.value : d.value;
          if (tooltipFormatter) {
            try {
              // If formatter returns something, prefer it, otherwise fall back to default
              const out = tooltipFormatter(percentageNum, rowObj);
              if (out != null) {
                showTooltip(event, out, fontFamily, fontSize);
                return;
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Tooltip formatter error', err);
            }
          }
          showTooltip(
            event,
            `<strong>${escapeHtml(displayName)}</strong>` +
              `Value: ${escapeHtml(String(d.data.value || d.value))}<br/>` +
              `Percentage: ${percentage}%`,
            fontFamily,
            fontSize
          );
        })
        .on('mouseout', (event, d) => {
          d3.select(event.currentTarget).attr('fill', d._originalColor);
          hideTooltip();
        });

      // show back & subtitle for drilled view
      backBtn.style('display', null);
      subtitle.text(this.getSubtitleText('drilled', newRoot));
    };

    // initial subtitle (use formatter/fallback)
    if (this.subgroupField && groupRoot) {
      subtitle.text(this.getSubtitleText('aggregated', null));
    } else {
      subtitle.text(this.getSubtitleText('flat', null));
    }

    // Calculate x position based on label align (supports scaling)
    const getLabelX = (d, align, scaleX = 1) => {
      const cellWidth = (d.x1 - d.x0) * scaleX;
      switch (align) {
        case 'center':
        case 'middle':
          return cellWidth / 2;
        case 'right':
        case 'end':
          return cellWidth - 5;
        case 'left':
        case 'start':
        default:
          return 5;
      }
    };

    // Calculate y position based on label valign (supports scaling)
    const getLabelY = (
      d,
      valign,
      lineNumber = 0,
      totalLines = 2,
      scaleY = 1
    ) => {
      const cellHeight = (d.y1 - d.y0) * scaleY;
      const lineHeight = this.options.fontSize * 1.4; // Dynamic line height based on font size
      const totalTextHeight = totalLines * lineHeight;
      const baseY = lineNumber * lineHeight;

      switch (valign) {
        case 'middle': {
          // Center the entire text block (both lines together)
          const startY =
            (cellHeight - totalTextHeight) / 2 + this.options.fontSize;
          return startY + baseY;
        }
        case 'bottom':
          return cellHeight - 5 - lineHeight * (totalLines - lineNumber);
        case 'top':
        default:
          return this.options.fontSize + 4 + baseY; // Start below the top margin
      }
    };

    // Calculate text anchor based on align
    const getTextAnchor = align => {
      switch (align) {
        case 'center':
        case 'middle':
          return 'middle';
        case 'right':
        case 'end':
          return 'end';
        case 'left':
        case 'start':
        default:
          return 'start';
      }
    };

    const labels = this.labels;

    // Helper to add labels to a selection of cell groups. Accepts scaling used during drill.
    const addLabelsToCells = (selection, scaleX = 1, scaleY = 1) => {
      const self = this;
      selection.each(function (d) {
        const group = d3.select(this);
        const cellWidth = (d.x1 - d.x0) * scaleX;
        const cellHeight = (d.y1 - d.y0) * scaleY;

        const totalLines = 2;
        const lineHeight = self.options.fontSize * 1.4;
        const totalTextHeight = totalLines * lineHeight;

        const checkTextFits = (text, lineNumber) => {
          if (!labels) return false;
          const x = getLabelX(d, labels.align, scaleX);
          const y = getLabelY(d, labels.valign, lineNumber, totalLines, scaleY);
          const textAnchor = getTextAnchor(labels.align);

          if (labels.valign === 'middle') {
            if (totalTextHeight > cellHeight) return false;
          } else {
            if (
              y + self.options.fontSize > cellHeight ||
              y < self.options.fontSize
            )
              return false;
          }

          const tempText = self.chart
            .append('text')
            .attr('x', x)
            .attr('y', y)
            .text(text)
            .attr('font-size', `${self.options.fontSize}px`)
            .attr('font-family', self.options.fontFamily)
            .attr('font-weight', 'bold')
            .attr('text-anchor', textAnchor)
            .style('visibility', 'hidden');

          const bbox = tempText.node().getBBox();
          tempText.remove();

          const margin = 5;
          let left, right;
          if (textAnchor === 'start') {
            left = x;
            right = x + bbox.width;
          } else if (textAnchor === 'end') {
            left = x - bbox.width;
            right = x;
          } else {
            left = x - bbox.width / 2;
            right = x + bbox.width / 2;
          }
          return left >= margin && right <= cellWidth - margin;
        };

        // Helper to truncate text to fit in the available width and append '...'
        const truncateToFit = (text, lineNumber) => {
          if (!text) return '';
          // quick accept if it already fits
          if (checkTextFits(text, lineNumber)) return text;

          // binary truncate approach: progressively shorten until it fits
          let low = 0;
          let high = text.length;
          let best = '';
          while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            const candidate = text.slice(0, mid).trim() + '...';
            if (checkTextFits(candidate, lineNumber)) {
              best = candidate;
              low = mid;
            } else {
              high = mid - 1;
            }
          }
          // final fallback: try progressively shorter tails if binary search missed
          if (!best) {
            for (let i = Math.min(text.length, 20); i > 0; i--) {
              const candidate = text.slice(0, i).trim() + '...';
              if (checkTextFits(candidate, lineNumber)) {
                best = candidate;
                break;
              }
            }
          }
          return best || '';
        };

        // Build a clean row object similar to tooltip handlers so user
        // label formatters can inspect original fields.
        let rowObj =
          d.data && d.data.__row
            ? d.data.__row
            : d.data && d.data.__rows
              ? d.data.__rows[0]
              : null;
        const isAggregated = !!(
          groupRoot &&
          (d.parent === groupRoot || (d.data && d.data.isAggregated))
        );
        if (!rowObj) {
          rowObj = {};
          rowObj[self.groupField] = d.data && d.data.name ? d.data.name : null;
          if (self.subgroupField && !isAggregated) {
            rowObj[self.subgroupField] =
              d.data && d.data.name ? d.data.name : null;
          }
          rowObj.count = d.value;
          rowObj.color = d.data && d.data.color ? d.data.color : null;
          rowObj.name = d.data && d.data.name ? d.data.name : null;
        }
        if (rowObj.count == null)
          rowObj.count = rowObj.value != null ? rowObj.value : d.value;

        // For drilled views in a two-level treemap, default categoryName is "Parent Child"
        let categoryName = d.data.name;
        if (
          self.subgroupField &&
          d.parent &&
          d.parent.data &&
          d.parent.data.name
        ) {
          categoryName = `${d.parent.data.name} ${d.data.name}`;
        }

        const percentage = ((d.value / total) * 100).toFixed(1) + '%';
        const countText =
          d.data.value != null ? d.data.value.toLocaleString() : '';

        // ...existing code...

        // If a labels formatter was provided (JS(...) from R), call it and
        // render the returned text lines. Accept string (with <br/>), array,
        // or single value. If successful, skip the fallback label logic.
        if (self.labelsFormatter) {
          try {
            const labOut = self.labelsFormatter(
              (d.value / total) * 100,
              rowObj
            );
            if (labOut != null) {
              let lines = [];
              if (Array.isArray(labOut)) {
                lines = labOut.map(String);
              } else if (typeof labOut === 'string') {
                // split on HTML line breaks and strip tags
                // match <br>, <br/> or <br /> so the trailing '>' is consumed
                lines = labOut
                  .split(/<br\s*\/?\s*>/i)
                  .map(s => s.replace(/<[^>]*>/g, '').trim())
                  .filter(Boolean);
              } else {
                lines = [String(labOut)];
              }

              if (lines.length > 0) {
                const localTotalLines = Math.max(1, lines.length);
                for (let i = 0; i < lines.length; i++) {
                  const text = lines[i];
                  if (!text) continue;
                  if (checkTextFits(text, i)) {
                    group
                      .append('text')
                      .attr('x', getLabelX(d, labels.align, scaleX))
                      .attr(
                        'y',
                        getLabelY(d, labels.valign, i, localTotalLines, scaleY)
                      )
                      .text(text)
                      .attr('font-size', `${self.options.fontSize}px`)
                      .attr('font-family', self.options.fontFamily)
                      .attr('font-weight', 'bold')
                      .attr('text-anchor', getTextAnchor(labels.align))
                      .attr('fill', getTextColor(d.data.color || '#999'))
                      .attr('stroke', getTextStroke(d.data.color || '#999'))
                      .attr('stroke-width', 0)
                      .attr('paint-order', 'stroke')
                      .attr('pointer-events', 'none');
                  } else {
                    // If it doesn't fit, try truncating (especially useful for the first line)
                    const t = truncateToFit(text, i);
                    if (t) {
                      group
                        .append('text')
                        .attr('x', getLabelX(d, labels.align, scaleX))
                        .attr(
                          'y',
                          getLabelY(
                            d,
                            labels.valign,
                            i,
                            localTotalLines,
                            scaleY
                          )
                        )
                        .text(t)
                        .attr('font-size', `${self.options.fontSize}px`)
                        .attr('font-family', self.options.fontFamily)
                        .attr('font-weight', 'bold')
                        .attr('text-anchor', getTextAnchor(labels.align))
                        .attr('fill', getTextColor(d.data.color || '#999'))
                        .attr('stroke', getTextStroke(d.data.color || '#999'))
                        .attr('stroke-width', 0)
                        .attr('paint-order', 'stroke')
                        .attr('pointer-events', 'none');
                    }
                  }
                }
                return; // rendered custom labels; skip fallback
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Labels formatter error', err);
          }
        }

        // Try full label, then smart truncation variants before giving up.
        // Preference order: full text -> text before first ',' or ';' + '...' -> first two words + '...'
        const tryAndAppendLabel = text => {
          if (!text) return false;
          // If the full text fits, append it. Otherwise try truncated version for the first line.
          if (checkTextFits(text, 0)) {
            group
              .append('text')
              .attr('x', getLabelX(d, labels.align, scaleX))
              .attr('y', getLabelY(d, labels.valign, 0, totalLines, scaleY))
              .text(text)
              .attr('font-size', `${self.options.fontSize}px`)
              .attr('font-family', self.options.fontFamily)
              .attr('font-weight', 'bold')
              .attr('text-anchor', getTextAnchor(labels.align))
              .attr('fill', getTextColor(d.data.color || '#999'))
              .attr('stroke', getTextStroke(d.data.color || '#999'))
              .attr('stroke-width', 0)
              .attr('paint-order', 'stroke')
              .attr('pointer-events', 'none');
            return true;
          }

          // For the first (top) line, attempt to truncate and append '...'
          const truncated = truncateToFit(text, 0);
          if (truncated) {
            group
              .append('text')
              .attr('x', getLabelX(d, labels.align, scaleX))
              .attr('y', getLabelY(d, labels.valign, 0, totalLines, scaleY))
              .text(truncated)
              .attr('font-size', `${self.options.fontSize}px`)
              .attr('font-family', self.options.fontFamily)
              .attr('font-weight', 'bold')
              .attr('text-anchor', getTextAnchor(labels.align))
              .attr('fill', getTextColor(d.data.color || '#999'))
              .attr('stroke', getTextStroke(d.data.color || '#999'))
              .attr('stroke-width', 0)
              .attr('paint-order', 'stroke')
              .attr('pointer-events', 'none');
            return true;
          }
          return false;
        };

        // 1) full label
        if (!tryAndAppendLabel(categoryName)) {
          // 2) text before first comma or semicolon
          const punctMatch = categoryName && categoryName.split(/[,;]+/)[0];
          const punctLabel =
            punctMatch &&
            punctMatch.trim() &&
            punctMatch.trim().length < categoryName.length
              ? `${punctMatch.trim()}...`
              : null;
          if (!tryAndAppendLabel(punctLabel)) {
            // 3) first two words
            const words = categoryName ? categoryName.trim().split(/\s+/) : [];
            if (words.length > 1) {
              const twoWord = `${words.slice(0, 2).join(' ')}...`;
              tryAndAppendLabel(twoWord);
            }
          }
        }

        const secondLine = self.labelMode === 'count' ? countText : percentage;
        if (secondLine && checkTextFits(secondLine, 1)) {
          group
            .append('text')
            .attr('x', getLabelX(d, labels.align, scaleX))
            .attr('y', getLabelY(d, labels.valign, 1, totalLines, scaleY))
            .text(secondLine)
            .attr('font-size', `${self.options.fontSize}px`)
            .attr('font-family', self.options.fontFamily)
            .attr('font-weight', 'bold')
            .attr('text-anchor', getTextAnchor(labels.align))
            .attr('fill', getTextColor(d.data.color || '#999'))
            .attr('stroke', getTextStroke(d.data.color || '#999'))
            .attr('stroke-width', 0)
            .attr('paint-order', 'stroke')
            .attr('pointer-events', 'none');
        }
      });
    };

    // add labels to the initial cells
    addLabelsToCells(cells, 1, 1);

    return this;
  }
}
