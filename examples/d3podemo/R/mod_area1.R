# Module: area1
#' Area chart: non-stacked
#' @param data data.frame
#' @return d3po widget
mod_area_plot <- function(data = d3po::pokemon) {
  dout <- data[data$name %in% c(
    "Squirtle", "Wartortle", "Blastoise"
  ), c("height", "weight", "type_1", "color_1")]

  colnames(dout) <- c("height", "weight", "type", "color")

  d3po(dout, width = 800, height = 600) %>%
    po_area(daes(x = .data$height, y = .data$weight, group = .data$type, color = .data$color)) %>%
    po_labels(title = "Pokemon Evolution (Squirtle): Weight vs Height by Evolution Stage (Non-Stacked Area)")
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
