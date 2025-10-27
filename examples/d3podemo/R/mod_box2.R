# Module: box2
#' Box plot: Height Distribution by Type (horizontal)
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box2_plot <- function(data = d3po::pokemon) {
  d3po(data, width = 800, height = 600) %>%
    po_box(daes(x = .data$height, y = .data$type_1, color = .data$color_1)) %>%
    po_labels(title = "Height Distribution by Type")
}

mod_box2_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_box2_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_box2_plot(data)
    })
  })
}
