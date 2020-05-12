library(dplyr)
library(d3po)

area_data <- tibble(
  aaa = c(rep("a", 3), rep("b", 3)),
  x = 1:6,
  y = c(1:3, 3:1)
)

# d3po() %>%
#   d3po_type("area") %>%
#   d3po_data(data = area_data)

# ok
d3po(area_data) %>%
  po_area(daes(x = x, y = y, group_by = aaa)) %>%
  po_title("wrongly aligned title")

# broken
d3po(area_data) %>%
  po_area(daes(x = x, y = y, id = aaa)) %>%
  po_title("wrongly aligned title")
