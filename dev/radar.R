radar_data <- tibble(
  name = c(rep("alpha", 3), rep("beta", 3)),
  skill = rep(c("power", "courage", "wisdom"), 2),
  value = c(4, 8, 2, 5, 4, 6)
)

d3plus() %>%
  d3p_type("radar") %>%
  d3p_data(
    data = radar_data,
    size = "value"
  ) %>%
  d3p_id(c("name", "skill")) %>% 
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
