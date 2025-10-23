# Module: box_custom2
#' Box custom2 plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box_custom2_plot <- function(data = d3po::pokemon) {
  pokemon_custom <- data
  pokemon_custom$weight_g <- pokemon_custom$weight * 1000

  d3po(pokemon_custom, width = 800, height = 600) %>%
    po_box(daes(x = !!rlang::sym("weight_g"), y = !!rlang::sym("type_1"), color = .data$color_1)) %>%
    po_format(
      x = format(!!rlang::sym("weight_g"), big.mark = " ", scientific = FALSE),
      y = toupper(!!rlang::sym("type_1"))
    ) %>%
    po_labels(x = "Weight (g)", y = "Type", title = "Weight Distribution by Type")
}
