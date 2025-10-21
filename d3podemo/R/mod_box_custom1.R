# Module: box_custom1
mod_box_custom1_plot <- function(data = d3po::pokemon) {
  pokemon_custom <- data
  pokemon_custom$weight_g <- pokemon_custom$weight * 1000

  d3po(pokemon_custom, width = 800, height = 600) %>%
    po_box(daes(x = .data$type_1, y = .data$weight_g, color = .data$color_1)) %>%
    po_format(
      x = toupper(!!rlang::sym("type_1")),
      y = format(!!rlang::sym("weight_g"), big.mark = " ", scientific = FALSE)
    ) %>%
    po_labels(x = "Type", y = "Weight (g)", title = "Weight Distribution by Type")
}
