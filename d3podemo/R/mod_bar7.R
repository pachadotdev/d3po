# Module: bar7
#' Bar chart: Horizontal Bars
#' @param data data.frame
#' @return d3po widget
mod_bar7_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1, data = data, FUN = length)
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(x = .data$count, y = .data$type, color = .data$color, sort = "asc-x")) %>%
    po_labels(title = "Horizontal Bars")
}

mod_bar7_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_bar7_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_bar7_plot(data)
    })
  })
}
