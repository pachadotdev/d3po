# Module: treemap3
#' Treemap3 plot module
#' @param data data.frame
#' @return d3po widget
mod_treemap3_plot <- function(data) {
  # placeholder for alternative tiling
  d3po(data, width = 800, height = 600) %>%
    po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "slice")) %>%
    po_labels(title = "Treemap (Slice)")
}
