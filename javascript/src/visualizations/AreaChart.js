// Overwrite: minimal, correct AreaChart implementation
import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  escapeHtml,
  resolveTooltipFormatter,
  showTooltipWithFormatter,
  hideTooltip,
  getHighlightColor,
  tintColor,
  createColorScale,
} from '../utils.js';

export default class AreaChart extends D3po {
  constructor(container, options) {
    super(container, options);
    if (!options || !options.x || !options.y)
      throw new Error('Area chart requires x and y fields');
    this.xField = options.x;
    this.yField = options.y;
    this.groupField = options.group;
    this.colorField = options.color;
  }

  render() {
    if (!this.data) throw new Error('No data provided');
    validateData(this.data, [this.xField, this.yField]);

    const useStack = !!(
      this.options &&
      (this.options.stack === true || this.options.type === 'stacked')
    );

    // build x domain/scale
    const xVals = Array.from(new Set(this.data.map(d => d[this.xField]))).sort(
      (a, b) => a - b
    );
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(xVals))
      .nice()
      .range([0, this.getInnerWidth()]);

    // prepare stacking if requested
    let seriesStack = null;
    let groups = [];
    let yMax = d3.max(this.data, d => +d[this.yField] || 0) || 0;

    if (useStack && this.groupField) {
      groups = Array.from(
        new Set(
          this.data.map(d =>
            String(d[this.groupField] == null ? '' : d[this.groupField])
          )
        )
      );

      const rows = xVals.map(x => {
        const r = { [this.xField]: x };
        groups.forEach(g => (r[g] = 0));
        return r;
      });

      const byX = new Map(rows.map(r => [String(r[this.xField]), r]));
      this.data.forEach(d => {
        const x = d[this.xField];
        const g = String(d[this.groupField] == null ? '' : d[this.groupField]);
        const v = Number(d[this.yField]) || 0;
        const r = byX.get(String(x));
        if (r) r[g] = (r[g] || 0) + v;
      });

      // compute stack and align group ordering with stack output
      seriesStack = d3.stack().keys(groups)(rows);
      groups = seriesStack.map(s => String(s.key));
      yMax =
        d3.max(rows, r => groups.reduce((a, g) => a + (r[g] || 0), 0)) || 0;
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([this.getInnerHeight(), 0]);

    // axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    if (this.options && this.options.axisFormatters) {
      if (this.options.axisFormatters.x)
        xAxis.tickFormat(this.options.axisFormatters.x);
      if (this.options.axisFormatters.y)
        yAxis.tickFormat(this.options.axisFormatters.y);
    }

    // axis label text values (declare before use to avoid TDZ)
    const xLabelText =
      this.options &&
      (this.options.xLabel ||
        (this.options.axisLabels && this.options.axisLabels.x))
        ? this.options.xLabel || this.options.axisLabels.x
        : this.xField
          ? String(this.xField)
          : '';
    const yLabelText =
      this.options &&
      (this.options.yLabel ||
        (this.options.axisLabels && this.options.axisLabels.y))
        ? this.options.yLabel || this.options.axisLabels.y
        : this.yField
          ? String(this.yField)
          : '';

    this.chart
      .append('g')
      .attr('transform', `translate(0,${this.getInnerHeight()})`)
      .call(xAxis);
    this.chart.append('g').call(yAxis);

    // simple axis labels if provided
    if (xLabelText) {
      this.chart
        .append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', this.getInnerWidth() / 2)
        .attr(
          'y',
          this.getInnerHeight() +
            (this.options && this.options.axisLabelOffsetY
              ? this.options.axisLabelOffsetY
              : 30)
        )
        .style(
          'font-family',
          this.options && this.options.fontFamily
            ? this.options.fontFamily
            : null
        )
        .style(
          'font-size',
          this.options && this.options.fontSize
            ? `${this.options.fontSize}px`
            : null
        )
        .text(String(xLabelText));
    }
    if (yLabelText) {
      this.chart
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('text-anchor', 'middle')
        .attr(
          'transform',
          `translate(${-40},${this.getInnerHeight() / 2}) rotate(-90)`
        )
        .style(
          'font-family',
          this.options && this.options.fontFamily
            ? this.options.fontFamily
            : null
        )
        .style(
          'font-size',
          this.options && this.options.fontSize
            ? `${this.options.fontSize}px`
            : null
        )
        .text(String(yLabelText));
    }

