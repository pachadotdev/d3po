library(d3po)
library(dplyr)

bar_data <- tibble(
  id = "alpha",
  ab1 = c(0, -1, 1, 0),
  ab2 = c(1, 2, 5, 0)
)

d3po() %>%
  d3po_type("bar") %>%
  d3po_data(data = bar_data) %>%
  d3po_id("id") %>%
  d3po_axis(x = "ab2", y = "ab2") %>%
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
