# Module: line_area_custom
#' Line/Area custom plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_line_area_custom_plot <- function(data) {
  dout <- data[data$name %in% c(
    "Squirtle", "Wartortle", "Blastoise",
    "Charmander", "Charmeleon", "Charizard",
    "Pikachu", "Raichu"
  ), c("name", "height", "weight", "type_1", "color_1")]

  colnames(dout) <- c("pokemon", "height", "weight", "type", "color")

  d3po(dout, width = 800, height = 600) %>%
    po_line(
      daes(
        x = .data$height, y = .data$weight, group = .data$type, name = .data$pokemon, color = .data$color
      )
    ) %>%
    po_labels(
      x = "Height (m)",
      y = "Weight (kg)",
      title = "Pokemon Evolution: Weight vs Height by Type"
    ) %>%
    po_tooltip("<b>{pokemon} ({type})</b><br/>(height, weight) = ({height}, {weight})")
}

mod_line_area_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_line_area_custom_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_line_area_custom_plot(data)
    })
  })
}
