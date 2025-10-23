# Module: donut
#' Donut plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_donut_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout) %>%
    po_pie(daes(size = .data$count, group = .data$type, color = .data$color, innerRadius = 0.4)) %>%
    po_labels(title = "Donut")
}

mod_donut_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_donut_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_donut_plot(data)
    })
  })
}
