# Module: bar_custom
#' Custom Bar plot: Mean weight by type/color
#' @param data data.frame of pokemon
#' @return d3po widget
mod_bar_custom_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(weight ~ type_1 + color_1, data = data, FUN = mean)
  names(dout) <- c("type", "color", "avg_weight")

  # Vertical bars
  p1 <- d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(x = .data$type, y = .data$avg_weight, color = .data$color)) %>%
    po_format(
      x = toupper(dout$type),
      y = round(dout$avg_weight, 2)
    ) %>%
    po_labels(
      x = "Type",
      y = "Mean Weight",
      title = "Vertical Bars"
    )

  # Horizontal bars (constructed invisibly to avoid unused variable warning)
  invisible(
    d3po(dout, width = 800, height = 600) %>%
      po_bar(daes(x = .data$avg_weight, y = .data$type, color = .data$color)) %>%
      po_format(
        x = round(dout$avg_weight, 2),
        y = toupper(dout$type)
      ) %>%
      po_labels(
        x = "Mean Weight",
        y = "Type",
        title = "Horizontal Bars"
      )
  )

  p1
}

mod_bar_custom_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_bar_custom_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_bar_custom_plot(data)
    })
  })
}
