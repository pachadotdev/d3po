#' Treemap with custom labels and tooltip
#'
#' @param data Data frame (pokemon)
#' @return d3po htmlwidget
#' @import d3po
#' @importFrom stats aggregate
#' @importFrom htmlwidgets JS
#' @noRd
mod_treemap_custom_plot <- function(data) {
  # Expecting original pokemon dataset; if `data` is the pokemon dataset, use it
  pokemon <- data

  # Prepare aggregated data
  dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1, data = pokemon, FUN = length)
  names(dout) <- c("type", "color", "count")

  d3po::d3po(dout, width = 800, height = 600) %>%
    d3po::po_treemap(
      daes(
        size = .data$count, group = .data$type, color = .data$color, tiling = "squarify"
      )
    ) %>%
    d3po::po_labels(
      align = "center-middle",
      title = "Share of Pokemon by main type"
    ) %>%
    d3po::po_tooltip("<i>Type: {type}</i><br/>Count: {count}")
}
