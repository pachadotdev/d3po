# Module: box4
#' Box plot: Log(Height) Distribution by Type
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box4_plot <- function(data = d3po::pokemon) {
  dout <- data
  dout$log_weight <- log10(dout$weight)
  dout$log_height <- log10(dout$height)

  d3po(dout, width = 800, height = 600) %>%
    po_box(daes(x = .data$log_height, y = .data$type_1, color = .data$color_1)) %>%
    po_labels(title = "Log(Height) Distribution by Type")
}

mod_box4_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_box4_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_box4_plot(data)
    })
  })
}
