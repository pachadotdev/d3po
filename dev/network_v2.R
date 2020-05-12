library(dplyr)
library(d3po)

data <- tibble(
  id = letters[1:3],
  value = c(10, 20, 30)
)

nodes <- tibble(
  id = c(letters[1:3]),
  x = 1:3,
  y = 4:6
)

links <- tibble(
  source = 1:3 - 1,
  target = 3:1 - 1
)

d3po(data = data, links = links, nodes = nodes) %>%
  po_network(daes(sum = value)) %>%
  po_title("wrongly aligned title")
