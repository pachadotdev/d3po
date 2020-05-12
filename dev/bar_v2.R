library(dplyr)
library(d3po)

bar_data <- tibble(
  id = c("a","b"),
  x = 1:2,
  y = 1:2
)

d3po() %>%
  d3po_type("bar") %>%
  d3po_data(data = bar_data)
