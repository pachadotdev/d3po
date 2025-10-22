#' Treemap with custom labels and tooltip (more label changes)
#'
#' @param data Data frame (pokemon)
#' @return d3po htmlwidget
#' @import d3po
#' @importFrom stats aggregate
#' @importFrom htmlwidgets JS
#' @noRd
mod_treemap_custom2_plot <- function(data) {
  pokemon <- data

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
      title = "Share of Pokemon by main type",
      labels = htmlwidgets::JS(
        "function(percentage, row) {\
            var pct = (percentage).toFixed(1) + '%';
            var name = (row && (row.type || row.name)) ? (row.type || row.name) : '';
            var count = row && (row.count != null ? row.count : (row.value != null ? row.value : ''));
            return '<i>' + name + '</i><br/>Count: ' + (count || '') + '<br/>Share: ' + pct;
        }"
      )
    ) %>%
    d3po::po_tooltip("<i>Type: {type}</i><br/>Count: {count}")
}
