# Module: treemap2
#' Treemap2 (two-level) plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_treemap2_plot <- function(data) {
  type2tmp <- as.character(data$type_2)
  type2tmp[is.na(type2tmp)] <- "only"

  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + type2tmp + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type1", "type2", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_treemap(
      daes(
        size = .data$count, group = .data$type1, subgroup = .data$type2, color = .data$color, tiling = "squarify"
      )
    ) %>%
    po_labels(title = "Two-level Treemap by Type 1 and Type 2 (click to drill in/out)")
}
