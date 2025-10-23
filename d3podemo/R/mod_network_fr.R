# Module: network_fr
#' Network FR layout plot module
#' @param data graph or nodes/edges
#' @return d3po widget
mod_network_fr_plot <- function(data) {
  d3po(data, width = 800, height = 600) %>%
    po_network(layout = "fr") %>%
    po_labels(title = "Network FR")
}

mod_network_fr_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_network_fr_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_fr_plot(data)
    })
  })
}
