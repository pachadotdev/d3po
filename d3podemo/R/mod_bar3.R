# Module: bar3 (stacked vertical)
#' Bar3 plot module (stacked vertical)
#' @param data data.frame of pokemon
#' @return d3po widget
mod_bar3_plot <- function(data) {
  dout <- stats::aggregate(cbind(mean_attack = attack, mean_defense = defense) ~ type_1 + color_1,
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

  d3po(dout) %>%
    po_bar(daes(x = .data$type, y = .data$mean, group = .data$feature, color = .data$color, stack = TRUE)) %>%
    po_labels(title = "Vertical Stacked Bars")
}
