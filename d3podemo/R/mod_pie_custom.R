# Module: pie_custom
mod_pie_custom_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1, data = data, FUN = length)
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_pie(daes(size = .data$count, group = .data$type, color = .data$color)) %>%
    po_tooltip("<b>Type: {type}</b><br/>Count: {count}") %>%
    po_labels(title = "Full Pie")
}
