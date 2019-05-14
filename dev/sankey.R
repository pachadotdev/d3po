# WIP

library(dplyr)
library(d3plus)

sankey_edges <- tibble(
  strength = c(2,1,1,3),
  source = c(0, 1, 2, 2),
  target = c(2, 2, 0, 1)
)

sankey_nodes <- tibble(
  id = c("alpha", "beta", "gamma")
)

d3plus() %>%
  d3p_type("sankey") %>%
  d3p_data(size = 100, nodes = sankey_nodes, edges = sankey_edges) %>%
  # should be something like
  # d3p_data(size = 100, nodes = nodes, edges = list(strength = "strength", value = edges)) %>%
  d3p_id("id") %>% 
  d3p_focus(list(tooltip = FALSE, value = "gamma")) %>% 
  d3p_title(
    list(
      value = "This is a title",
      sub = "This is a subtitle"
    )
  ) %>% 
  d3p_footer(
    list(
      link = "https://www.duckduckgo.com",
      value = "Click here to search DuckDuckGo"
    )
  )