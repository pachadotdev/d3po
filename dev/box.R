library(d3po)
library(dplyr)

box_data <- tibble(
  year = rep(c(1991,1992), 8),
  name = c(rep("alpha", 2), rep("alpha2", 2),
           rep("beta", 2), rep("beta2", 2),
           rep("gamma", 2), rep("gamma2", 2),
           rep("delta", 2), rep("delta2", 2)),
  value = c(15,34,17,65,10,10,40,38,5,10,20,34,50,
            43,17,35)
)

d3po() %>%
  d3po_type("box") %>%
  d3po_data(data = box_data) %>%
  d3po_id("name") %>%
  d3po_axis(x = "year", y = "value") %>%
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