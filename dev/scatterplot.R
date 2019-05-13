scatterplot_data <- tibble(
  value = c(100, 70, 40, 15),
  weigth = c(.45, .6, -.2, .1),
  type = c("alpha", "beta", "gamma", "delta")
)

d3plus() %>%
  d3p_type("scatter") %>%
  d3p_data(data = scatterplot_data) %>%
  d3p_id(c("type")) %>% 
  d3p_axis(x = "value", y = "weigth") %>% 
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
