library(dplyr)
library(tidyr)
library(usethis)
library(igraph)
library(d3po)

use_data(pokemon, overwrite = TRUE)

pokemon_count <- pokemon %>%
  group_by(type_1, color_1) %>%
  count()

use_data(pokemon_count, overwrite = TRUE)

pokemon_decile <- pokemon %>%
  filter(type_1 %in% c("grass", "fire", "water")) %>%
  group_by(type_1, color_1) %>%
  summarise(
    decile = 0:10,
    weight = quantile(weight, probs = seq(0, 1, by = .1))
  )

use_data(pokemon_decile, overwrite = TRUE)

pokemon_density <- density(pokemon$weight, n = 30)

pokemon_density <- tibble(
  x = pokemon_density$x,
  y = pokemon_density$y,
  variable = "weight",
  color = "#5377e3"
)

use_data(pokemon_density, overwrite = TRUE)

pokemon_def_vs_att <- pokemon %>%
  group_by(type_1, color_1) %>%
  summarise(
    mean_def = mean(defense),
    mean_att = mean(attack),
    n_pkmn = n()
  )

use_data(pokemon_def_vs_att, overwrite = TRUE)

# tr <- make_tree(40, children = 3, mode = "undirected")

pokemon_tree <- pokemon %>%
  select(type_1, type_2) %>%
  drop_na() %>% 
  mutate(
    pmin_type1 = pmin(type_1, type_2),
    pmax_type1 = pmax(type_1, type_2)
  ) %>%
  select(pmin_type1, pmax_type1) %>%
  distinct() %>%  
  arrange(pmin_type1, pmax_type1) %>%
  graph_from_data_frame(directed = FALSE)

pokemon_size <- pokemon %>%
  select(type_1) %>%
  drop_na() %>% 
  group_by(type = type_1) %>%
  count() %>%
  bind_rows(
    pokemon %>%
      select(type_2) %>%
      drop_na() %>% 
      group_by(type = type_2) %>%
      count()
  ) %>%
  group_by(type) %>%
  summarise(n = sum(n))

pokemon_size_2 <- pokemon_size$n
names(pokemon_size_2) <- pokemon_size$type
pokemon_size_2 <- pokemon_size_2[V(pokemon_tree)$name]

V(pokemon_tree)$size <- unname(pokemon_size_2)

pokemon_clrs <- pokemon %>%
  select(type = type_1, color = color_1) %>%
  distinct() %>%
  bind_rows(
    pokemon %>%
      select(type = type_2, color = color_2) %>%
      drop_na() %>%
      distinct()
  ) %>%
  distinct() %>%
  arrange(type)

pokemon_clrs_2 <- pokemon_clrs$color
names(pokemon_clrs_2) <- pokemon_clrs$type
pokemon_clrs_2 <- pokemon_clrs_2[V(pokemon_tree)$name]

V(pokemon_tree)$color <- unname(pokemon_clrs_2)

use_data(pokemon_tree, overwrite = TRUE)
