# Module: scatter_custom
#' Scatter custom tooltip
#' @param data data.frame
#' @return d3po widget
mod_scatter_custom_plot <- function(data = d3po::pokemon) {
  d3po(data, width = 800, height = 600) %>%
    po_scatter(daes(x = .data$height, y = .data$weight, group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Height vs Weight") %>%
    po_tooltip("<b>{name}</b><br/>(height, weight) = ({height}, {weight})")
}

mod_scatter_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_scatter_custom_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_scatter_custom_plot(data)
    })
  })
}
