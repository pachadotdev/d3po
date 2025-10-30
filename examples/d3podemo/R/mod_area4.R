# Module: area4 (stacked)
#' Area chart: stacked example
#' @param data data.frame
#' @return d3po widget
mod_area4_plot <- function(data = d3po::pokemon) {
  dout <- data[data$name %in% c(
    "Squirtle", "Wartortle", "Blastoise"
  ), c("name", "attack", "defense", "hp")]

  colnames(dout) <- c("name", "attack", "defense")

  dout$stage <- 1:3

  # Prepare data in long format for attack and defense
  dout <- stats::reshape(
    dout,
    varying = c("attack", "defense"),
    v.names = "value",
    timevar = "feature",
    times = c("attack", "defense"),
    direction = "long",
    idvar = c("name", "stage")
  )

  # Group by name and express the value as a proportion of the total (attack + defense)
  dout$value <- with(dout, ave(value, name, FUN = function(x) x / sum(x)))

  # generate 15 colours using tintin
  # tintin::tintin_clrs(n = length(unique(data$type_1)), alpha = 0.7)

  # with transparency
  my_pal <- c("#1D8FAEB3", "#296576B3", "#3D5153B3", "#4A8496B3", "#633945B3", "#666559B3",
    "#7F5133B3", "#A4663CB3", "#A73234B3", "#A9906DB3", "#AF1727B3", "#CA171AB3",
    "#D68555B3", "#E12C29B3", "#E30013B3")

  # without transparency
  # my_pal <- c("#1D8FAE", "#296576", "#3D5153", "#4A8496", "#633945", "#666559",
  #   "#7F5133", "#A4663C", "#A73234", "#A9906D", "#AF1727", "#CA171A",
  #   "#D68555", "#E12C29", "#E30013")

  d3po(dout, width = 800, height = 600) %>%
    po_area(
      daes(
        x = .data$stage, y = .data$value, group = .data$feature, color = my_pal, stack = T
      )
    ) %>%
    po_labels(title = "Pokemon Evolution (Squirtle): Defense/Attack Proportion by Evolution Stage (Stacked Area)")
}

mod_area4_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_area4_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_area4_plot(data)
    })
  })
}
