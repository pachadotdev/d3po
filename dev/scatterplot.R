library(dplyr)
library(d3plus)

dta <- tibble(
  value = c(100, 70, 40, 15),
  weigth = c(.45, .6, -.2, .1),
  type = c("alpha", "beta", "gamma", "delta")
)

d3plus() %>%
  d3p_type("scatter") %>%
  d3p_data(data = dta) %>%
  d3p_id(c("type")) %>% 
  d3p_axis(x = "value", y = "weigth")
