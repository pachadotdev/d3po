# Module: scatter_custom
mod_scatter_custom_plot <- function(data) {
  d3po(data, width = 800, height = 600) %>%
    po_scatter(daes(
      x = .data$height, y = .data$weight, group = .data$name, color = .data$color_1
    )) %>%
    po_tooltip("<b>{name}</b><br/>(height, weight) = ({height}, {weight})") %>%
    po_labels(title = "Height vs Weight")
}
