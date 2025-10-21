# Module: treemap4
mod_treemap4_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout) %>%
    po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "dice")) %>%
    po_labels(title = "Share of Pokemon by Main Type (Dice)")
}
