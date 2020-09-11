library(dplyr)
library(d3po)

box_data <- tibble(
  year = c(rep(2000, 5), rep(2001, 3)),
  id = c(rep("a", 3), rep("b", 2), rep("c", 2), "d"),
  value = c(200, 100, 10, 5, 99, 70, 500, 12)
)

# d3po(box_data) %>%
#   po_box(daes(x = year, y = value, group = name)) %>%
#   po_title("INITIAL HERE")

d3po(box_data) %>%
  po_box(daes(x = year, y = value, group_by = id)) %>%
  po_title("wrongly aligned title")
