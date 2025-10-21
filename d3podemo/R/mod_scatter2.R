# Module: scatter2
mod_scatter2_plot <- function(data) {
  d3po(data) %>%
    po_scatter(daes(x = .data$log_height, y = .data$log_weight, group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Log(Height) vs Log(Weight)")
}
