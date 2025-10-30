# Module: geomap4
#' Geomap: Chile
#' @param data data.frame (optional)
#' @return d3po widget
mod_geomap4_plot <- function(data = NULL) {
  dout <- map_ids(d3po::maps$south_america$chile)
  dout$pokemon_count <- ifelse(dout$id == "MA", 1L, 0L)
  
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

  d3po(dout, width = 800, height = 600) %>%
    po_geomap(daes(group = .data$id, size = .data$pokemon_count, color = my_pal, tooltip = .data$name),
      map = d3po::maps$south_america$chile) %>%
    po_labels(title = "Pokemon Distribution in Chile") %>%
    po_tooltip("<b>Region: {name}</b><br/>Pokemon Count: {pokemon_count}")
}

mod_geomap4_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_geomap4_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_geomap4_plot()
    })
  })
}
