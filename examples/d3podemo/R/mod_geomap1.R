# Module: geomap1
#' Geomap: South America
#' @param data data.frame (optional)
#' @return d3po widget
mod_geomap1_plot <- function(data = NULL) {
  dout <- map_ids(d3po::maps$south_america$continent)
  dout$pokemon_count <- ifelse(dout$id == "CL", 1L, 0L)
  dout$pokemon_count <- ifelse(dout$id == "GY", 1L, dout$pokemon_count)
  dout$color <- ifelse(dout$id %in% c("CL", "GY"), "#F85888", "#e0e0e0")

  d3po(dout, width = 800, height = 600) %>%
    po_geomap(daes(group = .data$id, color = .data$color, size = .data$pokemon_count, tooltip = .data$name), map = d3po::maps$south_america$continent) %>%
    po_labels(title = "Pokemon Distribution in South America") %>%
    po_tooltip("<b>Country: {name}</b><br/>Pokemon Count: {pokemon_count}")
}

mod_geomap1_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_geomap1_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_geomap1_plot()
    })
  })
}
