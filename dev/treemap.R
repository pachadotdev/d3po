library(dplyr)
library(d3po)

treemap_data <- tibble(
  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
  id = c("alpha", "beta", "gamma", "delta", "eta"),
  value = c(29, 10, 2, 29, 25),
  icon = c(
    rep("thing_apple.png", 3),
    rep("thing_fish.png", 2)
  ),
  color = c(rep("cornflowerblue", 3), rep("firebrick", 2))
)

d3po() %>%
  d3po_data(data = treemap_data, size = "value") %>%
  d3po_id(c("parent", "id")) %>%
  d3po_depth(1) %>%
  d3po_color("color") %>%
  d3po_font(family = "Fira Sans", weight = 400) %>%
  d3po_labels(align = "left", valign = "top") %>%
  d3po_icon(style = "knockout", value = "icon") %>%
  d3po_legend(size = 30) %>%
  d3po_title(
    list(
      value = "This is a title",
      sub = "This is a subtitle",
      total = TRUE
    )
  ) %>%
  d3po_footer(
    list(
      link = "https://www.duckduckgo.com",
      value = "Click here to search DuckDuckGo"
    )
  )