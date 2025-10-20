import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  createColorScale,
  showTooltip,
  hideTooltip,
  getHighlightColor,
  maybeEvalJSFormatter,
} from '../utils.js';

export default class BarChart extends D3po {
  constructor(container, options) {
    super(container, options);
    if (!options.x || !options.y) throw new Error('Bar chart requires x and y fields');
    this.xField = options.x;
    this.yField = options.y;
    this.colorField = options.color;
  }

  render() {
    if (!this.data) throw new Error('No data provided');
    validateData(this.data, [this.xField, this.yField]);

    const firstItem = this.data[0];
    const isHorizontal = typeof firstItem[this.yField] === 'string';

    let effectiveInnerWidth = this.getInnerWidth();
    let effectiveInnerHeight = this.getInnerHeight();
  // default to true (opt-out by setting useLeftMarginSpace: false)
  const useLeftMarginSpace = (this.options && this.options.useLeftMarginSpace !== false);

    let xScale, yScale;
    if (isHorizontal) {
      xScale = d3.scaleLinear().domain([0, d3.max(this.data, d => d[this.xField])]).nice().range([0, effectiveInnerWidth]);
      yScale = d3.scaleBand().domain(this.data.map(d => d[this.yField])).range([0, effectiveInnerHeight]).padding(0.2);
    } else {
      xScale = d3.scaleBand().domain(this.data.map(d => d[this.xField])).range([0, effectiveInnerWidth]).padding(0.2);
      yScale = d3.scaleLinear().domain([0, d3.max(this.data, d => d[this.yField])]).nice().range([effectiveInnerHeight, 0]);
    }

    let measuredMaxTickWidth = 0;
    let measuredLabelBBoxHeight = 0;
    // Measure y-axis tick widths and label bbox for both orientations so reclaim logic
    // can apply to horizontal charts (where y is categorical).
    try {
      const probe = this.svg.append('g').attr('class', 'd3po-probe');
      const axis = d3.axisLeft(yScale);
      if (this.options.axisFormatters && this.options.axisFormatters.y) axis.tickFormat(this.options.axisFormatters.y);
      probe.call(axis);
      try {
        const ticks = probe.selectAll('.tick text').nodes();
        if (ticks && ticks.length) measuredMaxTickWidth = d3.max(ticks, n => n.getBBox().width) || 0;
      } catch (e) {
        void 0; // some environments may not allow getBBox on detached nodes
      }
      probe.remove();
      try {
        const lab = this.svg.append('text').attr('x', -9999).attr('y', -9999).style('font-size', '14px').text(this.yField);
        measuredLabelBBoxHeight = lab.node().getBBox().height || 0;
        lab.remove();
      } catch (e) {
        /* fallback to a reasonable default if measurement fails */
        measuredLabelBBoxHeight = 14;
      }

      const gap = (this.yLabelGap !== undefined) ? this.yLabelGap : 12;
      const requiredLeft = Math.ceil(measuredMaxTickWidth + gap + measuredLabelBBoxHeight + 8);
      const currentLeft = (this.options && this.options.margin && this.options.margin.left) || 60;
      if (requiredLeft > currentLeft) {
        this.options.margin.left = requiredLeft;
        effectiveInnerWidth = this.getInnerWidth();
        effectiveInnerHeight = this.getInnerHeight();
        if (xScale && xScale.range) xScale.range([0, effectiveInnerWidth]);
        if (yScale && yScale.range) yScale.range([effectiveInnerHeight, 0]);
        if (this.chart && this.chart.attr) this.chart.attr('transform', `translate(${this.options.margin.left},${this.options.margin.top})`);
      }
  } catch (e) { void 0; }

  if (useLeftMarginSpace && measuredMaxTickWidth > 0) {
    const gap = (this.yLabelGap !== undefined) ? this.yLabelGap : 12;
    const measuredRequiredLeft = Math.ceil(measuredMaxTickWidth + gap + measuredLabelBBoxHeight + 8);
    const marginLeft = (this.options && this.options.margin && this.options.margin.left) || 60;
    // Force the chart translate X to measuredRequiredLeft + safety buffer when the option is enabled.
    const safetyBuffer = 4; // px
    const targetLeft = Math.max(0, (measuredRequiredLeft || 0) + safetyBuffer);
    // compute reclaimed amount (positive if we free up space)
    const delta = marginLeft - targetLeft;
    // adjust effectiveInnerWidth safely
    const baseInner = this.getInnerWidth();
    const newInner = Math.max(20, Math.round(baseInner + Math.max(0, delta)));
    effectiveInnerWidth = newInner;
    if (xScale && xScale.range) xScale.range([0, effectiveInnerWidth]);
    if (yScale && yScale.range) yScale.range([effectiveInnerHeight, 0]);
    const translateX = targetLeft;
    if (this.chart && this.chart.attr) this.chart.attr('transform', `translate(${translateX},${this.options.margin.top})`);
  }

    const colorScale = createColorScale(this.data, this.colorField, d3.interpolateViridis);
    const bars = this.chart.selectAll('.bar').data(this.data).enter().append('rect').attr('class', 'bar').attr('fill', colorScale).style('opacity', 1);
    if (isHorizontal) {
      bars.attr('x', 0).attr('y', d => yScale(d[this.yField])).attr('width', d => xScale(d[this.xField])).attr('height', yScale.bandwidth());
    } else {
      bars.attr('x', d => xScale(d[this.xField])).attr('y', d => yScale(d[this.yField])).attr('width', xScale.bandwidth()).attr('height', d => effectiveInnerHeight - yScale(d[this.yField]));
    }

    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;
    const tooltipOpt = this.tooltip || this.options.tooltip || null;
    const tooltipFormatter = tooltipOpt ? maybeEvalJSFormatter(tooltipOpt) : null;

    // small helpers for tooltip content
    const escapeHtml = (str) => String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const maybeFormat = (v) => (typeof v === 'number' && Number.isFinite(v)) ? v.toFixed(2) : v;

    // capture field names for use inside event handlers
    const xField = this.xField;
    const yField = this.yField;
  const groupField = this.groupField || null;

    bars.on('mouseover', function (event, d) {
      const baseColor = d3.select(this).attr('fill');
      d3.select(this).attr('fill', getHighlightColor(baseColor));
      // replicate AreaChart's default tooltip: optional bold group, then x and y labeled on separate lines
      if (tooltipFormatter) {
        try {
          // call formatter same way as AreaChart: (null, row)
          const content = tooltipFormatter(null, d);
          showTooltip(event, content, fontFamily, fontSize);
        } catch (e) {
          const prefix = (groupField && d && d[groupField]) ? `<strong>${escapeHtml(String(d[groupField]))}</strong>` : '';
          const content = prefix + `${escapeHtml(String(xField))}: ${escapeHtml(String(maybeFormat(d[xField])))}<br/>` + `${escapeHtml(String(yField))}: ${escapeHtml(String(maybeFormat(d[yField])))}`;
          showTooltip(event, content, fontFamily, fontSize);
        }
      } else {
        // Determine which field is the category (string) and which is the measure
        const categoryField = isHorizontal ? yField : xField;
        const measureField = isHorizontal ? xField : yField;
        const categoryVal = d && d[categoryField];
        const measureVal = d && d[measureField];
        const prefix = (groupField && d && d[groupField]) ? `<strong>${escapeHtml(String(d[groupField]))}</strong><br/>` : '';
        const content = `${prefix}<strong>${escapeHtml(String(categoryVal))}</strong>${escapeHtml(String(measureField))}: ${escapeHtml(String(maybeFormat(measureVal)))}`;
        showTooltip(event, content, fontFamily, fontSize);
      }
    }).on('mouseout', function () {
      const datum = d3.select(this).datum();
      d3.select(this).attr('fill', colorScale(datum));
      hideTooltip();
    });

    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);
    if (this.options.axisFormatters && this.options.axisFormatters.x) xAxis.tickFormat(this.options.axisFormatters.x);
    if (this.options.axisFormatters && this.options.axisFormatters.y) yAxis.tickFormat(this.options.axisFormatters.y);