    const tooltipFormatter = resolveTooltipFormatter(
      this.tooltip,
      this.options && this.options.tooltip
    );
    const colorScale = createColorScale(
      this.data,
      this.colorField,
      d3.interpolateViridis
    );
    // Helper: Title Case conversion for tooltip display
    const toTitleCase = s => {
      if (s == null) return s;
      return String(s).replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };

    // axis labels (already declared above)

    if (useStack && this.groupField && seriesStack) {
      const stackArea = d3
        .area()
        .x(d => xScale(d.data[this.xField]))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveLinear);

      seriesStack.forEach((s, i) => {
        const key = groups[i];
        const sampleRow = this.data.find(
          r => String(r[this.groupField]) === key
        );
        const fill = sampleRow
          ? colorScale(sampleRow)
          : colorScale({ group: key });

        // draw band: prefer a tinted fill (blend with white) instead of using transparency.
        // Backwards compatible: if user explicitly provided stackFillOpacity, respect it.
        const stackFillOpacityExplicit =
          this.options && this.options.stackFillOpacity != null;
        const stackTint =
          this.options && this.options.stackTint != null
            ? Number(this.options.stackTint)
            : 0.3; // default tint fraction
        const computedFill = stackFillOpacityExplicit
          ? fill || colorScale(key)
          : tintColor(fill || colorScale(key), stackTint);

        this.chart
          .append('path')
          .datum(s)
          .attr('d', stackArea)
          .attr('fill', computedFill)
          .attr(
            'fill-opacity',
            stackFillOpacityExplicit ? this.options.stackFillOpacity : 1
          );

        // draw top edge line
        const topLine = d3
          .line()
          .x(d => xScale(d.data[this.xField]))
          .y(d => yScale(d[1]))
          .curve(d3.curveLinear);
        this.chart
          .append('path')
          .datum(s)
          .attr('d', topLine)
          .attr('fill', 'none')
          .attr('stroke', fill || colorScale(key))
          .attr('stroke-width', 1.5);

        // draw top edge points (rendered later into points-layer)
      });

