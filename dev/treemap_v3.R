library(dplyr)
library(d3po)

pokemon <- readRDS("dev/pokemon.rds") %>% 
  # ideally this renaming shouldn't be needed
  select(value = weight, id = type_1, color = color_1)

d3po(pokemon) %>%
  # and here I want to group by two variables type_1,type_2
  po_treemap(daes(sum = value, group_by = id, color = color)) %>%
  po_title("Count of pokemon by type 1")
