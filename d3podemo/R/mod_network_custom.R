# Module: network_custom
#' Network custom tooltip module
#' @param data graph
#' @return d3po widget
mod_network_custom_plot <- function(data) {
  d3po(data, width = 800, height = 600) %>%
    po_network(layout = "kk") %>%
    po_labels(title = "Network (Custom Tooltip)")
}
