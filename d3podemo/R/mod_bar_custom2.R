# Module: bar_custom2
mod_bar_custom2_plot <- function(data) {
  dout <- stats::aggregate(weight ~ type_1 + color_1, data = data, FUN = mean)
  names(dout) <- c("type", "color", "avg_weight")

  d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(x = .data$avg_weight, y = .data$type, color = .data$color)) %>%
    po_format(
      x = round(!!rlang::sym("avg_weight"), 2),
      y = toupper(!!rlang::sym("type"))
    ) %>%
    po_labels(x = "Average Weight", y = "Type", title = "Horizontal Bars")
}
