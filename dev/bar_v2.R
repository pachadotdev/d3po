library(dplyr)
library(d3po)

bar_data <- tibble(
  aaa = c("a", "b"),
  id = c("a", "b"),
  x = 1:2,
  y = 1:2
)

# d3po() %>%
#   d3po_type("bar") %>%
#   d3po_data(data = bar_data)

# ok
d3po(bar_data) %>%
  po_bar(daes(x = x, y = y, group_by = aaa)) %>%
  po_title("wrongly aligned title")

# also ok
d3po(bar_data) %>%
  po_bar(daes(x = x, y = y, id = id)) %>%
  po_title("wrongly aligned title")
