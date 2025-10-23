# Module: bar2
#' Bar2 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_bar2_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout) %>%
    po_bar(daes(x = .data$count, y = .data$type, color = .data$color)) %>%
    po_labels(title = "Pokemon Count by Type (Horizontal)")
}
