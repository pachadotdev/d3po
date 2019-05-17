library(dplyr)
library(d3po)

geomap_data <- tibble(
  value = c(2315987123, 38157121349, 21891735098, 9807134982),
  country = c("nausa", "aschn", "euesp", "sabra"),
  name = c("United States", "China", "Spain", "Brazil")
)

d3po() %>%
  d3po_type("geo_map") %>%
  d3po_data(
    data = geomap_data,
    coords = "http://d3plus.org/topojson/countries.json",
    text = "name"
  ) %>%
  d3po_id("country") %>%
  d3po_color("value") %>%
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
