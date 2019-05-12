# WIP
library(dplyr)
library(d3plus)

data <- tibble(
  id = c("alpha", "beta", "gamma"),
  val = rep(100, 3)
)

edges <- tibble(
  # strength = c(2,1,1,3),
  source = c(0, 1, 2, 2),
  target = c(2, 2, 0, 1)
)

nodes <- tibble(
  id = c("alpha", "beta", "gamma")
)

d3plus() %>%
  d3p_type("sankey") %>%
  d3p_data(data = data, size = "val", nodes = nodes, edges = edges) %>%
  d3p_id(c("id"))
