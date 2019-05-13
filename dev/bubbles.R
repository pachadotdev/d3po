bubbles_data <- tibble(
  value = c(100,70,40,15,5,1),
  name = c("alpha", "beta", "gamma", "delta", "epsilon", "zeta"),
  group = c("group 1", rep("group 2", 3), rep("group 1", 2))
)

d3plus() %>%
  d3p_type("bubbles") %>%
  d3p_data(data = bubbles_data, size = "value") %>%
  d3p_id(c("group", "name")) %>%
  d3p_depth(1) %>% 
  d3p_color("group") %>% 
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

