library(dplyr)
library(d3po)

treemap_data <- tibble(
  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
  id = c("alpha", "beta", "gamma", "delta", "eta"),
  value = c(29, 10, 2, 29, 25),
  icon = c(
    rep("thing_apple.png", 3),
    rep("thing_fish.png", 2)
  ),
  color = c(rep("cornflowerblue", 3), rep("firebrick", 2))
)

d3po() %>%
  d3po_type("treemap") %>% 
  d3po_data(data = treemap_data, sum = "value") %>%
  d3po_group_by(c("parent", "id"))
