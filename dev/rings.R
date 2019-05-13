rings_edges <- tibble(
  source = c(rep("alpha", 2), rep("beta", 2), "zeta", "theta", "eta"),
  target = c("beta", "gamma", "delta", "epsilon", rep("gamma", 3))
)

d3plus() %>%
  d3p_type("rings") %>%
  d3p_data(edges = rings_edges) %>%
  d3p_focus("alpha") %>% 
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
