# WIP

library(dplyr)
library(d3po)

sankey_edges <- tibble(
  strength = c(2,1,1,3),
  source = c(0, 1, 2, 2),
  target = c(2, 2, 0, 1)
)

sankey_nodes <- tibble(
  id = c("alpha", "beta", "gamma")
)

d3po() %>%
  d3po_type("sankey") %>%
  d3po_data(size = 100, nodes = sankey_nodes, edges = sankey_edges) %>%
  # should be something like
  # d3po_data(size = 100, nodes = nodes, edges = list(strength = "strength", value = edges)) %>%
  d3po_id("id") %>%
  d3po_focus(list(tooltip = FALSE, value = "gamma")) %>%
  d3po_title(
    list(
      value = "This is a title",
      sub = "This is a subtitle"
    )
  ) %>%
  d3po_footer(
    list(
      link = "https://www.duckduckgo.com",
      value = "Click here to search DuckDuckGo"
    )
  )
