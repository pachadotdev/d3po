# Module: network_kk_colorsvector
#' Network: KK layout
#' @param data data.frame (pokemon_network expected)
#' @return d3po widget
mod_network_kk_colorsvector_plot <- function(data = d3po::pokemon_network) {
  # generate 15 colours using tintin
  # tintin::tintin_clrs(n = length(unique(data$type_1)), alpha = 0.7)

  # with transparency
  my_pal <- c("#1D8FAEB3", "#296576B3", "#3D5153B3", "#4A8496B3", "#633945B3", "#666559B3",
    "#7F5133B3", "#A4663CB3", "#A73234B3", "#A9906DB3", "#AF1727B3", "#CA171AB3",
    "#D68555B3", "#E12C29B3", "#E30013B3")

  # without transparency
  # my_pal <- c("#1D8FAE", "#296576", "#3D5153", "#4A8496", "#633945", "#666559",
  #   "#7F5133", "#A4663C", "#A73234", "#A9906D", "#AF1727", "#CA171A",
  #   "#D68555", "#E12C29", "#E30013")

  d3po(data, width = 800, height = 600) %>%
    po_network(daes(size = .data$node_size, color = my_pal, layout = "kk")) %>%
    po_labels(title = "Pokemon Type Network (KK Layout)")
}

mod_network_kk_colorsvector_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_network_kk_colorsvector_server <- function(id, data = d3po::pokemon_network) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_network_kk_colorsvector_plot(data)
    })
  })
}
