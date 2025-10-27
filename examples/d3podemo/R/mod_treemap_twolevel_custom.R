# Module: treemap_twolevel_custom
#' Two-level Treemap with custom labels and tooltip
#' @param data data.frame
#' @return d3po widget
mod_treemap_twolevel_custom_plot <- function(data = d3po::pokemon) {
  type2tmp <- as.character(data$type_2)
  type2tmp[is.na(type2tmp)] <- "only"
  dout <- aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + type2tmp + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type1", "type2", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_treemap(
      daes(
        size = .data$count, group = .data$type1, subgroup = .data$type2, color = .data$color, tiling = "squarify"
      )
    ) %>%
    po_labels(
      align = "center-middle",
      title = "Two-level Treemap by Type 1 and Type 2 (click to drill in/out)",
      subtitle = JS(
        "function(_v, row) {
          // row.mode is 'aggregated' | 'flat' | 'drilled'
          if (row && row.mode === 'drilled') return 'Displaying Sub-Type';
          return 'Displaying Main Type';\
        }"
      )
    ) %>%
    po_tooltip(JS(
      "function(percentage, row) {
        var pct = (percentage).toFixed(1) + '%';

        // Minimal tooltip: rely on row.count and explicit row.type1 / row.type2
        var count = row && row.count != null ? row.count : '';

        if (!row || !row.type2) {
          var t1 = row && (row.type1 || row.name) ? (row.type1 || row.name) : '';
          return '<i>Type 1: ' + t1 + '</i><br/>Count: ' + count + '<br/>Percentage: ' + pct;
        }

        // When type2 is the placeholder 'only', hide the Type 2 row in the tooltip
        if (row.type2 === 'only') {
          return '<i>Type 1: ' + (row.type1 || '') + '</i><br/>Count: ' + count + '<br/>Percentage: ' + pct;
        }

        return '<i>Type 1: ' + (row.type1 || '') + '<br/>Type 2: ' + (row.type2 || '') + '</i><br/>Count: ' + count + '<br/>Percentage: ' + pct;
      }"
    ))
}

mod_treemap_twolevel_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_treemap_twolevel_custom_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_treemap_twolevel_custom_plot(data)
    })
  })
}
