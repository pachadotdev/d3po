# Module: scatter4
mod_scatter4_plot <- function(data) {
  d3po(data) %>%
    po_scatter(daes(
      x = .data$log_height, y = .data$log_weight, size = .data$inverse_distance_from_mean,
      group = .data$name, color = .data$color_1
    )) %>%
    po_labels(title = "Log(Height) vs Log(Weight) (Size = 1 / Distance from the Mean)")
}
