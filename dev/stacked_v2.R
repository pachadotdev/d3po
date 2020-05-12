library(dplyr)
library(d3po)

area_data <- tibble(
  aaa = c(rep("a",4),rep("b",2)),
  x = c(1:3,1:3),
  y = c(1:3,3:1)
)

# d3po() %>%
#   d3po_type("area") %>%
#   d3po_data(data = area_data)

# ok
d3po(area_data) %>%
  po_stacked_area(daes(x = x, y = y, group_by = aaa)) %>% 
  po_title("wrongly aligned title")
