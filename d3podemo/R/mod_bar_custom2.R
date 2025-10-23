# Module: bar_custom2
#' Bar custom2 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
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
