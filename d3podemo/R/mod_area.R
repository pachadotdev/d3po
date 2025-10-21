# Module: area
mod_area_plot <- function(data) {
  dout <- data[data$name %in% c(
    "Squirtle", "Wartortle", "Blastoise",
    "Charmander", "Charmeleon", "Charizard",
    "Pikachu", "Raichu"
  ), c("height", "weight", "type_1", "color_1")]
  colnames(dout) <- c("height", "weight", "type", "color")

  d3po(dout) %>%
    po_area(daes(x = .data$height, y = .data$weight, group = .data$type, color = .data$color),
      stack = FALSE
    ) %>%
    po_labels(title = "Pokemon Evolution: Weight vs Height by Type (Area)")
}

mod_area_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}
mod_area_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_area_plot(data)
    })
  })
}
