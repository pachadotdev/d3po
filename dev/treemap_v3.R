library(dplyr)
library(d3po)

pokemon <- readRDS("dev/pokemon.rds")

pokemon_type <- pokemon %>% 
  rename(type = type_2) %>% 
  group_by(type, color_1) %>% 
  count() %>% 
  ungroup() %>% 
  select(id = type, color = color_1, value = n)

d3po(pokemon_type) %>%
  po_treemap(daes(sum = value, group_by = id, color = color)) %>%
  po_title("Count of pokemon by type 1")
