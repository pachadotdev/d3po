import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  createColorScale,
  showTooltip,
  hideTooltip,
  getHighlightColor,
  escapeHtml,
  resolveTooltipFormatter,
  showTooltipWithFormatter,
} from '../utils.js';

export default class BarChart extends D3po {
  constructor(container, options) {
    super(container, options);
    if (!options.x || !options.y)
      throw new Error('Bar chart requires x and y fields');
    this.xField = options.x;
    this.yField = options.y;
    this.colorField = options.color;
    // optional group aesthetic
    this.groupField = options.group;
  }

  render() {
    if (!this.data) throw new Error('No data provided');
    validateData(this.data, [this.xField, this.yField]);

    const firstItem = this.data[0];
    const isHorizontal = typeof firstItem[this.yField] === 'string';

    let effectiveInnerWidth = this.getInnerWidth();
    let effectiveInnerHeight = this.getInnerHeight();
    // default to true (opt-out by setting useLeftMarginSpace: false)
    const useLeftMarginSpace =
      this.options && this.options.useLeftMarginSpace !== false;

    // determine stacking / grouping
    const stacked = !!(
      this.options &&
      (this.options.stack === true || this.options.type === 'stacked')
    );
    // Only treat an explicit `group` aesthetic as a grouping variable.
    // Do not fall back to `color` for grouping — color should only affect appearance by default.
    const groupField = this.groupField != null ? this.groupField : null;

    // category field (outer band) depends on orientation
    const categoryField = isHorizontal ? this.yField : this.xField;
    const valueField = isHorizontal ? this.xField : this.yField;

    // unique categories
    const categories = Array.from(
      new Set(
        this.data.map(d =>
          d[categoryField] == null ? '' : String(d[categoryField])
        )
      )
    );

    // optional sort spec (e.g. "desc-x" or "asc-y") passed from R via daes(sort = "...")
    const sortSpec =
      this.options && this.options.sort ? String(this.options.sort) : null;
    const preserveOtherLabel = 'Rest of the world';
    const applyCategorySort = orderArr => {
      categories.splice(0, categories.length, ...orderArr);
    };
    const aggregateByCategory = () => {
      const m = new Map();
      this.data.forEach(d => {
        const cat = d[categoryField] == null ? '' : String(d[categoryField]);
        const val = Number(d[valueField]) || 0;
        m.set(cat, (m.get(cat) || 0) + val);
      });
      return Array.from(m.entries());
    };

    // apply simple sorting when requested (non-stacked).
    // Sorting must reorder the categories array AND ensure the data rows
    // used to draw bars remain correctly associated with their categories.
    // Important: do NOT mutate `this.data` in place. Instead compute an
    // `orderedData` array (below) that is always derived from `categories`
    // so axis ticks, bars and tooltips stay aligned regardless of input order
    // or Set iteration differences.
    let requestedSort = null;
    if (sortSpec && !stacked) {
      const m = sortSpec.match(/^(asc|desc)-([xy])$/);
      if (m) requestedSort = { dir: m[1], axis: m[2] };
    }

  // candidate groups
    const groups = groupField
      ? Array.from(
          new Set(
            this.data.map(d =>
              d[groupField] == null ? '' : String(d[groupField])
            )
          )
        )
      : [];

    // enable grouping only when at least one category has multiple group values
    let groupingActive = false;
    if (groupField && !stacked) {
      const perCat = new Map();
      this.data.forEach(d => {
        const cat = d[categoryField] == null ? '' : String(d[categoryField]);
        const g = d[groupField] == null ? '' : String(d[groupField]);
        if (!perCat.has(cat)) perCat.set(cat, new Set());
        perCat.get(cat).add(g);
      });
      for (const s of perCat.values())
        if (s.size > 1) {
          groupingActive = true;
          break;
        }
    }

    let xScale,
      yScale,
      innerBand = null;
    const colorScale = createColorScale(
      this.data,
      this.colorField,
      d3.interpolateViridis
    );
    let bars = null;

    // Build a map from group key to color (for stacked bars)
    const groupToColor = new Map();

    if (stacked && groupField) {
      // Populate the map from group key to color (from the first occurrence in the data)
      if (this.colorField) {
        this.data.forEach(d => {
          const g = d[groupField] == null ? '' : String(d[groupField]);
          if (!groupToColor.has(g) && d[this.colorField] != null) {
            groupToColor.set(g, d[this.colorField]);
          }
        });
      }

      // pivot data: one object per category with group keys
      const stackRows = categories.map(cat => {
        const obj = { __cat: cat };
        groups.forEach(g => {
          obj[g] = 0;
        });
        obj.__total = 0;
        return obj;
      });
      const rowByCat = new Map(stackRows.map(r => [r.__cat, r]));
      this.data.forEach(d => {
        const cat = d[categoryField] == null ? '' : String(d[categoryField]);
        const g = d[groupField] == null ? '' : String(d[groupField]);
        const val = Number(d[valueField]) || 0;
        const row = rowByCat.get(cat);
        if (row) {
          row[g] = (row[g] || 0) + val;
          row.__total = (row.__total || 0) + val;
        }
      });

      const maxTotal = d3.max(stackRows, r => r.__total) || 0;

      if (isHorizontal) {
        // horizontal stacked bars: categorical on y, numeric on x
        yScale = d3
          .scaleBand()
          .domain(categories)
          .range([0, effectiveInnerHeight])
          .padding(0.2);
        xScale = d3
          .scaleLinear()
          .domain([0, maxTotal])
          .nice()
          .range([0, effectiveInnerWidth]);
      } else {
        // vertical stacked bars: categorical on x, numeric on y
        xScale = d3
          .scaleBand()
          .domain(categories)
          .range([0, effectiveInnerWidth])
          .padding(0.2);
        yScale = d3
          .scaleLinear()
          .domain([0, maxTotal])
          .nice()
          .range([effectiveInnerHeight, 0]);
      }

      // allow sorting stacks by total value
      if (sortSpec) {
        const m = sortSpec.match(/^(asc|desc)-([xy])$/);
        if (m) {
          const dir = m[1];
          stackRows.sort((a, b) =>
            dir === 'desc' ? b.__total - a.__total : a.__total - b.__total
          );
          const sortedCats = stackRows.map(r => r.__cat);
          if (sortedCats.indexOf(preserveOtherLabel) !== -1) {
            const s = sortedCats
              .filter(x => x !== preserveOtherLabel)
              .concat([preserveOtherLabel]);
            applyCategorySort(s);
          } else {
            applyCategorySort(sortedCats);
          }
          if (isHorizontal) {
            yScale.domain(categories);
          } else {
            xScale.domain(categories);
          }
        }
      }

      // compute stack series
      const stackGen = d3.stack().keys(groups);
      const series = stackGen(stackRows);

      // draw stacked bars: one g per series (group)
      const seriesG = this.chart
        .selectAll('.series')
        .data(series)
        .enter()
        .append('g')
        .attr('class', 'series');

      if (isHorizontal) {
        // horizontal stacked bars
        seriesG
          .selectAll('rect')
          .data(d => d)
          .enter()
          .append('rect')
          .attr('y', (d, i) => yScale(stackRows[i].__cat))
          .attr('x', d => xScale(d[0]))
          .attr('width', d => Math.max(0, xScale(d[1]) - xScale(d[0])))
          .attr('height', yScale.bandwidth())
          .attr('fill', (d, i, nodes) => {
            // color by the series key (group key stored on parent datum)
            const parentDatum = d3.select(nodes[i].parentNode).datum();
            const grp = parentDatum && parentDatum.key ? parentDatum.key : null;
            // If we have a color field and a mapping from group to color, use it
            if (this.colorField && groupToColor.has(grp)) {
              const colorValue = groupToColor.get(grp);
              return colorScale({ [this.colorField]: colorValue });
            }
            // Otherwise fall back to coloring by group name
            return colorScale({ [this.colorField]: grp });
          });
      } else {
        // vertical stacked bars
        seriesG
          .selectAll('rect')
          .data(d => d)
          .enter()
          .append('rect')
          .attr('x', (d, i) => xScale(stackRows[i].__cat))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])))
          .attr('width', xScale.bandwidth())
          .attr('fill', (d, i, nodes) => {
            // color by the series key (group key stored on parent datum)
            const parentDatum = d3.select(nodes[i].parentNode).datum();
            const grp = parentDatum && parentDatum.key ? parentDatum.key : null;
            // If we have a color field and a mapping from group to color, use it
            if (this.colorField && groupToColor.has(grp)) {
              const colorValue = groupToColor.get(grp);
              return colorScale({ [this.colorField]: colorValue });
            }
            // Otherwise fall back to coloring by group name
            return colorScale({ [this.colorField]: grp });
          });
      }
      // reference created rects for event wiring
      bars = this.chart.selectAll('.series').selectAll('rect');
    } else if (groupingActive) {
      // grouped (side-by-side)
      if (isHorizontal) {
        // horizontal: categorical on y, numeric on x
        xScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, d => Number(d[valueField]) || 0)])
          .nice()
          .range([0, effectiveInnerWidth]);
        yScale = d3
          .scaleBand()
          .domain(categories)
          .range([0, effectiveInnerHeight])
          .padding(0.12);
        innerBand = d3
          .scaleBand()
          .domain(groups)
          .range([0, yScale.bandwidth()])
          .padding(0.05);
      } else {
        // vertical: categorical on x, numeric on y
        xScale = d3
          .scaleBand()
          .domain(categories)
          .range([0, effectiveInnerWidth])
          .padding(0.12);
        yScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, d => Number(d[valueField]) || 0)])
          .nice()
          .range([effectiveInnerHeight, 0]);
        innerBand = d3
          .scaleBand()
          .domain(groups)
          .range([0, xScale.bandwidth()])
          .padding(0.05);
      }

      // draw grouped bars
      // create bars using shared colorScale
      bars = this.chart
        .selectAll('.bar')
        .data(this.data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .style('opacity', 1)
        .attr('fill', d => colorScale(d));

      if (isHorizontal) {
        bars
          .attr('x', 0)
          .attr(
            'y',
            d =>
              yScale(String(d[categoryField] == null ? '' : d[categoryField])) +
              innerBand(String(d[groupField] == null ? '' : d[groupField]))
          )
          .attr('width', d => xScale(Number(d[valueField]) || 0))
          .attr('height', () => innerBand.bandwidth());
      } else {
        bars
          .attr(
            'x',
            d =>
              xScale(String(d[categoryField] == null ? '' : d[categoryField])) +
              innerBand(String(d[groupField] == null ? '' : d[groupField]))
          )
          .attr('y', d => yScale(Number(d[valueField]) || 0))
          .attr('width', () => innerBand.bandwidth())
          .attr('height', d =>
            Math.max(
              0,
              effectiveInnerHeight - yScale(Number(d[valueField]) || 0)
            )
          );
      }
    } else {
      // simple single bar per category
      // Build an ordered data array matching `categories` so axis labels and
      // bars are always aligned even if input order or Set iteration differs.
      const rowsByCat = new Map();
      this.data.forEach(d => {
        const cat = d[categoryField] == null ? '' : String(d[categoryField]);
        if (!rowsByCat.has(cat)) rowsByCat.set(cat, []);
        rowsByCat.get(cat).push(d);
      });
      // If a sort was requested, compute a sorted categories array derived
      // from the requestedSort and apply it without mutating this.data.
      if (requestedSort) {
        const dir = requestedSort.dir;
        const axis = requestedSort.axis;
        if (axis === 'x') {
          const entries = aggregateByCategory();
          entries.sort((a, b) => (dir === 'desc' ? b[1] - a[1] : a[1] - b[1]));
          let sortedCats = entries.map(e => e[0]);
          if (sortedCats.indexOf(preserveOtherLabel) !== -1) {
            sortedCats = sortedCats
              .filter(x => x !== preserveOtherLabel)
              .concat([preserveOtherLabel]);
          }
          applyCategorySort(sortedCats);
        } else if (axis === 'y') {
          const sortedCats = Array.from(categories).sort((a, b) => {
            if (a == null) a = '';
            if (b == null) b = '';
            if (a < b) return dir === 'asc' ? -1 : 1;
            if (a > b) return dir === 'asc' ? 1 : -1;
            return 0;
          });
          if (sortedCats.indexOf(preserveOtherLabel) !== -1) {
            const s = sortedCats.filter(x => x !== preserveOtherLabel).concat([preserveOtherLabel]);
            applyCategorySort(s);
          } else {
            applyCategorySort(sortedCats);
          }
        }
      }

      // Draw one rect per category (category-order -> axis ticks). For each
      // category we look up the first matching row (expected single row per
      // category in the simple case) and attach that row as the element's
      // datum so tooltip code continues to receive the original row object.
      if (isHorizontal) {
        xScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, d => Number(d[this.xField]) || 0)])
          .nice()
          .range([0, effectiveInnerWidth]);
        yScale = d3
          .scaleBand()
          .domain(categories)
          .range([0, effectiveInnerHeight])
          .padding(0.2);

        bars = this.chart
          .selectAll('.bar')
          .data(categories)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .style('opacity', 1)
          .attr('fill', cat => {
            const rows = rowsByCat.get(cat) || [];
            const row = rows[0] || {};
            return colorScale(row);
          })
          .attr('x', 0)
          .attr('y', cat => yScale(cat))
          .attr('width', cat => {
            const rows = rowsByCat.get(cat) || [];
            const row = rows[0] || {};
            return xScale(Number(row[this.xField]) || 0);
          })
          .attr('height', () => yScale.bandwidth());

        // Attach the actual row object as the element datum for tooltips/event handlers
        bars.each(function (cat, i, nodes) {
          const rows = rowsByCat.get(cat) || [];
          const row = rows[0] || { [categoryField]: cat };
          d3.select(nodes[i]).datum(row);
        });
      } else {
        xScale = d3
          .scaleBand()
          .domain(categories)
          .range([0, effectiveInnerWidth])
          .padding(0.2);
        yScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, d => Number(d[this.yField]) || 0)])
          .nice()
          .range([effectiveInnerHeight, 0]);

        bars = this.chart
          .selectAll('.bar')
          .data(categories)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .style('opacity', 1)
          .attr('fill', cat => {
            const rows = rowsByCat.get(cat) || [];
            const row = rows[0] || {};
            return colorScale(row);
          })
          .attr('x', cat => xScale(cat))
          .attr('y', cat => {
            const rows = rowsByCat.get(cat) || [];
            const row = rows[0] || {};
            return yScale(Number(row[this.yField]) || 0);
          })
          .attr('width', () => xScale.bandwidth())
          .attr('height', cat => {
            const rows = rowsByCat.get(cat) || [];
            const row = rows[0] || {};
            return Math.max(0, effectiveInnerHeight - yScale(Number(row[this.yField]) || 0));
          });

        // Attach the actual row object as the element datum for tooltips/event handlers
        bars.each(function (cat, i, nodes) {
          const rows = rowsByCat.get(cat) || [];
          const row = rows[0] || { [categoryField]: cat };
          d3.select(nodes[i]).datum(row);
        });
      }
    }

    let measuredMaxTickWidth = 0;
    let measuredLabelBBoxHeight = 0;
    // Measure y-axis tick widths and label bbox for both orientations so reclaim logic
    // can apply to horizontal charts (where y is categorical).
    try {
      const probe = this.svg.append('g').attr('class', 'd3po-probe');
      const axis = d3.axisLeft(yScale);
      if (this.options.axisFormatters && this.options.axisFormatters.y)
        axis.tickFormat(this.options.axisFormatters.y);
      probe.call(axis);
      try {
        const ticks = probe.selectAll('.tick text').nodes();
        if (ticks && ticks.length)
          measuredMaxTickWidth = d3.max(ticks, n => n.getBBox().width) || 0;
      } catch (e) {
        void 0; // some environments may not allow getBBox on detached nodes
      }
      probe.remove();
      try {
        const lab = this.svg
          .append('text')
          .attr('x', -9999)
          .attr('y', -9999)
          .style('font-size', '14px')
          .text(this.yField);
        measuredLabelBBoxHeight = lab.node().getBBox().height || 0;
        lab.remove();
      } catch (e) {
        /* fallback to a reasonable default if measurement fails */
        measuredLabelBBoxHeight = 14;
      }

      const gap = this.yLabelGap !== undefined ? this.yLabelGap : 12;
      const requiredLeft = Math.ceil(
        measuredMaxTickWidth + gap + measuredLabelBBoxHeight + 8
      );
      const currentLeft =
        (this.options && this.options.margin && this.options.margin.left) || 60;
      if (requiredLeft > currentLeft) {
        this.options.margin.left = requiredLeft;
        effectiveInnerWidth = this.getInnerWidth();
        effectiveInnerHeight = this.getInnerHeight();
        if (xScale && xScale.range) {
          // preserve band orientation (0..width)
          if (xScale.bandwidth) xScale.range([0, effectiveInnerWidth]);
          else xScale.range([0, effectiveInnerWidth]);
        }
        if (yScale && yScale.range) {
          // For band scales (categorical on y) use [0, height]; for linear use [height, 0]
          if (yScale.bandwidth) yScale.range([0, effectiveInnerHeight]);
          else yScale.range([effectiveInnerHeight, 0]);
        }
        if (this.chart && this.chart.attr)
          this.chart.attr(
            'transform',
            `translate(${this.options.margin.left},${this.options.margin.top})`
          );
      }
    } catch (e) {
      void 0;
    }

    if (useLeftMarginSpace && measuredMaxTickWidth > 0) {
      const gap = this.yLabelGap !== undefined ? this.yLabelGap : 12;
      const measuredRequiredLeft = Math.ceil(
        measuredMaxTickWidth + gap + measuredLabelBBoxHeight + 8
      );
      const marginLeft =
        (this.options && this.options.margin && this.options.margin.left) || 60;
      // Force the chart translate X to measuredRequiredLeft + safety buffer when the option is enabled.
      const safetyBuffer = 4; // px
      const targetLeft = Math.max(
        0,
        (measuredRequiredLeft || 0) + safetyBuffer
      );
      // compute reclaimed amount (positive if we free up space)
      const delta = marginLeft - targetLeft;
      // adjust effectiveInnerWidth safely
      const baseInner = this.getInnerWidth();
      const newInner = Math.max(20, Math.round(baseInner + Math.max(0, delta)));
      effectiveInnerWidth = newInner;
      if (xScale && xScale.range) {
        if (xScale.bandwidth) xScale.range([0, effectiveInnerWidth]);
        else xScale.range([0, effectiveInnerWidth]);
      }
      if (yScale && yScale.range) {
        if (yScale.bandwidth) yScale.range([0, effectiveInnerHeight]);
        else yScale.range([effectiveInnerHeight, 0]);
      }
      const translateX = targetLeft;
      if (this.chart && this.chart.attr)
        this.chart.attr(
          'transform',
          `translate(${translateX},${this.options.margin.top})`
        );
    }

    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;
    // prefer a compiled tooltip on the instance (from D3po base) then fall back
    // to options.tooltip which may be a JS(...) expression
    const tooltipFormatter = resolveTooltipFormatter(
      this.tooltip,
      this.options && this.options.tooltip
    );

    // Helper: remove leading numeric-only lines that sometimes appear (e.g. "1", "2" on their own line)
    // This sanitizes tooltip HTML produced by formatters or fallbacks so the tooltip shows only the intended content.
    const sanitizeTooltipHtml = html => {
      if (typeof html !== 'string') return html;
      // Remove any leading lines that consist only of digits and optional list markers like '.' or ')'
      html = html.replace(/^(?:\s*\d+(?:[.)]\s*)?\r?\n)+/, '');
      // Remove any leftover leading blank lines
      html = html.replace(/^\s*\r?\n+/, '');
      return html;
    };

    // Remove leading numeric-only nodes from the created tooltip DOM element.
    // This handles cases where the formatter returns HTML that wraps a number
    // inside tags (e.g. <div>1</div>) which simple regex-cleaning won't remove.
    // tooltipSel: d3 selection for tooltip element
    // stripAllNumeric: if true, remove ANY child nodes that are purely numeric/index-like
    // when false, only strip leading numeric-only nodes (legacy behaviour)
    const sanitizeTooltipElement = (tooltipSel, stripAllNumeric = false) => {
      if (!tooltipSel || !tooltipSel.node) return;
      const node = tooltipSel.node();
      if (!node) return;
      try {
        // Helper to test numeric/index-like text
        const isNumericIndexText = txt => {
          if (!txt) return false;
          const t = String(txt).trim();
          if (t === '') return false;
          // index-like: '1', '1.', '1)'
          if (/^\d+[.)]?$/.test(t)) return true;
          // bare numbers (integers or floats, optional negative)
          if (/^-?\d+(?:\.\d+)?$/.test(t)) return true;
          return false;
        };

        if (stripAllNumeric) {
          // Recursively remove any descendant nodes whose textContent is numeric/index-like, and remove empty text nodes
          const removeIfNumeric = el => {
            if (!el || !el.childNodes) return;
            const children = Array.from(el.childNodes);
            for (const child of children) {
              const txt = (child.textContent || '').trim();
              if (txt === '' || isNumericIndexText(txt)) {
                try {
                  el.removeChild(child);
                } catch (e) {
                  /* ignore if removed already */
                }
                continue;
              }
              // if element node, descend
              if (
                child.nodeType === 1 &&
                child.childNodes &&
                child.childNodes.length
              )
                removeIfNumeric(child);
            }
          };
          removeIfNumeric(node);
          // also collapse leading whitespace-only nodes left behind
          while (
            node.firstChild &&
            (node.firstChild.textContent || '').trim() === ''
          )
            node.removeChild(node.firstChild);
          return;
        }

        // Legacy behavior: only strip leading numeric-only nodes
        while (node.firstChild) {
          const first = node.firstChild;
          const txt = (first.textContent || '').trim();
          if (txt === '') {
            // remove empty text nodes
            node.removeChild(first);
            continue;
          }
          if (isNumericIndexText(txt)) {
            node.removeChild(first);
            // remove any immediate following whitespace-only nodes
            while (
              node.firstChild &&
              (node.firstChild.textContent || '').trim() === ''
            )
              node.removeChild(node.firstChild);
            continue;
          }
          break;
        }
      } catch (e) {
        /* best-effort */
      }
    };

    // Small helper to convert strings to Title Case (e.g., "attack" -> "Attack")
    const toTitleCase = s => {
      if (s == null) return s;
      const str = String(s);
      return str.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };

    const maybeFormat = v =>
      typeof v === 'number' && Number.isFinite(v) ? v.toFixed(2) : v;

    // capture field names for use inside event handlers
    const xField = this.xField;
    const yField = this.yField;
    const colorFieldName = this.colorField;
    // Only include group info in tooltips when grouping is active or stacking is used.
    // Do NOT include group info when groupField is null/undefined (color-only scenarios).
    const includeGroupInTooltip =
      groupField != null && (groupingActive || stacked);

    bars
      .on('mouseover', function (event, d) {
        // d may be a stack datum (array) with .data containing the original row
        let row = d;
        let seriesKey = null;
        let stackValue = null; // The actual stacked value for this segment

        if (Array.isArray(d) && d.data) {
          row = d.data;
          const parent = d3.select(this.parentNode).datum();
          seriesKey = parent && parent.key ? parent.key : null;
          // For stacked bars, d[1] - d[0] gives the height/value of this segment
          stackValue = d[1] - d[0];
        }

        const baseColor = d3.select(this).attr('fill');
        d3.select(this).attr('fill', getHighlightColor(baseColor));
        // replicate AreaChart's default tooltip: optional bold group, then x and y labeled on separate lines
        if (tooltipFormatter) {
          // Wrap the user formatter so we can sanitize any returned HTML string.
          const wrappedFormatter = (value, r) => {
            const out = tooltipFormatter(value, r);
            return typeof out === 'string' ? sanitizeTooltipHtml(out) : out;
          };
          // Fallback tooltip: show category first, then (bold) group/feature, then the measure value.
          // Previously the group/feature appeared on top which led to confusing ordering when
          // multiple groups are shown; this presents category/feature before the numeric value.
          const fallback = () => {
            let groupVal = null;
            if (seriesKey) groupVal = seriesKey;
            else if (
              includeGroupInTooltip &&
              groupField &&
              row &&
              groupField in row
            )
              groupVal = row[groupField];
            if (groupVal != null && String(groupVal).trim() === '')
              groupVal = null;

            // For stacked bars, get category from row.__cat
            let categoryVal;
            if (stacked && row && row.__cat != null) {
              categoryVal = row.__cat;
            } else {
              categoryVal = row && row[isHorizontal ? yField : xField];
            }

            const measureField = isHorizontal ? xField : yField;
            // For stacked bars, use the segment value; otherwise use the row's measure field
            let measureVal;
            if (stacked && stackValue != null) {
              measureVal = stackValue;
            } else {
              measureVal = row && row[measureField];
            }

            // Build explicit lines to avoid stray indexation appearing when group is absent
            const lines = [];
            if (groupVal) {
              lines.push(
                `<strong>${escapeHtml(String(categoryVal))}</strong> ${escapeHtml(String(toTitleCase(groupVal)))}`
              );
            } else {
              lines.push(`<strong>${escapeHtml(String(categoryVal))}</strong>`);
            }
            lines.push(`Value: ${escapeHtml(String(maybeFormat(measureVal)))}`);
            return lines.join('<br/>');
          };
          const tt = showTooltipWithFormatter(
            event,
            wrappedFormatter,
            null,
            row,
            fontFamily,
            fontSize,
            fallback
          );
          // If group info is not included in tooltip, strip numeric-only nodes anywhere
          sanitizeTooltipElement(tt, !includeGroupInTooltip);
        } else {
          // Non-formatter fallback: show category first, then optional group, then the value label.
          // For stacked bars, get category from row.__cat
          let categoryVal;
          if (stacked && row && row.__cat != null) {
            categoryVal = row.__cat;
          } else {
            categoryVal = row && row[isHorizontal ? yField : xField];
          }

          const measureField = isHorizontal ? xField : yField;
          // For stacked bars, use the segment value; otherwise use the row's measure field
          let measureVal;
          if (stacked && stackValue != null) {
            measureVal = stackValue;
          } else {
            measureVal = row && row[measureField];
          }

          let groupVal = null;
          if (seriesKey) groupVal = seriesKey;
          else if (
            includeGroupInTooltip &&
            groupField &&
            row &&
            groupField in row
          )
            groupVal = row[groupField];
          if (groupVal != null && String(groupVal).trim() === '')
            groupVal = null;
          const lines = [];
          if (groupVal) {
            lines.push(
              `<strong>${escapeHtml(String(categoryVal))}</strong> ${escapeHtml(String(toTitleCase(groupVal)))}`
            );
          } else {
            lines.push(`<strong>${escapeHtml(String(categoryVal))}</strong>`);
          }
          lines.push(`Value: ${escapeHtml(String(maybeFormat(measureVal)))}`);
          const rawContent = lines.join('<br/>');
          const tt2 = showTooltip(event, rawContent, fontFamily, fontSize);
          // If group info is not included in tooltip, strip numeric-only nodes anywhere
          sanitizeTooltipElement(tt2, !includeGroupInTooltip);
        }
      })
      .on('mouseout', function () {
        const bound = d3.select(this).datum();
        if (Array.isArray(bound) && bound.data) {
          const parent = d3.select(this.parentNode).datum();
          const seriesKey = parent && parent.key ? parent.key : null;
          // For stacked bars, restore the original color
          if (
            stacked &&
            groupField &&
            colorFieldName &&
            groupToColor &&
            groupToColor.has(seriesKey)
          ) {
            const colorValue = groupToColor.get(seriesKey);
            const restoreObj = {};
            restoreObj[colorFieldName] = colorValue;
            d3.select(this).attr('fill', colorScale(restoreObj));
          } else {
            const restoreObj = {};
            restoreObj[colorFieldName] = seriesKey;
            d3.select(this).attr('fill', colorScale(restoreObj));
          }
        } else {
          d3.select(this).attr('fill', colorScale(bound));
        }
        hideTooltip();
      });

    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);
    if (this.options.axisFormatters && this.options.axisFormatters.x)
      xAxis.tickFormat(this.options.axisFormatters.x);
    if (this.options.axisFormatters && this.options.axisFormatters.y)
      yAxis.tickFormat(this.options.axisFormatters.y);

    const xg = this.chart
      .append('g')
      .attr('transform', `translate(0,${effectiveInnerHeight})`)
      .call(xAxis);
    try {
      const xTicks = xg.selectAll('.tick text').nodes();
      let maxTickWidth = 0,
        maxTickHeight = 0;
      if (xTicks && xTicks.length) {
        maxTickWidth = d3.max(xTicks, n => n.getBBox().width) || 0;
        maxTickHeight = d3.max(xTicks, n => n.getBBox().height) || 0;
      }
      let rotateX = false;
      if (xScale.bandwidth) {
        const bw = xScale.bandwidth();
        if (maxTickWidth > bw * 0.9) rotateX = true;
      } else if (xTicks && xTicks.length) {
        const avgSpace = Math.max(10, effectiveInnerWidth / xTicks.length);
        if (maxTickWidth > avgSpace * 0.9) rotateX = true;
      }
      if (rotateX) {
        xg.selectAll('text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end');
      }
      const xLabelPadding = Math.max(8, maxTickHeight + 8);
      this.chart
        .append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', effectiveInnerWidth / 2)
        .attr('y', effectiveInnerHeight + xLabelPadding + (rotateX ? 36 : 24))
        .attr('fill', 'black')
        .style('font-size', '14px')
        .text(
          this.options && this.options.xLabel
            ? this.options.xLabel
            : this.xField
              ? String(this.xField)
              : ''
        );
    } catch (e) {
      /* ignore x-axis measurement errors */
    }

    const yg = this.chart.append('g').call(yAxis);
    try {
      const yTicks = yg.selectAll('.tick text').nodes();
      const yMaxTickWidth =
        yTicks && yTicks.length
          ? d3.max(yTicks, n => n.getBBox().width)
          : measuredMaxTickWidth;
      const labelGap = this.yLabelGap !== undefined ? this.yLabelGap : 12;
      const measuredLabelH = measuredLabelBBoxHeight || 14;
      const labelBaseline = Math.max(
        yMaxTickWidth + labelGap,
        measuredLabelH + labelGap
      );
      const adaptivePadding = Math.min(
        36,
        Math.max(4, Math.round(yMaxTickWidth * 0.08))
      );
      let labelOffset = labelBaseline + adaptivePadding + 10;
      const measuredRequiredLeft =
        yMaxTickWidth > 0
          ? Math.ceil(yMaxTickWidth + labelGap + measuredLabelH + 8)
          : null;
      const marginLeft =
        (this.options && this.options.margin && this.options.margin.left) || 60;
      let maxAllowed = marginLeft - 4;
      if (measuredRequiredLeft != null)
        maxAllowed = Math.max(10, Math.min(maxAllowed, measuredRequiredLeft));
      else maxAllowed = Math.max(10, maxAllowed);
      if (labelOffset > maxAllowed) labelOffset = maxAllowed;
      yg.append('text')
        .attr(
          'transform',
          `translate(${-labelOffset},${effectiveInnerHeight / 2}) rotate(-90)`
        )
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(
          this.options && this.options.yLabel
            ? this.options.yLabel
            : this.yField
              ? String(this.yField)
              : ''
        );
    } catch (e) {
      this.chart
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -effectiveInnerHeight / 2)
        .attr('y', -40)
        .attr('fill', 'black')
        .style('font-size', '14px')
        .text(this.yField);
    }

    return this;
  }
}
