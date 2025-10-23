# Module: treemap1
#' Treemap1 plot module
#' @param data data.frame of pokemon or summary
#' @return d3po widget
mod_treemap1_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1, data = data, FUN = length)
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "squarify")) %>%
    po_labels(title = "Share of Pokemon by main type")
}
