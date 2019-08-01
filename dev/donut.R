library(dplyr)
library(d3po)

donut_data <- tibble(
  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
  id = c("alpha", "beta", "gamma", "delta", "eta"),
  value = c(29, 10, 2, 29, 25),
  icon = c(
    rep("https://datausa.io/static/img/attrs/thing_apple.png", 3),
    rep("https://datausa.io/static/img/attrs/thing_fish.png", 2)
  )
)

d3po() %>%
  d3po_type("donut") %>%
  d3po_data(data = donut_data, size = "value") %>%
  d3po_id("id") %>%
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