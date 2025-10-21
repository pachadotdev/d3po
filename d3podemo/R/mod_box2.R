# Module: box2
#' Box2 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box2_plot <- function(data) {
  d3po(data) %>%
    po_box(daes(x = .data$height, y = .data$type_1, color = .data$color_1)) %>%
    po_labels(title = "Height Distribution by Type")
}
