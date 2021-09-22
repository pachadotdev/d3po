library(shiny)
library(shinydashboard)
library(d3po)
library(dplyr)
library(igraph)

pokemon_count <- pokemon %>% 
  group_by(type_1, color_1) %>% 
  count()

pokemon_decile <- pokemon %>% 
  filter(type_1 %in% c("grass", "fire", "water")) %>% 
  group_by(type_1 ,color_1) %>% 
  summarise(
    decile = 0:10,
    weight = quantile(weight, probs = seq(0, 1, by = .1))
  )

pokemon_density <- density(pokemon$weight, n = 30)

pokemon_density <- tibble(
  x = pokemon_density$x,
  y = pokemon_density$y,
  variable = "weight",
  color = "#5377e3"
)

pokemon_def_vs_att <- pokemon %>% 
  group_by(type_1, color_1) %>% 
  summarise(
    mean_def = mean(defense),
    mean_att = mean(attack),
    n_pkmn = n()
  )

tr <- make_tree(40, children = 3, mode = "undirected")


