# Module: geomap5
#' Geomap: Chile
#' @param data data.frame (optional)
#' @return d3po widget
mod_geomap5_plot <- function(data = NULL) {
  dout <- map_ids(d3po::maps$south_america$chile)
  dout$pokemon_count <- ifelse(dout$id == "MA", 1L, 0L)
  
  # my_gradient <- viridisLite::viridis(5)
  # my_gradient <- viridisLite::magma(5)
  my_gradient <- c("#7e2119", "#cf3a33", "#ec5938", "#ee874d", "#f6cc84")

  d3po(dout, width = 800, height = 600) %>%
    po_geomap(daes(group = .data$id, size = .data$pokemon_count, color = my_gradient, gradient = TRUE,
      tooltip = .data$name), map = d3po::maps$south_america$chile) %>%
    po_labels(title = "Pokemon Distribution in Chile") %>%
    po_tooltip("<b>Region: {name}</b><br/>Pokemon Count: {pokemon_count}")
}

mod_geomap5_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_geomap5_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_geomap5_plot()
    })
  })
}
