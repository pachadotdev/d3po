# Module: treemap4
#' Treemap4 plot module
#' @param data data.frame
#' @return d3po widget
mod_treemap4_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "dice")) %>%
    po_labels(title = "Treemap (Dice)")
}
