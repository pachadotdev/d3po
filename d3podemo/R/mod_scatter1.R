# Module: scatter1
#' Scatter1 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_scatter1_plot <- function(data) {
  d3po(data) %>%
    po_scatter(daes(x = .data$height, y = .data$weight, group = .data$name, color = .data$color_1)) %>%
    po_labels(title = "Height vs Weight")
}
