module.exports = vars => {
  var edges = vars.returned.edges || [];

  var paths = vars.g.edges.selectAll('g.d3po_edge_path').data(edges, d => {
    d.d3po.id =
      'path_' +
      d[vars.edges.source][vars.id.value] +
      '_' +
      d[vars.edges.target][vars.id.value];
    return d.d3po.id;
  });

  function pathStyles(p) {
    p.attr('d', vars.edges.path)
      .style('stroke-width', d => Math.max(1, d.dy))
      .style('stroke', '#ddd')
      .style('fill', 'none')
      .attr('transform', d => 'translate(' + d.d3po.x + ',' + d.d3po.y + ')');
  }

  if (vars.draw.timing) {
    paths
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();

    paths
      .selectAll('text.d3po_label, rect.d3po_label_bg')
      .transition()
      .duration(vars.draw.timing / 2)
      .attr('opacity', 0)
      .remove();

    paths
      .selectAll('path')
      .data(d => [d])
      .transition()
      .duration(vars.draw.timing)
      .call(pathStyles);

    paths
      .enter()
      .append('g')
      .attr('class', 'd3po_edge_path')
      .append('path')
      .style('stroke-width', 0)
      .transition()
      .duration(vars.draw.timing)
      .call(pathStyles);
  } else {
    paths.exit().remove();

    paths.selectAll('text.d3po_label, rect.d3po_label_bg').remove();

    paths
      .selectAll('path')
      .data(d => [d])
      .call(pathStyles);

    paths
      .enter()
      .append('g')
      .attr('class', 'd3po_edge_path')
      .append('path')
      .call(pathStyles);
  }
};
