# Module: pie5
#' Pie chart: Full Pie
#' @param data data.frame
#' @return d3po widget
mod_pie5_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(cbind(count = rep(1, nrow(data))) ~ type_1, data = data, FUN = length)
  names(dout) <- c("type", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_pie(daes(size = .data$count, group = .data$type)) %>%
    po_labels(title = "Full Pie")
}

mod_pie5_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_pie_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_pie_plot(data)
    })
  })
}
