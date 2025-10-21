# Module: network_fr
mod_network_fr_plot <- function() {
  pokemon_network <- d3po::pokemon_network
  d3po(pokemon_network) %>%
    po_network(daes(size = .data$node_size, color = .data$color, layout = "fr")) %>%
    po_labels(title = "Pokemon Type Network (FR Layout)")
}

mod_network_fr_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_network_fr_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_fr_plot()
    })
  })
}
