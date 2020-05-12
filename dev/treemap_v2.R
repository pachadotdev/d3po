library(dplyr)
library(d3po)

treemap_data <- tibble(
  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
  id = c("alpha", "beta", "gamma", "delta", "eta"),
  value = c(29, 10, 2, 29, 25),
  icon = c(
    rep("fish.png", 3),
    rep("vegetables.png", 2)
  ),
  color = c(rep("cornflowerblue", 3), rep("firebrick", 2))
)

# d3po(box_data) %>%
#   po_box(daes(x = year, y = value, group = name)) %>%
#   po_title("INITIAL HERE")

# d3po() %>%
#   po_type("treemap") %>%
#   po_data(data = treemap_data, sum = "value") %>%
#   po_group_by(c("parent", "id")) %>%
#   # d3po_depth(1) %>% # not working
#   po_color("color") # %>%
#   # d3po_icon(value = "icon")

# can't group by parent and id, as in lines 20-26
d3po(treemap_data) %>%
  po_treemap(daes(sum = value, group_by = id)) %>%
  po_title("wrongly aligned title")

d3po(treemap_data) %>%
  po_treemap(daes(sum = value, group_by = parent, color = color)) %>%
  po_title("wrongly aligned title")
