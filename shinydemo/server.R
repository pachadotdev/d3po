shinyServer(function(input, output) {
  
  output$boxplot <- render_d3po({
    d3po(pokemon) %>%
      po_box(daes(x = type_1, y = speed, group = name, color = color_1)) %>%
      po_title("Distribution of Pokemon Speed by Type")
  })
  
  output$barplot <- render_d3po({
    d3po(pokemon_count) %>%
      po_bar(
        daes(x = type_1, y = n, group = type_1, color = color_1)
      ) %>%
      po_title("Count of Pokemon by Type")
  })
  
  output$treemap <- render_d3po({
    d3po(pokemon_count) %>%
      po_treemap(
        daes(size = n, group = type_1, color = color_1)
      ) %>%
      po_title("Share of Pokemon by Type")
  })
  
  output$pie <- render_d3po({
    d3po(pokemon_count) %>%
      po_pie(
        daes(size = n, group = type_1, color = color_1)
      ) %>%
      po_title("Share of Pokemon by Type")
  })
  
  output$line <- render_d3po({
    d3po(pokemon_decile) %>%
      po_line(
        daes(x = decile, y = weight, group = type_1, color = color_1)
      ) %>%
      po_title("Decile of Pokemon Weight by Type")
  })
  
  output$density <- render_d3po({
    d3po(pokemon_density) %>%
      po_area(
        daes(x = x, y = y, group = variable, color = color)
      ) %>%
      po_title("Approximated Density of Pokemon Weight")
  })
  
  output$scatterplot <- render_d3po({
    d3po(pokemon_def_vs_att) %>%
      po_scatter(
        daes(x = mean_att, y = mean_def, size = n_pkmn, group = type_1, color = color_1)
      ) %>%
      po_title("Average Attack vs Average Defense by Type")
  })
  
  output$network <- render_d3po({
    d3po(tr) %>% 
      po_layout()
  })
})
