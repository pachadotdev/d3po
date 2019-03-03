library(dplyr)
library(d3plus)

dta <- tibble(
  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
  id = c("alpha", "beta", "gamma", "delta", "eta"),
  value = c(29, 10, 2, 29, 25),
  icon = c(rep("https://datausa.io/static/img/attrs/thing_apple.png", 3),
           rep("https://datausa.io/static/img/attrs/thing_fish.png", 2))
)

d3plus() %>%
  d3p_type("pie") %>%
  d3p_data(data = dta, size = "value") %>%
  d3p_id("id")