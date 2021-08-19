# pkgs and data ----

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

# box ----

d3po(pokemon) %>%
  po_box(daes(x = type_1, y = speed, group = name, color = color_1)) %>%
  po_title("Distribution of Pokemon Speed by Type")

# bar ----

d3po(pokemon_count) %>%
  po_bar(
    daes(x = type_1, y = n, group = type_1, color = color_1)
  ) %>%
  po_title("Count of Pokemon by Type")

# treemap ----

d3po(pokemon_count) %>%
  po_treemap(
    daes(size = n, group = type_1, color = color_1, align = "left")
  ) %>%
  po_title("Share of Pokemon by Type") %>% 
  # po_legend("") %>% 
  po_labels("left", "top") %>% 
  po_font("Times")

# pie ----

d3po(pokemon_count) %>%
  po_pie(
    daes(size = n, group = type_1, color = color_1)
  ) %>%
  po_title("Share of Pokemon by Type")

# line ----

d3po(pokemon_decile) %>%
  po_line(
    daes(x = decile, y = weight, group = type_1, color = color_1)
  ) %>%
  po_title("Decile of Pokemon Weight by Type")

# area ----

d3po(pokemon_density) %>%
  po_area(
    daes(x = x, y = y, group = variable, color = color)
  ) %>%
  po_title("Approximated Density of Pokemon Weight")

# scatterplot ----

d3po(pokemon_def_vs_att) %>%
  po_scatter(
    daes(x = mean_att, y = mean_def, size = n_pkmn, group = type_1, color = color_1)
  ) %>%
  po_title("Average Attack vs Average Defense by Type")

# network ----

d3po(tr) %>% 
  po_layout()
