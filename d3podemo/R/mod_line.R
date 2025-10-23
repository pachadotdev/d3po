# Module: line
#' Line plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_line_plot <- function(data) {
  dout <- data[data$name %in% c(
    "Squirtle", "Wartortle", "Blastoise",
    "Charmander", "Charmeleon", "Charizard",
    "Pikachu", "Raichu"
  ), c("height", "weight", "type_1", "color_1")]
  colnames(dout) <- c("height", "weight", "type", "color")

  d3po(dout, width = 800, height = 600) %>%
    po_line(daes(x = .data$height, y = .data$weight, group = .data$type, color = .data$color)) %>%
    po_labels(title = "Pokemon Evolution: Weight vs Height by Type")
}

mod_line_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_line_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_line_plot(data)
    })
  })
}
