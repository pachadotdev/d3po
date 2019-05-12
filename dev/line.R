library(dplyr)
library(d3plus)

dta <- tibble(
  id = "alpha",
  ab1 = c(0, -1, 1, 0),
  ab2 = c(1, 2, 5, 0)
)

d3plus() %>%
  d3p_type("line") %>%
  d3p_data(data = dta) %>%
  d3p_id("id") %>%
  d3p_axis(x = "ab2", y = "ab2")
