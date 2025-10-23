# Module: pie3
#' Pie3 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_pie3_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout) %>%
    po_pie(
      daes(
        size = .data$count, group = .data$type, color = .data$color, startAngle = -pi / 2, endAngle = pi / 2
      )
    ) %>%
    po_labels(title = "Half Pie")
}

mod_pie3_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_pie3_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_pie3_plot(data)
    })
  })
}
