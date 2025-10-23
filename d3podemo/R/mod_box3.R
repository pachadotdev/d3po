# Module: box3 (log weight)
#' Box3 plot module (log weight)
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box3_plot <- function(data) {
  dout <- data
  dout$log_weight <- log10(dout$weight)

  d3po(dout) %>%
    po_box(daes(x = .data$type_1, y = .data$log_weight, color = .data$color_1)) %>%
    po_labels(title = "Log(Weight) Distribution by Type")
}
