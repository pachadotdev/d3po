# Module: box4 (log height)
#' Box4 plot module (log height)
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box4_plot <- function(data) {
  dout <- data
  dout$log_height <- log10(dout$height)

  d3po(dout) %>%
    po_box(daes(x = .data$log_height, y = .data$type_1, color = .data$color_1)) %>%
    po_labels(title = "Log(Height) Distribution by Type") %>%
    po_box(daes(x = .data$log_height, y = .data$type_1, color = .data$color_1), normalize = TRUE)
}
