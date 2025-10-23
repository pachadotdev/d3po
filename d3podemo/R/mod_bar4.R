# Module: bar4 (stacked horizontal)
#' Bar4 plot module (stacked horizontal)
#' @param data data.frame of pokemon
#' @return d3po widget
mod_bar4_plot <- function(data) {
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
    po_bar(daes(y = .data$type, x = .data$mean, group = .data$feature, color = .data$color, stack = TRUE)) %>%
    po_labels(title = "Horizontal Stacked Bars")
}
