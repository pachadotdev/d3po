# Module: network_custom
mod_network_custom_plot <- function() {
  pokemon_network <- d3po::pokemon_network
  d3po(pokemon_network, width = 800, height = 600) %>%
    po_network(daes(size = .data$node_size, color = .data$color, layout = "kk")) %>%
    po_tooltip("{name} node size: {node_size}") %>%
    po_labels(title = "Pokemon Type Network (Custom Tooltip)")
}
