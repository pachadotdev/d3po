# Module: geomap_custom
#' Geomap custom tooltip module
#' @param data data.frame
#' @return d3po widget
mod_geomap_custom_plot <- function(data) {
  # reuse the South America geomap implementation (no data needed)
  mod_geomap1_plot()
}

mod_geomap_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_geomap_custom_server <- function(id, data = NULL) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_geomap_custom_plot(data)
    })
  })
}
