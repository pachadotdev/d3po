# Module: network_manual
#' Network: manual layout (uses precomputed layout)
#' @param data data.frame (pokemon_network expected)
#' @return d3po widget
mod_network_manual_plot <- function(data = d3po::pokemon_network) {
  d3po(data, width = 800, height = 600) %>%
    po_network(daes(size = .data$node_size, color = .data$color)) %>%
    po_labels(title = "Pokemon Type Network (Manual Positions)")
}

mod_network_manual_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_network_manual_server <- function(id, data = d3po::pokemon_network) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_manual_plot(data)
    })
  })
}
