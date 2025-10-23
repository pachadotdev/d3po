# Module: box3
#' Box plot: Log(Weight) Distribution by Type
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box3_plot <- function(data = d3po::pokemon) {
  dout <- data
  dout$log_weight <- log10(dout$weight)
  dout$log_height <- log10(dout$height)

  d3po(dout, width = 800, height = 600) %>%
    po_box(daes(x = .data$type_1, y = .data$log_weight, color = .data$color_1)) %>%
    po_labels(title = "Log(Weight) Distribution by Type")
}

mod_box3_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_box3_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_box3_plot(data)
    })
  })
}
