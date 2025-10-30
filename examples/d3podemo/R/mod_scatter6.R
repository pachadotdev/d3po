# Module: scatter6
#' Scatter: Log scales with size encoding
#' @param data data.frame
#' @return d3po widget
mod_scatter6_plot <- function(data = d3po::pokemon) {
  dout <- data
  dout$log_height <- log10(dout$height)
  dout$log_weight <- log10(dout$weight)
  mean_log_weight <- mean(dout$log_weight, na.rm = TRUE)
  mean_log_height <- mean(dout$log_height, na.rm = TRUE)

  dout$distance_from_mean_log_weight <- abs(dout$log_weight - mean_log_weight)
  dout$distance_from_mean_log_height <- abs(dout$log_height - mean_log_height)
  dout$avg_distance <- (dout$distance_from_mean_log_weight + dout$distance_from_mean_log_height) / 2
  dout$inverse_distance_from_mean <- 1 / (dout$avg_distance + 0.01)

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
    po_scatter(daes(x = .data$log_height, y = .data$log_weight,
      group = .data$name, size = .data$inverse_distance_from_mea, color = my_pal)) %>%
    po_labels(title = "Log(Height) vs Log(Weight) (Size = 1 / Distance from the Mean)")
}

mod_scatter6_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_scatter6_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_scatter6_plot(data)
    })
  })
}
