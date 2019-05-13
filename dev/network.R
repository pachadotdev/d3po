network_data <- tibble(
  name = c("alpha", "beta", "gamma"),
  val = c(10, 20, 30)
)

network_edges <- tibble(
  source = c("alpha", "alpha"),
  target = c("beta", "gamma")
)

network_nodes <- tibble(
  name = c("alpha", "beta", "gamma"),
  x = c(10, 12, 17),
  y = c(4, 24, 14)
)

d3plus() %>%
  d3p_type("network") %>%
  d3p_data(data = network_data, size = "val", network_nodes = nodes, edges = network_edges) %>%
  d3p_id("name") %>% 
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

