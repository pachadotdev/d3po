# Module: scatter2
#' Scatter2 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_scatter2_plot <- function(data) {
  dout <- data
  dout$log_height <- log10(dout$height)
  dout$log_weight <- log10(dout$weight)

  d3po(dout) %>%
    po_scatter(daes(x = .data$log_height, y = .data$log_weight, group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Log(Height) vs Log(Weight)")
}
