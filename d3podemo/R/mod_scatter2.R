# Module: scatter2
#' Scatter: Log(Height) vs Log(Weight)
#' @param data data.frame
#' @return d3po widget
mod_scatter2_plot <- function(data = d3po::pokemon) {
  dout <- data
  dout$log_height <- log10(dout$height)
  dout$log_weight <- log10(dout$weight)
  d3po(dout, width = 800, height = 600) %>%
    po_scatter(daes(x = .data$log_height, y = .data$log_weight, group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Log(Height) vs Log(Weight)")
}

mod_scatter2_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_scatter2_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_scatter2_plot(data)
    })
  })
}
