# working treemap for now
library(dplyr)
library(d3plus)

dta <- tibble(
  value = c(2315987123, 38157121349, 21891735098, 9807134982),
  country = c("nausa", "aschn", "euesp", "sabra"),
  name = c("United States", "China", "Spain", "Brazil")
)

d3plus() %>%
  d3p_type("geo_map") %>%
  d3p_data(
    data = dta,
    coords = "http://d3plus.org/topojson/countries.json",
  ) %>%
  d3p_id("country") %>% 
  d3p_text("name") %>% 
  d3p_color("value")
