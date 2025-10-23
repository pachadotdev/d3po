# Module: scatter_custom
#' Scatter custom plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_scatter_custom_plot <- function(data) {
  d3po(data) %>%
    po_scatter(daes(x = .data$height, y = .data$weight, group = .data$name, color = .data$color_1), tooltip = function(d) {
      paste0(d$name, " (", d$type_1, ")")
    }) %>%
    po_labels(title = "Scatter Custom Tooltip")
}
