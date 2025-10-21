# Module: scatter3
mod_scatter3_plot <- function(data) {
  d3po(data) %>%
    po_scatter(daes(
      x = .data$height, y = .data$weight, size = .data$inverse_distance_from_mean,
      group = .data$name, color = .data$color_1
    )) %>%
    po_labels(title = "Height vs Weight (Size = 1 / Distance from the Mean)")
}
