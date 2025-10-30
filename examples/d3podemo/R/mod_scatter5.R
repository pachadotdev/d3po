# Module: scatter5
#' Scatter: Log scales with size encoding
#' @param data data.frame
#' @return d3po widget
mod_scatter5_plot <- function(data = d3po::pokemon) {
  dout <- data
  dout$log_height <- log10(dout$height)
  dout$log_weight <- log10(dout$weight)
  mean_log_weight <- mean(dout$log_weight, na.rm = TRUE)
  mean_log_height <- mean(dout$log_height, na.rm = TRUE)

  dout$distance_from_mean_log_weight <- abs(dout$log_weight - mean_log_weight)
  dout$distance_from_mean_log_height <- abs(dout$log_height - mean_log_height)
  dout$avg_distance <- (dout$distance_from_mean_log_weight + dout$distance_from_mean_log_height) / 2
  dout$inverse_distance_from_mean <- 1 / (dout$avg_distance + 0.01)

  d3po(dout, width = 800, height = 600) %>%
    po_scatter(daes(x = .data$log_height, y = .data$log_weight,
      group = .data$name, size = .data$inverse_distance_from_mean)) %>%
    po_labels(title = "Log(Height) vs Log(Weight) (Size = 1 / Distance from the Mean)")
}

mod_scatter5_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_scatter5_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_scatter5_plot(data)
    })
  })
}
