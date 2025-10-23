# Module: bar4
#' Bar chart: Stacked Horizontal Bars
#' @param data data.frame
#' @return d3po widget
mod_bar4_plot <- function(data = d3po::pokemon) {
  dout <- aggregate(cbind(mean_attack = attack, mean_defense = defense) ~ type_1 + color_1,
    data = data, FUN = mean
  )

  dout <- stats::reshape(dout,
    varying = c("mean_attack", "mean_defense"),
    v.names = "mean",
    timevar = "feature",
    times = c("attack", "defense"),
    direction = "long",
    idvar = c("type_1", "color_1")
  )

  rownames(dout) <- NULL
  colnames(dout) <- c("type", "color", "feature", "mean")

  dout$mean <- with(dout, ave(mean, type, FUN = function(x) x / sum(x)))
  dout$color <- ifelse(dout$feature == "attack", "#d04e66", "#165976")

  d3po(dout, width = 800, height = 600) %>%
    po_bar(daes(y = .data$type, x = .data$mean, group = .data$feature, color = .data$color, stack = TRUE)) %>%
    po_labels(title = "Horizontal Stacked Bars")
}

mod_bar4_ui <- function(id) {
  ns <- NS(id)
  tagList(d3po::d3po_output(ns("plot"), width = "100%", height = "600px"))
}

mod_bar4_server <- function(id, data = d3po::pokemon) {
  moduleServer(id, function(input, output, session) {
    output$plot <- d3po::render_d3po({
      mod_bar4_plot(data)
    })
  })
}
