# Module: scatter4
#' Scatter4 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_scatter4_plot <- function(data) {
  dout <- data
  dout$log_height <- log10(dout$height)
  dout$log_weight <- log10(dout$weight)
  mean_log_weight <- mean(dout$log_weight, na.rm = TRUE)
  mean_log_height <- mean(dout$log_height, na.rm = TRUE)

  dout$distance_from_mean_log_weight <- abs(dout$log_weight - mean_log_weight)
  dout$distance_from_mean_log_height <- abs(dout$log_height - mean_log_height)
  dout$avg_distance <- (dout$distance_from_mean_log_weight + dout$distance_from_mean_log_height) / 2
  dout$inverse_distance_from_mean <- 1 / (dout$avg_distance + 0.01)

  d3po(dout) %>%
    po_scatter(daes(x = .data$log_height, y = .data$log_weight, size = .data$inverse_distance_from_mean, group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Log(Height) vs Log(Weight) (Size = 1 / Distance from the Mean)")
}
