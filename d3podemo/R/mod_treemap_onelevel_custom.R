# Module: treemap_onelevel_custom
#' Treemap with custom labels and tooltip
#' @param data data.frame
#' @return d3po widget
mod_treemap_onelevel_custom_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1, data = data, FUN = length)
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "squarify")) %>%
    po_labels(align = "center-middle", title = "Share of Pokemon by main type") %>%
    po_tooltip("<i>Type: {type}</i><br/>Count: {count}")
}

mod_treemap_onelevel_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_treemap_onelevel_custom_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_treemap_onelevel_custom_plot(data)
    })
  })
}
