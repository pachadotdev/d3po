library(dplyr)
library(d3po)

box_data <- tibble(
  id = c(rep("a", 5), rep("b", 3)),
  value = c(200, 100, 10, 5, 99, 70, 500, 12)
)

# d3po(box_data) %>%
#   po_box(daes(x = year, y = value, group = name)) %>%
#   po_title("INITIAL HERE")

# d3po() %>%
#   d3po_type("box") %>%
#   d3po_data(data = box_data) %>%
#   d3po_axis(x = "id", y = "value") %>%
#   d3po_group_by(c("id", "value"))

# here I need to group by id AND value
d3po(box_data) %>%
  po_box(daes(x = id, y = value, group_by = id)) %>%
  po_title("wrongly aligned title")
