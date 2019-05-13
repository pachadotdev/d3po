geomap_data <- tibble(
  value = c(2315987123, 38157121349, 21891735098, 9807134982),
  country = c("nausa", "aschn", "euesp", "sabra"),
  name = c("United States", "China", "Spain", "Brazil")
)

d3plus() %>%
  d3p_type("geo_map") %>%
  d3p_data(
    data = geomap_data,
    coords = "http://d3plus.org/topojson/countries.json",
    text = "name"
  ) %>%
  d3p_id("country") %>%
  d3p_color("value") %>% 
  d3p_title(
    list(
      value = "Titles and Footers Example",
      sub = "Subtitles are smaller than titles.",
      total = TRUE
    )
  ) %>% 
  d3p_footer(
    list(
      link = "http://www.google.com",
      value = "Click here to search Google"
    )
  )
