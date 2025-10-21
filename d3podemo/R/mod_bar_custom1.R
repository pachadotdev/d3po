# Module: bar_custom1
mod_bar_custom1_plot <- function(data) {
  dout <- stats::aggregate(weight ~ type_1 + color_1, data = data, FUN = mean)
  names(dout) <- c("type", "color", "avg_weight")

  d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(x = .data$type, y = .data$avg_weight, color = .data$color)) %>%
    po_format(
      x = toupper(!!rlang::sym("type")),
      y = round(!!rlang::sym("avg_weight"), 2)
    ) %>%
    po_labels(x = "Type", y = "Average Weight", title = "Vertical Bars")
}
