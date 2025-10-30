# Module: bar9
#' Bar chart: Vertical Bars
#' @param data data.frame for bar aggregation (expects pre-aggregated if passed)
#' @return d3po widget
mod_bar9_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(cbind(count = rep(1, nrow(data))) ~ type_1, data = data, FUN = length)
  names(dout) <- c("type", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(x = .data$type, y = .data$count)) %>%
    po_labels(title = "Vertical Bars")
}

mod_bar9_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "90%", height = "600px"))
}

mod_bar9_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_bar9_plot(data)
    })
  })
}
