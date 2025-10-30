# Module: scatter3
#' Scatter: With size encoding (inverse distance from mean)
#' @param data data.frame
#' @return d3po widget
mod_scatter3_plot <- function(data = d3po::pokemon) {
  dout <- data
  mean_weight <- mean(dout$weight, na.rm = TRUE)
  mean_height <- mean(dout$height, na.rm = TRUE)
  dout$distance_from_mean_weight <- abs(dout$weight - mean_weight)
  dout$distance_from_mean_height <- abs(dout$height - mean_height)
  dout$avg_distance <- (dout$distance_from_mean_weight + dout$distance_from_mean_height) / 2
  dout$inverse_distance_from_mean <- 1 / (dout$avg_distance + 0.01)

  d3po(dout, width = 800, height = 600) %>%
    po_scatter(daes(x = .data$height, y = .data$weight, size = .data$inverse_distance_from_mean,
      group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Height vs Weight (Size = 1 / Distance from the Mean)")
}

mod_scatter3_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_scatter3_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_scatter3_plot(data)
    })
  })
}
