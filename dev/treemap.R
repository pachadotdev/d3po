treemap_data <- tibble(
  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
  id = c("alpha", "beta", "gamma", "delta", "eta"),
  value = c(29, 10, 2, 29, 25),
  icon = c(
    rep("https://datausa.io/static/images/attrs/thing_apple.png", 3),
    rep("https://datausa.io/static/images/attrs/thing_fish.png", 2)
  )
)

d3plus() %>%
  d3p_type("tree_map") %>%
  d3p_data(data = treemap_data, size = "value") %>%
  d3p_id(c("parent", "id")) %>%
  d3p_color("parent") %>%
  d3p_labels(align = "left", valign = "top") %>%
  d3p_icon(style = "knockout", value = "icon") %>%
  d3p_legend(size = 30) %>%
  d3p_depth(1) %>% 
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
