# WIP

library(dplyr)
library(d3po)

network_data <- tibble(
  name = c("alpha", "beta", "gamma", "theta", "zeta", "epsilon"),
  val = c(10, 20, 30, 30, 20, 10)
)

network_edges <- tibble(
  source = c("alpha", "alpha", "theta", "theta", "epsilon"),
  target = c("beta", "gamma", "zeta", "epsilon", "alpha")
)

network_nodes <- tibble(
  name = c("alpha", "beta", "gamma", "theta", "zeta", "epsilon"),
  x = c(1, 2, 1, 3, 2.5, 2),
  y = c(1, 1, 2, 2, 1.5, 2)
)

d3po() %>%
  d3po_type("network") %>%
  d3po_data(data = network_data, size = "val", nodes = network_nodes, edges = network_edges) %>%
  d3po_id("name") %>%
  d3po_title(
    list(
      value = "Titles and Footers Example",
      sub = "Subtitles are smaller than titles.",
      total = TRUE
    )
  ) %>%
  d3po_footer(
    list(
      link = "https://www.duckduckgo.com",
      value = "Click here to search DuckDuckGo"
    )
  )
