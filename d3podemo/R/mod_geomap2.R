# Module: geomap2
mod_geomap2_plot <- function() {
  maps <- d3po::maps
  dout <- map_ids(maps$south_america$chile)
  dout$pokemon_count <- ifelse(dout$id == "MA", 1L, 0L)
  dout$color <- ifelse(dout$id == "MA", "#F85888", "#e0e0e0")

  d3po(dout) %>%
    po_geomap(
      daes(group = .data$id, color = .data$color, size = .data$pokemon_count, tooltip = .data$name),
      map = maps$south_america$chile
    ) %>%
    po_labels(title = "Pokemon Distribution in Chile")
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
