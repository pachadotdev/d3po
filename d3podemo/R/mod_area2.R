# Module: area2
#' Area2 (stacked) plot module
#' @param data data.frame of pokemon
#' @return d3po widget
mod_area2_plot <- function(data) {
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

  dout$color <- ifelse(dout$feature == "attack", "#d04e66", "#165976")

  # Group by name and express the value as a proportion of the total (attack + defense)
  dout$value <- with(dout, ave(value, name, FUN = function(x) x / sum(x)))

  d3po(dout, width = 800, height = 600) %>%
    po_area(
      daes(
        x = .data$stage, y = .data$value, group = .data$feature, color = .data$color, stack = T
      )
    ) %>%
    po_labels(title = "Pokemon Evolution (Squirtle): Defense/Attack Proportion by Evolution Stage (Stacked Area)")
}
