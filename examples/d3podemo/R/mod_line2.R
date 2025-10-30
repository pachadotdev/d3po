# Module: line2
#' Line chart example
#' @param data data.frame
#' @return d3po widget
mod_line2_plot <- function(data = d3po::pokemon) {
  dout <- data[data$name %in% c(
    "Squirtle", "Wartortle", "Blastoise",
    "Charmander", "Charmeleon", "Charizard",
    "Pikachu", "Raichu"
  ), c("height", "weight", "type_1")]

  colnames(dout) <- c("height", "weight", "type")

  d3po(dout, width = 800, height = 600) %>%
    po_line(
      daes(
        x = .data$height, y = .data$weight, group = .data$type
      )
    ) %>%
    po_labels(title = "Pokemon Evolution: Weight vs Height by Type")
}

mod_line2_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_line2_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_line2_plot(data)
    })
  })
}
