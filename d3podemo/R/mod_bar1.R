# Module: bar1
mod_bar1_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout) %>%
    po_bar(daes(x = .data$type, y = .data$count, color = .data$color)) %>%
    po_labels(title = "Pokemon Count by Type (Vertical)")
}
