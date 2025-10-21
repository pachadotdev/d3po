# Module: network_manual
mod_network_manual_plot <- function() {
  pokemon_network <- d3po::pokemon_network
  d3po(pokemon_network) %>%
    po_network(daes(size = .data$node_size, color = .data$color)) %>%
    po_labels(title = "Pokemon Type Network (Manual Layout)")
}

mod_network_manual_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_network_manual_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_manual_plot()
    })
  })
}
