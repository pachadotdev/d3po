# Module: network_kk
#' Network KK layout plot module
#' @param data graph or nodes/edges
#' @return d3po widget
mod_network_kk_plot <- function(data) {
  d3po(data, width = 800, height = 600) %>%
    po_network(layout = "kk") %>%
    po_labels(title = "Network KK")
}

mod_network_kk_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_network_kk_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_kk_plot(data)
    })
  })
}
