line_data <- tibble(
  id = "alpha",
  ab1 = c(0, -1, 1, 0),
  ab2 = c(1, 2, 5, 0)
)

d3plus() %>%
  d3p_type("line") %>%
  d3p_data(data = line_data) %>%
  d3p_id("id") %>%
  d3p_axis(x = "ab2", y = "ab2") %>% 
  d3p_title(
    list(
      value = "Titles and Footers Example",
      sub = "Subtitles are smaller than titles."
    )
  ) %>% 
  d3p_footer(
    list(
      link = "http://www.google.com",
      value = "Click here to search Google"
    )
  )
