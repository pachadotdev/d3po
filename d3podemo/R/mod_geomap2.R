# Module: geomap2
#' Geomap: Chile
#' @param data data.frame (optional)
#' @return d3po widget
mod_geomap2_plot <- function(data = NULL) {
  dout <- map_ids(d3po::maps$south_america$chile)
  dout$pokemon_count <- ifelse(dout$id == "MA", 1L, 0L)
  dout$color <- ifelse(dout$id == "MA", "#F85888", "#e0e0e0")

  d3po(dout, width = 800, height = 600) %>%
    po_geomap(daes(group = .data$id, color = .data$color, size = .data$pokemon_count, tooltip = .data$name), map = d3po::maps$south_america$chile) %>%
    po_labels(title = "Pokemon Distribution in Chile") %>%
    po_tooltip("<b>Region: {name}</b><br/>Pokemon Count: {pokemon_count}")
}

mod_geomap2_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_geomap2_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_geomap2_plot()
    })
  })
}
