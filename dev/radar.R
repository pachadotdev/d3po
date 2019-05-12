# working treemap for now
library(dplyr)
library(d3plus)

dta <- tibble(
  name = c(rep("alpha", 3), rep("beta", 3)),
  skill = rep(c("power", "courage", "wisdom"), 2),
  value = c(4, 8, 2, 5, 4, 6)
)

d3plus() %>%
  d3p_type("radar") %>%
  d3p_data(
    data = dta,
    size = "value"
  ) %>%
  d3p_id(c("name", "skill"))
