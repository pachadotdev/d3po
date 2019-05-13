# WIP
# still cannot mimic http://d3plus.org/examples/basic/a523b45768c2ca464363/

library(dplyr)
library(d3plus)

edges <- tibble(
  strength = c(2,1,1,3),
  source = c(0, 1, 2, 2),
  target = c(2, 2, 0, 1)
)

nodes <- tibble(
  id = c("alpha", "beta", "gamma")
)

d3plus() %>%
  d3p_type("sankey") %>%
  d3p_data(data = data, size = 100, nodes = nodes, edges = edges) %>%
  # should be something like
  # d3p_data(data = data, size = 100, nodes = nodes, edges = list(strength = "strength", value = edges)) %>%
  d3p_id("id") %>% 
  d3p_focus(list(tooltip = FALSE, value = "gamma"))