    const xg = this.chart.append('g').attr('transform', `translate(0,${effectiveInnerHeight})`).call(xAxis);
    try {
      const xTicks = xg.selectAll('.tick text').nodes();
      let maxTickWidth = 0, maxTickHeight = 0;
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
        xg.selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');
      }
      const xLabelPadding = Math.max(8, maxTickHeight + 8);
      this.chart.append('text').attr('class', 'x-axis-label').attr('text-anchor', 'middle').attr('x', effectiveInnerWidth / 2).attr('y', effectiveInnerHeight + xLabelPadding + (rotateX ? 36 : 24)).attr('fill', 'black').style('font-size', '14px').text(this.xField);
      } catch (e) {
        /* ignore x-axis measurement errors */
      }

    const yg = this.chart.append('g').call(yAxis);
    try {
      const yTicks = yg.selectAll('.tick text').nodes();
      const yMaxTickWidth = (yTicks && yTicks.length) ? d3.max(yTicks, n => n.getBBox().width) : measuredMaxTickWidth;
      const labelGap = (this.yLabelGap !== undefined) ? this.yLabelGap : 12;
      const measuredLabelH = measuredLabelBBoxHeight || 14;
      const labelBaseline = Math.max(yMaxTickWidth + labelGap, measuredLabelH + labelGap);
      const adaptivePadding = Math.min(36, Math.max(4, Math.round(yMaxTickWidth * 0.08)));
      let labelOffset = labelBaseline + adaptivePadding + 10;
      const measuredRequiredLeft = (yMaxTickWidth > 0) ? Math.ceil(yMaxTickWidth + labelGap + measuredLabelH + 8) : null;
      const marginLeft = (this.options && this.options.margin && this.options.margin.left) || 60;
      let maxAllowed = marginLeft - 4;
      if (measuredRequiredLeft != null) maxAllowed = Math.max(10, Math.min(maxAllowed, measuredRequiredLeft)); else maxAllowed = Math.max(10, maxAllowed);
      if (labelOffset > maxAllowed) labelOffset = maxAllowed;
      yg.append('text').attr('transform', `translate(${-labelOffset},${effectiveInnerHeight / 2}) rotate(-90)`).attr('x', 0).attr('y', 0).attr('fill', 'black').attr('text-anchor', 'middle').style('font-size', '14px').text(this.yField);
    } catch (e) {
      this.chart.append('text').attr('class', 'y-axis-label').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('x', -effectiveInnerHeight / 2).attr('y', -40).attr('fill', 'black').style('font-size', '14px').text(this.yField);
    }

    return this;
  }
}
