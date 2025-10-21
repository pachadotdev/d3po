# Module: box1
#' Box1 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box1_plot <- function(data) {
  d3po(data) %>%
    po_box(daes(x = .data$type_1, y = .data$weight, color = .data$color_1)) %>%
    po_labels(title = "Weight Distribution by Type")
}