      // after drawing all stacked areas/lines, append points in a top layer
      const pointsLayer = this.chart.append('g').attr('class', 'points-layer');
      seriesStack.forEach((s, i) => {
        const key = groups[i];
        const sampleRow = this.data.find(
          r => String(r[this.groupField]) === key
        );
        const fill = sampleRow
          ? colorScale(sampleRow)
          : colorScale({ group: key });
        pointsLayer
          .selectAll(`.point-stack-${i}`)
          .data(s)
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d.data[this.xField]))
          .attr('cy', d => yScale(d[1]))
          .attr('r', 4)
          .attr('fill', fill || colorScale(key))
          .attr('stroke', '#fff')
          .each(function () {
            this.__origR = +d3.select(this).attr('r');
            this.__origFill = d3.select(this).attr('fill');
          })
          .on('mouseover', (event, d) => {
            const node = event.currentTarget;
            const sel = d3.select(node);
            const baseColor = sel.attr('fill') || fill || colorScale(key);
            sel.raise().attr('r', 8).attr('fill', getHighlightColor(baseColor));
            const rowObj = d.data || d;
            const fallback = () =>
              `<strong>${escapeHtml(String(toTitleCase(key)))}</strong>${escapeHtml(String(toTitleCase(this.xField)))}: ${escapeHtml(String(d.data[this.xField]))}<br/>Value: ${escapeHtml(String((d[1] - d[0]).toFixed ? (d[1] - d[0]).toFixed(6) : d[1] - d[0]))}`;
            showTooltipWithFormatter(
              event,
              tooltipFormatter,
              null,
              rowObj,
              this.options && this.options.fontFamily,
              this.options && this.options.fontSize,
              fallback
            );
          })
          .on('mouseout', function () {
            const sel = d3.select(this);
            if (this.__origR != null) sel.attr('r', this.__origR);
            if (this.__origFill != null) sel.attr('fill', this.__origFill);
            hideTooltip();
          });
      });
    } else {
      // non-stacked: render series per group or single series
      let series = [this.data];
      if (this.groupField) {
        const grouped = d3.group(this.data, d => d[this.groupField]);
        series = Array.from(grouped.values());

        // sort series so that larger totals are drawn first and smaller areas are on top
        series = series.map(s => ({
          series: s,
          total: d3.sum(s, d => Number(d[this.yField]) || 0),
        }));
        series.sort((a, b) => b.total - a.total); // descending totals
        series = series.map(s => s.series);
      }

      const area = d3
        .area()
        .x(d => xScale(d[this.xField]))
        .y0(this.getInnerHeight())
        .y1(d => yScale(d[this.yField]))
        .curve(d3.curveLinear);
      const line = d3
        .line()
        .x(d => xScale(d[this.xField]))
        .y(d => yScale(d[this.yField]))
        .curve(d3.curveLinear);

      series.forEach((s, i) => {
        const col = s[0] ? colorScale(s[0]) : colorScale({ group: i });
        // Render area but make it non-interactive so points can receive pointer events
        // Prefer a tinted fill (blend with white) instead of lowering opacity.
        const areaFillOpacityExplicit =
          this.options && this.options.areaFillOpacity != null;
        const areaTint =
          this.options && this.options.areaTint != null
            ? Number(this.options.areaTint)
            : 0.12;
        const computedAreaFill = areaFillOpacityExplicit
          ? col
          : tintColor(col, areaTint);

        this.chart
          .append('path')
          .datum(s)
          .attr('d', area)
          .attr('fill', computedAreaFill)
          .attr(
            'fill-opacity',
            areaFillOpacityExplicit ? this.options.areaFillOpacity : 1
          )
          .attr('stroke', col)
          .attr('stroke-width', 1)
          .style('pointer-events', 'none');

        // Top line for clarity
        this.chart
          .append('path')
          .datum(s)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', col)
          .attr('stroke-width', 1.5)
          .style('pointer-events', 'none');

        // Points: ensure pointer events and add click handler so all points are clickable
        // Will be rendered later into the top-level points-layer
      });

      // after drawing all non-stacked areas/lines, append points in a top layer
      const pointsLayer = this.chart.append('g').attr('class', 'points-layer');
      series.forEach((s, i) => {
        const col = s[0] ? colorScale(s[0]) : colorScale({ group: i });
        pointsLayer
          .selectAll(`.point-${i}`)
          .data(s)
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d[this.xField]))
          .attr('cy', d => yScale(d[this.yField]))
          .attr('r', 4)
          .attr('fill', col)
          .attr('stroke', '#fff')
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')
          .each(function () {
            this.__origR = +d3.select(this).attr('r');
            this.__origFill = d3.select(this).attr('fill');
          })
          .on('mouseover', (event, d) => {
            const node = event.currentTarget;
            const sel = d3.select(node);
            const baseColor = sel.attr('fill') || col;
            sel.raise().attr('r', 8).attr('fill', getHighlightColor(baseColor));
            const rowObj = d || null;
            const fallback = () => {
              const groupLine =
                this.groupField && s[0] && s[0][this.groupField] != null
                  ? `<strong>${escapeHtml(String(toTitleCase(d[this.groupField] || s[0][this.groupField])))}</strong>`
                  : '';
              return `${groupLine}${escapeHtml(String(toTitleCase(this.xField)))}: ${escapeHtml(String(d[this.xField]))}<br/>${escapeHtml(String(toTitleCase(this.yField)))}: ${escapeHtml(String(d[this.yField]))}`;
            };
            showTooltipWithFormatter(
              event,
              tooltipFormatter,
              null,
              rowObj,
              this.options && this.options.fontFamily,
              this.options && this.options.fontSize,
              fallback
            );
          })
          .on('click', (event, d) => {
            const rowObj = d || null;
            const fallback = () => {
              const groupLine =
                this.groupField && s[0] && s[0][this.groupField] != null
                  ? `<strong>${escapeHtml(String(toTitleCase(d[this.groupField] || s[0][this.groupField])))}</strong><br/>`
                  : '';
              return `${groupLine}${escapeHtml(String(toTitleCase(this.xField)))}: ${escapeHtml(String(d[this.xField]))}<br/>${escapeHtml(String(toTitleCase(this.yField)))}: ${escapeHtml(String(d[this.yField]))}`;
            };
            showTooltipWithFormatter(
              event,
              tooltipFormatter,
              null,
              rowObj,
              this.options && this.options.fontFamily,
              this.options && this.options.fontSize,
              fallback
            );
          })
          .on('mouseout', function () {
            const sel = d3.select(this);
            if (this.__origR != null) sel.attr('r', this.__origR);
            if (this.__origFill != null) sel.attr('fill', this.__origFill);
            hideTooltip();
          });
      });
    }

    return this;
  }
}
