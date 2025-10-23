# Module: network_manual
#' Network manual layout plot module
#' @param data graph with layout
#' @return d3po widget
mod_network_manual_plot <- function(data) {
  d3po(data, width = 800, height = 600) %>%
    po_network(layout = "manual") %>%
    po_labels(title = "Network Manual")
}

mod_network_manual_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_network_manual_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_manual_plot(data)
    })
  })
}
