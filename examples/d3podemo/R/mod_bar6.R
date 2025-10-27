# Module: bar6
#' Bar chart: Vertical Bars
#' @param data data.frame for bar aggregation (expects pre-aggregated if passed)
#' @return d3po widget
mod_bar6_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1, data = data, FUN = length)
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(x = .data$type, y = .data$count, color = .data$color, sort = "desc-x")) %>%
    po_labels(title = "Vertical Bars")
}

mod_bar6_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_bar6_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_bar6_plot(data)
    })
  })
}
