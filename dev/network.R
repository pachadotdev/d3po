# working network for now
library(dplyr)
library(d3plus)

data <- tibble(
  name = c("alpha", "beta", "gamma"),
  val = c(10,20,30)
)

edges <- tibble(
  source = c("alpha", "alpha"),
  target = c("beta", "gamma")
)

nodes <- tibble(
  name = c("alpha", "beta", "gamma"),
  x = c(10,12,17),
  y = c(4,24,14)
)

d3plus() %>%
  d3p_type("network") %>%
  d3p_data(data = data, size = "val", nodes = nodes, edges = edges) %>%
  d3p_id(c("name"))