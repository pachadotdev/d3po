library(dplyr)
library(d3po)

pokemon <- readRDS("dev/pokemon.rds") %>% 
  # ideally this renaming shouldn't be needed
  # writing silly colnames to check po_ arguments
  select(this_is_the_weight = weight, the_type = type_1, this_is_the_color = color_1)

d3po(pokemon) %>%
  # and here I want to group by two variables type_1,type_2
  po_treemap(
    daes(
      value = this_is_the_weight, 
      group_by = the_type, 
      color = this_is_the_color
    )
  ) %>%
  po_title("Count of pokemon by type 1") %>% 
  po_legend(FALSE)
