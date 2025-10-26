# Module: box_custom2
#' Custom Box plot: custom background, axis and tooltip colors
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box_custom2_plot <- function(data = d3po::pokemon) {
  d3po(data, width = 800, height = 600) %>%
    po_box(daes(x = .data$type_1, y = .data$weight, color = .data$color_1)) %>%
    po_labels(title = "Weight Distribution by Type") %>%
    po_background("#f8f9fa") %>%
    po_theme(axis = "#001b69", tooltip = "#001b69")
}

mod_box_custom2_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_box_custom2_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_box_custom2_plot(data)
    })
  })
}
