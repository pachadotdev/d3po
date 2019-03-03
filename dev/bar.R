library(dplyr)
library(d3plus)

dta <- tibble(
  id = c(rep("alpha", 3), "beta"),
  ab1 = letters[1:4],
  ab2 = c(1,2,5,-1)
)

d3plus() %>%
  d3p_type("bar") %>%
  d3p_data(data = dta) %>%
  d3p_id("id") %>%  
  d3p_axis(x = "ab1", y = "ab2")