# Module: box_custom
#' Custom Box plot: Weight in grams (custom example)
#' @param data data.frame of pokemon
#' @return d3po widget
mod_box_custom_plot <- function(data = d3po::pokemon) {
  pokemon_custom <- data
  pokemon_custom$weight_g <- pokemon_custom$weight * 1000

  # Vertical boxes: x = type (uppercase), y = weight_g
  p1 <- d3po(pokemon_custom, width = 800, height = 600) %>%
    po_box(daes(x = .data$type_1, y = .data$weight_g, color = .data$color_1)) %>%
    po_format(
      x = toupper(pokemon_custom$type_1),
      y = format(pokemon_custom$weight_g, big.mark = " ", scientific = FALSE)
    ) %>%
    po_labels(
      x = "Pokemon Type (uppercase)",
      y = "Weight (grams)",
      title = "Weight Distribution by Type"
    )

  # Horizontal boxes: x = weight_g, y = type (uppercase)
  invisible(
    d3po(pokemon_custom, width = 800, height = 600) %>%
      po_box(daes(x = .data$weight_g, y = .data$type_1, color = .data$color_1)) %>%
      po_format(
        x = format(pokemon_custom$weight_g, big.mark = " ", scientific = FALSE),
        y = toupper(pokemon_custom$type_1)
      ) %>%
      po_labels(
        x = "Weight (grams)",
        y = "Pokemon Type (uppercase)",
        title = "Weight Distribution by Type"
      )
  )

  # Return the vertical boxes by default (consistent with other modules)
  p1
}

mod_box_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_box_custom_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_box_custom_plot(data)
    })
  })
}
