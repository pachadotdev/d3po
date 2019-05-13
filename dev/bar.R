bar_data <- tibble(
  id = c(rep("alpha", 3), "beta"),
  ab1 = letters[1:4],
  ab2 = c(1, 2, 5, -1)
)

d3plus() %>%
  d3p_type("bar") %>%
  d3p_data(data = bar_data) %>%
  d3p_id("id") %>%
  d3p_axis(x = "ab1", y = "ab2") %>% 
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
