library(dplyr)
library(d3plus)

connections <- tibble(
  source = c(rep("alpha", 2), rep("beta", 2), "zeta", "theta", "eta"),
  target = c("beta", "gamma", "delta", "epsilon", rep("gamma", 3))
)

d3plus() %>%
  d3p_type("rings") %>%
  d3p_data(edges = connections) %>%
  d3p_focus("alpha")
