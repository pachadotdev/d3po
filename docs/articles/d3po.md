# Introduction to d3po

The package `d3po` integrates well with `dplyr`. All the examples here
use the pipe, `%>%`, both to filter/summarise data and create the
charts.

## Setup

Let's start by loading packages.

```r
library(dplyr)
library(igraph)
library(d3po)
```

## Pokemon dataset

The included dataset `pokemon` has the present structure:

```r
glimpse(pokemon)
#> Rows: 151
#> Columns: 15
#> $ id              <dbl> 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 3…
#> $ name            <chr> "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise…
#> $ height          <dbl> 0.7, 1.0, 2.0, 0.6, 1.1, 1.7, 0.5, 1.0, 1.6, 0.3, 0.7, 1.1, 0.3, 0.6, 1.0, 0.3, 1.1, 1.5, 0.3, 0.7, 0.3, 1.2, 2.…
#> $ weight          <dbl> 6.9, 13.0, 100.0, 8.5, 19.0, 90.5, 9.0, 22.5, 85.5, 2.9, 9.9, 32.0, 3.2, 10.0, 29.5, 1.8, 30.0, 39.5, 3.5, 18.5,…
#> $ base_experience <int> 64, 142, 236, 62, 142, 240, 63, 142, 239, 39, 72, 178, 39, 72, 178, 50, 122, 216, 51, 145, 52, 155, 58, 153, 112…
#> $ type_1          <chr> "grass", "grass", "grass", "fire", "fire", "fire", "water", "water", "water", "bug", "bug", "bug", "bug", "bug",…
#> $ type_2          <chr> "poison", "poison", "poison", NA, NA, "flying", NA, NA, NA, NA, NA, "flying", "poison", "poison", "poison", "fly…
#> $ attack          <int> 49, 62, 82, 52, 64, 84, 48, 63, 83, 30, 20, 45, 35, 25, 90, 45, 60, 80, 56, 81, 60, 90, 60, 85, 55, 90, 75, 100,…
#> $ defense         <int> 49, 63, 83, 43, 58, 78, 65, 80, 100, 35, 55, 50, 30, 50, 40, 40, 55, 75, 35, 60, 30, 65, 44, 69, 40, 55, 85, 110…
#> $ hp              <int> 45, 60, 80, 39, 58, 78, 44, 59, 79, 45, 50, 60, 40, 45, 65, 40, 63, 83, 30, 55, 40, 65, 35, 60, 35, 60, 50, 75, …
#> $ special_attack  <int> 65, 80, 100, 60, 80, 109, 50, 65, 85, 20, 25, 90, 20, 25, 45, 35, 50, 70, 25, 50, 31, 61, 40, 65, 50, 90, 20, 45…
#> $ special_defense <int> 65, 80, 100, 50, 65, 85, 64, 80, 105, 20, 25, 80, 20, 25, 80, 35, 50, 70, 35, 70, 31, 61, 54, 79, 50, 80, 30, 55…
#> $ speed           <int> 45, 60, 80, 65, 80, 100, 43, 58, 78, 45, 30, 70, 50, 35, 75, 56, 71, 101, 72, 97, 70, 100, 55, 80, 90, 110, 40, …
#> $ color_1         <chr> "#78C850", "#78C850", "#78C850", "#F08030", "#F08030", "#F08030", "#6890F0", "#6890F0", "#6890F0", "#A8B820", "#…
#> $ color_2         <chr> "#A040A0", "#A040A0", "#A040A0", NA, NA, "#A890F0", NA, NA, NA, NA, NA, "#A890F0", "#A040A0", "#A040A0", "#A040A…
```

## Box and Whiskers

To compare the distribution of `weight` by `type_1`, the `pokemon`
dataset doesn't need additional aggregation or transformation, just to
use the Pokemon `name` as the grouping variable and (optionally) the
`color` variable:

```r
d3po(pokemon) %>%
  po_box(daes(x = type_1, y = speed, group = name, color = color_1)) %>%
  po_title("Distribution of Pokemon Speed by Type")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-b24d8eff8bb8bd74fc2f" style="width:672px;height:672px;"></div>
<script type="application/json" data-for="htmlwidget-b24d8eff8bb8bd74fc2f">{"x":{"type":"box","data":[{"type_1":"grass","speed":45,"name":"Bulbasaur","color_1":"#78C850"},{"type_1":"grass","speed":60,"name":"Ivysaur","color_1":"#78C850"},{"type_1":"grass","speed":80,"name":"Venusaur","color_1":"#78C850"},{"type_1":"fire","speed":65,"name":"Charmander","color_1":"#F08030"},{"type_1":"fire","speed":80,"name":"Charmeleon","color_1":"#F08030"},{"type_1":"fire","speed":100,"name":"Charizard","color_1":"#F08030"},{"type_1":"water","speed":43,"name":"Squirtle","color_1":"#6890F0"},{"type_1":"water","speed":58,"name":"Wartortle","color_1":"#6890F0"},{"type_1":"water","speed":78,"name":"Blastoise","color_1":"#6890F0"},{"type_1":"bug","speed":45,"name":"Caterpie","color_1":"#A8B820"},{"type_1":"bug","speed":30,"name":"Metapod","color_1":"#A8B820"},{"type_1":"bug","speed":70,"name":"Butterfree","color_1":"#A8B820"},{"type_1":"bug","speed":50,"name":"Weedle","color_1":"#A8B820"},{"type_1":"bug","speed":35,"name":"Kakuna","color_1":"#A8B820"},{"type_1":"bug","speed":75,"name":"Beedrill","color_1":"#A8B820"},{"type_1":"normal","speed":56,"name":"Pidgey","color_1":"#A8A878"},{"type_1":"normal","speed":71,"name":"Pidgeotto","color_1":"#A8A878"},{"type_1":"normal","speed":101,"name":"Pidgeot","color_1":"#A8A878"},{"type_1":"normal","speed":72,"name":"Rattata","color_1":"#A8A878"},{"type_1":"normal","speed":97,"name":"Raticate","color_1":"#A8A878"},{"type_1":"normal","speed":70,"name":"Spearow","color_1":"#A8A878"},{"type_1":"normal","speed":100,"name":"Fearow","color_1":"#A8A878"},{"type_1":"poison","speed":55,"name":"Ekans","color_1":"#A040A0"},{"type_1":"poison","speed":80,"name":"Arbok","color_1":"#A040A0"},{"type_1":"electric","speed":90,"name":"Pikachu","color_1":"#F8D030"},{"type_1":"electric","speed":110,"name":"Raichu","color_1":"#F8D030"},{"type_1":"ground","speed":40,"name":"Sandshrew","color_1":"#E0C068"},{"type_1":"ground","speed":65,"name":"Sandslash","color_1":"#E0C068"},{"type_1":"poison","speed":41,"name":"Nidoran-F","color_1":"#A040A0"},{"type_1":"poison","speed":56,"name":"Nidorina","color_1":"#A040A0"},{"type_1":"poison","speed":76,"name":"Nidoqueen","color_1":"#A040A0"},{"type_1":"poison","speed":50,"name":"Nidoran-M","color_1":"#A040A0"},{"type_1":"poison","speed":65,"name":"Nidorino","color_1":"#A040A0"},{"type_1":"poison","speed":85,"name":"Nidoking","color_1":"#A040A0"},{"type_1":"fairy","speed":35,"name":"Clefairy","color_1":"#EE99AC"},{"type_1":"fairy","speed":60,"name":"Clefable","color_1":"#EE99AC"},{"type_1":"fire","speed":65,"name":"Vulpix","color_1":"#F08030"},{"type_1":"fire","speed":100,"name":"Ninetales","color_1":"#F08030"},{"type_1":"normal","speed":20,"name":"Jigglypuff","color_1":"#A8A878"},{"type_1":"normal","speed":45,"name":"Wigglytuff","color_1":"#A8A878"},{"type_1":"poison","speed":55,"name":"Zubat","color_1":"#A040A0"},{"type_1":"poison","speed":90,"name":"Golbat","color_1":"#A040A0"},{"type_1":"grass","speed":30,"name":"Oddish","color_1":"#78C850"},{"type_1":"grass","speed":40,"name":"Gloom","color_1":"#78C850"},{"type_1":"grass","speed":50,"name":"Vileplume","color_1":"#78C850"},{"type_1":"bug","speed":25,"name":"Paras","color_1":"#A8B820"},{"type_1":"bug","speed":30,"name":"Parasect","color_1":"#A8B820"},{"type_1":"bug","speed":45,"name":"Venonat","color_1":"#A8B820"},{"type_1":"bug","speed":90,"name":"Venomoth","color_1":"#A8B820"},{"type_1":"ground","speed":95,"name":"Diglett","color_1":"#E0C068"},{"type_1":"ground","speed":120,"name":"Dugtrio","color_1":"#E0C068"},{"type_1":"normal","speed":90,"name":"Meowth","color_1":"#A8A878"},{"type_1":"normal","speed":115,"name":"Persian","color_1":"#A8A878"},{"type_1":"water","speed":55,"name":"Psyduck","color_1":"#6890F0"},{"type_1":"water","speed":85,"name":"Golduck","color_1":"#6890F0"},{"type_1":"fighting","speed":70,"name":"Mankey","color_1":"#C03028"},{"type_1":"fighting","speed":95,"name":"Primeape","color_1":"#C03028"},{"type_1":"fire","speed":60,"name":"Growlithe","color_1":"#F08030"},{"type_1":"fire","speed":95,"name":"Arcanine","color_1":"#F08030"},{"type_1":"water","speed":90,"name":"Poliwag","color_1":"#6890F0"},{"type_1":"water","speed":90,"name":"Poliwhirl","color_1":"#6890F0"},{"type_1":"water","speed":70,"name":"Poliwrath","color_1":"#6890F0"},{"type_1":"psychic","speed":90,"name":"Abra","color_1":"#F85888"},{"type_1":"psychic","speed":105,"name":"Kadabra","color_1":"#F85888"},{"type_1":"psychic","speed":120,"name":"Alakazam","color_1":"#F85888"},{"type_1":"fighting","speed":35,"name":"Machop","color_1":"#C03028"},{"type_1":"fighting","speed":45,"name":"Machoke","color_1":"#C03028"},{"type_1":"fighting","speed":55,"name":"Machamp","color_1":"#C03028"},{"type_1":"grass","speed":40,"name":"Bellsprout","color_1":"#78C850"},{"type_1":"grass","speed":55,"name":"Weepinbell","color_1":"#78C850"},{"type_1":"grass","speed":70,"name":"Victreebel","color_1":"#78C850"},{"type_1":"water","speed":70,"name":"Tentacool","color_1":"#6890F0"},{"type_1":"water","speed":100,"name":"Tentacruel","color_1":"#6890F0"},{"type_1":"rock","speed":20,"name":"Geodude","color_1":"#B8A038"},{"type_1":"rock","speed":35,"name":"Graveler","color_1":"#B8A038"},{"type_1":"rock","speed":45,"name":"Golem","color_1":"#B8A038"},{"type_1":"fire","speed":90,"name":"Ponyta","color_1":"#F08030"},{"type_1":"fire","speed":105,"name":"Rapidash","color_1":"#F08030"},{"type_1":"water","speed":15,"name":"Slowpoke","color_1":"#6890F0"},{"type_1":"water","speed":30,"name":"Slowbro","color_1":"#6890F0"},{"type_1":"electric","speed":45,"name":"Magnemite","color_1":"#F8D030"},{"type_1":"electric","speed":70,"name":"Magneton","color_1":"#F8D030"},{"type_1":"normal","speed":60,"name":"Farfetchd","color_1":"#A8A878"},{"type_1":"normal","speed":75,"name":"Doduo","color_1":"#A8A878"},{"type_1":"normal","speed":100,"name":"Dodrio","color_1":"#A8A878"},{"type_1":"water","speed":45,"name":"Seel","color_1":"#6890F0"},{"type_1":"water","speed":70,"name":"Dewgong","color_1":"#6890F0"},{"type_1":"poison","speed":25,"name":"Grimer","color_1":"#A040A0"},{"type_1":"poison","speed":50,"name":"Muk","color_1":"#A040A0"},{"type_1":"water","speed":40,"name":"Shellder","color_1":"#6890F0"},{"type_1":"water","speed":70,"name":"Cloyster","color_1":"#6890F0"},{"type_1":"ghost","speed":80,"name":"Gastly","color_1":"#705898"},{"type_1":"ghost","speed":95,"name":"Haunter","color_1":"#705898"},{"type_1":"ghost","speed":110,"name":"Gengar","color_1":"#705898"},{"type_1":"rock","speed":70,"name":"Onix","color_1":"#B8A038"},{"type_1":"psychic","speed":42,"name":"Drowzee","color_1":"#F85888"},{"type_1":"psychic","speed":67,"name":"Hypno","color_1":"#F85888"},{"type_1":"water","speed":50,"name":"Krabby","color_1":"#6890F0"},{"type_1":"water","speed":75,"name":"Kingler","color_1":"#6890F0"},{"type_1":"electric","speed":100,"name":"Voltorb","color_1":"#F8D030"},{"type_1":"electric","speed":140,"name":"Electrode","color_1":"#F8D030"},{"type_1":"grass","speed":40,"name":"Exeggcute","color_1":"#78C850"},{"type_1":"grass","speed":55,"name":"Exeggutor","color_1":"#78C850"},{"type_1":"ground","speed":35,"name":"Cubone","color_1":"#E0C068"},{"type_1":"ground","speed":45,"name":"Marowak","color_1":"#E0C068"},{"type_1":"fighting","speed":87,"name":"Hitmonlee","color_1":"#C03028"},{"type_1":"fighting","speed":76,"name":"Hitmonchan","color_1":"#C03028"},{"type_1":"normal","speed":30,"name":"Lickitung","color_1":"#A8A878"},{"type_1":"poison","speed":35,"name":"Koffing","color_1":"#A040A0"},{"type_1":"poison","speed":60,"name":"Weezing","color_1":"#A040A0"},{"type_1":"ground","speed":25,"name":"Rhyhorn","color_1":"#E0C068"},{"type_1":"ground","speed":40,"name":"Rhydon","color_1":"#E0C068"},{"type_1":"normal","speed":50,"name":"Chansey","color_1":"#A8A878"},{"type_1":"grass","speed":60,"name":"Tangela","color_1":"#78C850"},{"type_1":"normal","speed":90,"name":"Kangaskhan","color_1":"#A8A878"},{"type_1":"water","speed":60,"name":"Horsea","color_1":"#6890F0"},{"type_1":"water","speed":85,"name":"Seadra","color_1":"#6890F0"},{"type_1":"water","speed":63,"name":"Goldeen","color_1":"#6890F0"},{"type_1":"water","speed":68,"name":"Seaking","color_1":"#6890F0"},{"type_1":"water","speed":85,"name":"Staryu","color_1":"#6890F0"},{"type_1":"water","speed":115,"name":"Starmie","color_1":"#6890F0"},{"type_1":"psychic","speed":90,"name":"Mr-Mime","color_1":"#F85888"},{"type_1":"bug","speed":105,"name":"Scyther","color_1":"#A8B820"},{"type_1":"ice","speed":95,"name":"Jynx","color_1":"#98D8D8"},{"type_1":"electric","speed":105,"name":"Electabuzz","color_1":"#F8D030"},{"type_1":"fire","speed":93,"name":"Magmar","color_1":"#F08030"},{"type_1":"bug","speed":85,"name":"Pinsir","color_1":"#A8B820"},{"type_1":"normal","speed":110,"name":"Tauros","color_1":"#A8A878"},{"type_1":"water","speed":80,"name":"Magikarp","color_1":"#6890F0"},{"type_1":"water","speed":81,"name":"Gyarados","color_1":"#6890F0"},{"type_1":"water","speed":60,"name":"Lapras","color_1":"#6890F0"},{"type_1":"normal","speed":48,"name":"Ditto","color_1":"#A8A878"},{"type_1":"normal","speed":55,"name":"Eevee","color_1":"#A8A878"},{"type_1":"water","speed":65,"name":"Vaporeon","color_1":"#6890F0"},{"type_1":"electric","speed":130,"name":"Jolteon","color_1":"#F8D030"},{"type_1":"fire","speed":65,"name":"Flareon","color_1":"#F08030"},{"type_1":"normal","speed":40,"name":"Porygon","color_1":"#A8A878"},{"type_1":"rock","speed":35,"name":"Omanyte","color_1":"#B8A038"},{"type_1":"rock","speed":55,"name":"Omastar","color_1":"#B8A038"},{"type_1":"rock","speed":55,"name":"Kabuto","color_1":"#B8A038"},{"type_1":"rock","speed":80,"name":"Kabutops","color_1":"#B8A038"},{"type_1":"rock","speed":130,"name":"Aerodactyl","color_1":"#B8A038"},{"type_1":"normal","speed":30,"name":"Snorlax","color_1":"#A8A878"},{"type_1":"ice","speed":85,"name":"Articuno","color_1":"#98D8D8"},{"type_1":"electric","speed":100,"name":"Zapdos","color_1":"#F8D030"},{"type_1":"fire","speed":90,"name":"Moltres","color_1":"#F08030"},{"type_1":"dragon","speed":50,"name":"Dratini","color_1":"#7038F8"},{"type_1":"dragon","speed":70,"name":"Dragonair","color_1":"#7038F8"},{"type_1":"dragon","speed":80,"name":"Dragonite","color_1":"#7038F8"},{"type_1":"psychic","speed":130,"name":"Mewtwo","color_1":"#F85888"},{"type_1":"psychic","speed":100,"name":"Mew","color_1":"#F85888"}],"x":"type_1","y":"speed","group":"name","color":"color_1","title":"Distribution of Pokemon Speed by Type"},"evals":[],"jsHooks":[]}</script>

## Bar

Let's start by counting Pokemon by type:

```r
pokemon_count <- pokemon %>%
  group_by(type_1, color_1) %>%
  count()
```

Now we can create a bar chart by using `type_1` both for the `x` axis
and the `group_by` variable provided this data has no `year` column or
similar:

```r
d3po(pokemon_count) %>%
  po_bar(
    daes(x = type_1, y = n, group = type_1, color = color_1)
  ) %>%
  po_title("Count of Pokemon by Type")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-20dedf99ba3d9df88804" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-20dedf99ba3d9df88804">{"x":{"type":"bar","data":[{"type_1":"bug","n":12,"color_1":"#A8B820"},{"type_1":"dragon","n":3,"color_1":"#7038F8"},{"type_1":"electric","n":9,"color_1":"#F8D030"},{"type_1":"fairy","n":2,"color_1":"#EE99AC"},{"type_1":"fighting","n":7,"color_1":"#C03028"},{"type_1":"fire","n":12,"color_1":"#F08030"},{"type_1":"ghost","n":3,"color_1":"#705898"},{"type_1":"grass","n":12,"color_1":"#78C850"},{"type_1":"ground","n":8,"color_1":"#E0C068"},{"type_1":"ice","n":2,"color_1":"#98D8D8"},{"type_1":"normal","n":22,"color_1":"#A8A878"},{"type_1":"poison","n":14,"color_1":"#A040A0"},{"type_1":"psychic","n":8,"color_1":"#F85888"},{"type_1":"rock","n":9,"color_1":"#B8A038"},{"type_1":"water","n":28,"color_1":"#6890F0"}],"x":"type_1","y":"n","group":"type_1","color":"color_1","title":"Count of Pokemon by Type"},"evals":[],"jsHooks":[]}</script>

## Treemap

By using the `pokemon_count` table created for the bar chart, the logic
is exactly the same and we only need to change the function and specify
the `size` instead of `x` and `y`:

```r
d3po(pokemon_count) %>%
  po_treemap(
    daes(size = n, group = type_1, color = color_1)
  ) %>%
  po_title("Share of Pokemon by Type")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-658f0a5403752222e3b1" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-658f0a5403752222e3b1">{"x":{"type":"treemap","data":[{"n":12,"type_1":"bug","color_1":"#A8B820"},{"n":3,"type_1":"dragon","color_1":"#7038F8"},{"n":9,"type_1":"electric","color_1":"#F8D030"},{"n":2,"type_1":"fairy","color_1":"#EE99AC"},{"n":7,"type_1":"fighting","color_1":"#C03028"},{"n":12,"type_1":"fire","color_1":"#F08030"},{"n":3,"type_1":"ghost","color_1":"#705898"},{"n":12,"type_1":"grass","color_1":"#78C850"},{"n":8,"type_1":"ground","color_1":"#E0C068"},{"n":2,"type_1":"ice","color_1":"#98D8D8"},{"n":22,"type_1":"normal","color_1":"#A8A878"},{"n":14,"type_1":"poison","color_1":"#A040A0"},{"n":8,"type_1":"psychic","color_1":"#F85888"},{"n":9,"type_1":"rock","color_1":"#B8A038"},{"n":28,"type_1":"water","color_1":"#6890F0"}],"size":"n","group":"type_1","color":"color_1","title":"Share of Pokemon by Type"},"evals":[],"jsHooks":[]}</script>

## Pie

Use these plots with caution because polar coordinates has major
perceptual problems. Use with *EXTREME* caution.

This method is exactly the same as `treemap` but changing the function.

```r
d3po(pokemon_count) %>%
  po_pie(
    daes(size = n, group = type_1, color = color_1)
  ) %>%
  po_title("Share of Pokemon by Type")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-7e9007bebd49553ac94f" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-7e9007bebd49553ac94f">{"x":{"type":"pie","data":[{"n":12,"type_1":"bug","color_1":"#A8B820"},{"n":3,"type_1":"dragon","color_1":"#7038F8"},{"n":9,"type_1":"electric","color_1":"#F8D030"},{"n":2,"type_1":"fairy","color_1":"#EE99AC"},{"n":7,"type_1":"fighting","color_1":"#C03028"},{"n":12,"type_1":"fire","color_1":"#F08030"},{"n":3,"type_1":"ghost","color_1":"#705898"},{"n":12,"type_1":"grass","color_1":"#78C850"},{"n":8,"type_1":"ground","color_1":"#E0C068"},{"n":2,"type_1":"ice","color_1":"#98D8D8"},{"n":22,"type_1":"normal","color_1":"#A8A878"},{"n":14,"type_1":"poison","color_1":"#A040A0"},{"n":8,"type_1":"psychic","color_1":"#F85888"},{"n":9,"type_1":"rock","color_1":"#B8A038"},{"n":28,"type_1":"water","color_1":"#6890F0"}],"size":"n","group":"type_1","color":"color_1","title":"Share of Pokemon by Type"},"evals":[],"jsHooks":[]}</script>

## Line

Let's start by obtaining the decile for the Pokemon `weight` just for
the grass, fire and water type:

```r
pokemon_decile <- pokemon %>%
  filter(type_1 %in% c("grass", "fire", "water")) %>%
  group_by(type_1, color_1) %>%
  summarise(
    decile = 0:10,
    weight = quantile(weight, probs = seq(0, 1, by = .1))
  )
```

Now we can create an area chart by using the `variable` and `color`
columns created above:

```r
d3po(pokemon_decile) %>%
  po_line(
    daes(x = decile, y = weight, group = type_1, color = color_1)
  ) %>%
  po_title("Decile of Pokemon Weight by Type")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-e4e2cab51a29241ca854" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-e4e2cab51a29241ca854">{"x":{"type":"line","data":[{"decile":0,"weight":8.5,"type_1":"fire","color_1":"#F08030"},{"decile":1,"weight":10.81,"type_1":"fire","color_1":"#F08030"},{"decile":2,"weight":19,"type_1":"fire","color_1":"#F08030"},{"decile":3,"weight":19.27,"type_1":"fire","color_1":"#F08030"},{"decile":4,"weight":21.94,"type_1":"fire","color_1":"#F08030"},{"decile":5,"weight":27.5,"type_1":"fire","color_1":"#F08030"},{"decile":6,"weight":38.7,"type_1":"fire","color_1":"#F08030"},{"decile":7,"weight":55.35,"type_1":"fire","color_1":"#F08030"},{"decile":8,"weight":84.4,"type_1":"fire","color_1":"#F08030"},{"decile":9,"weight":94.55,"type_1":"fire","color_1":"#F08030"},{"decile":10,"weight":155,"type_1":"fire","color_1":"#F08030"},{"decile":0,"weight":2.5,"type_1":"grass","color_1":"#78C850"},{"decile":1,"weight":4.14,"type_1":"grass","color_1":"#78C850"},{"decile":2,"weight":5.6,"type_1":"grass","color_1":"#78C850"},{"decile":3,"weight":6.55,"type_1":"grass","color_1":"#78C850"},{"decile":4,"weight":7.58,"type_1":"grass","color_1":"#78C850"},{"decile":5,"weight":10.8,"type_1":"grass","color_1":"#78C850"},{"decile":6,"weight":14.5,"type_1":"grass","color_1":"#78C850"},{"decile":7,"weight":17.67,"type_1":"grass","color_1":"#78C850"},{"decile":8,"weight":31.72,"type_1":"grass","color_1":"#78C850"},{"decile":9,"weight":93.5,"type_1":"grass","color_1":"#78C850"},{"decile":10,"weight":120,"type_1":"grass","color_1":"#78C850"},{"decile":0,"weight":4,"type_1":"water","color_1":"#6890F0"},{"decile":1,"weight":8.7,"type_1":"water","color_1":"#6890F0"},{"decile":2,"weight":13.44,"type_1":"water","color_1":"#6890F0"},{"decile":3,"weight":20.25,"type_1":"water","color_1":"#6890F0"},{"decile":4,"weight":28.2,"type_1":"water","color_1":"#6890F0"},{"decile":5,"weight":37.5,"type_1":"water","color_1":"#6890F0"},{"decile":6,"weight":54.2,"type_1":"water","color_1":"#6890F0"},{"decile":7,"weight":74.94,"type_1":"water","color_1":"#6890F0"},{"decile":8,"weight":83.3,"type_1":"water","color_1":"#6890F0"},{"decile":9,"weight":123.75,"type_1":"water","color_1":"#6890F0"},{"decile":10,"weight":235,"type_1":"water","color_1":"#6890F0"}],"x":"decile","y":"weight","group":"type_1","color":"color_1","title":"Decile of Pokemon Weight by Type"},"evals":[],"jsHooks":[]}</script>

## Area

Let's start by obtaining the density for the Pokemon `weight`:

```r
pokemon_density <- density(pokemon$weight, n = 30)

pokemon_density <- tibble(
  x = pokemon_density$x,
  y = pokemon_density$y,
  variable = "weight",
  color = "#5377e3"
)
```

Now we can create an area chart by using the `variable` and `color`
columns created above:

```r
d3po(pokemon_density) %>%
  po_area(
    daes(x = x, y = y, group = variable, color = color)
  ) %>%
  po_title("Approximated Density of Pokemon Weight")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-ea11f66424874f186115" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-ea11f66424874f186115">{"x":{"type":"area","data":[{"x":-34.138388444083,"y":3.20905661541855e-05,"variable":"weight","color":"#5377e3"},{"x":-15.9184995858704,"y":0.00186548635970611,"variable":"weight","color":"#5377e3"},{"x":2.30138927234222,"y":0.0117159201483653,"variable":"weight","color":"#5377e3"},{"x":20.5212781305548,"y":0.0137356938046998,"variable":"weight","color":"#5377e3"},{"x":38.7411669887675,"y":0.00976435837744151,"variable":"weight","color":"#5377e3"},{"x":56.9610558469801,"y":0.00633427324995039,"variable":"weight","color":"#5377e3"},{"x":75.1809447051927,"y":0.00363625793294446,"variable":"weight","color":"#5377e3"},{"x":93.4008335634053,"y":0.00225343252250074,"variable":"weight","color":"#5377e3"},{"x":111.620722421618,"y":0.00158739911422691,"variable":"weight","color":"#5377e3"},{"x":129.840611279831,"y":0.00127214969196276,"variable":"weight","color":"#5377e3"},{"x":148.060500138043,"y":0.000405661530331513,"variable":"weight","color":"#5377e3"},{"x":166.280388996256,"y":0.000147254269528739,"variable":"weight","color":"#5377e3"},{"x":184.500277854468,"y":4.86417954557536e-05,"variable":"weight","color":"#5377e3"},{"x":202.720166712681,"y":0.000456040445634336,"variable":"weight","color":"#5377e3"},{"x":220.940055570894,"y":0.000631808226297796,"variable":"weight","color":"#5377e3"},{"x":239.159944429106,"y":0.000291036871401994,"variable":"weight","color":"#5377e3"},{"x":257.379833287319,"y":3.55434985997577e-05,"variable":"weight","color":"#5377e3"},{"x":275.599722145532,"y":2.41802287356286e-05,"variable":"weight","color":"#5377e3"},{"x":293.819611003744,"y":0.000199800855904024,"variable":"weight","color":"#5377e3"},{"x":312.039499861957,"y":0.000132869564687455,"variable":"weight","color":"#5377e3"},{"x":330.259388720169,"y":6.99765207915754e-06,"variable":"weight","color":"#5377e3"},{"x":348.479277578382,"y":2.92284908027754e-08,"variable":"weight","color":"#5377e3"},{"x":366.699166436595,"y":9.69414362821695e-12,"variable":"weight","color":"#5377e3"},{"x":384.919055294807,"y":1.03395150959981e-13,"variable":"weight","color":"#5377e3"},{"x":403.13894415302,"y":1.00375124371527e-09,"variable":"weight","color":"#5377e3"},{"x":421.358833011233,"y":7.722406603017e-07,"variable":"weight","color":"#5377e3"},{"x":439.578721869445,"y":4.70230524996806e-05,"variable":"weight","color":"#5377e3"},{"x":457.798610727658,"y":0.000226843842429473,"variable":"weight","color":"#5377e3"},{"x":476.01849958587,"y":8.67709146087996e-05,"variable":"weight","color":"#5377e3"},{"x":494.238388444083,"y":2.63380941651608e-06,"variable":"weight","color":"#5377e3"}],"x":"x","y":"y","group":"variable","color":"color","title":"Approximated Density of Pokemon Weight"},"evals":[],"jsHooks":[]}</script>

## Scatterplot

Let's explore the balance between defense and attack by Pokemon type:

```r
pokemon_def_vs_att <- pokemon %>%
  group_by(type_1, color_1) %>%
  summarise(
    mean_def = mean(defense),
    mean_att = mean(attack),
    n_pkmn = n()
  )

d3po(pokemon_def_vs_att) %>%
  po_scatter(
    daes(x = mean_att, y = mean_def, size = n_pkmn, group = type_1, color = color_1)
  ) %>%
  po_title("Average Attack vs Average Defense by Type")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-39b2e3ba857f06e5c02e" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-39b2e3ba857f06e5c02e">{"x":{"type":"scatter","data":[{"mean_att":63.75,"mean_def":57.0833333333333,"n_pkmn":12,"type_1":"bug","color_1":"#A8B820"},{"mean_att":94,"mean_def":68.3333333333333,"n_pkmn":3,"type_1":"dragon","color_1":"#7038F8"},{"mean_att":62,"mean_def":64.6666666666667,"n_pkmn":9,"type_1":"electric","color_1":"#F8D030"},{"mean_att":57.5,"mean_def":60.5,"n_pkmn":2,"type_1":"fairy","color_1":"#EE99AC"},{"mean_att":102.857142857143,"mean_def":61,"n_pkmn":7,"type_1":"fighting","color_1":"#C03028"},{"mean_att":83.9166666666667,"mean_def":62.5833333333333,"n_pkmn":12,"type_1":"fire","color_1":"#F08030"},{"mean_att":50,"mean_def":45,"n_pkmn":3,"type_1":"ghost","color_1":"#705898"},{"mean_att":70.6666666666667,"mean_def":69.5833333333333,"n_pkmn":12,"type_1":"grass","color_1":"#78C850"},{"mean_att":81.875,"mean_def":86.25,"n_pkmn":8,"type_1":"ground","color_1":"#E0C068"},{"mean_att":67.5,"mean_def":67.5,"n_pkmn":2,"type_1":"ice","color_1":"#98D8D8"},{"mean_att":67.7272727272727,"mean_def":53.5454545454545,"n_pkmn":22,"type_1":"normal","color_1":"#A8A878"},{"mean_att":74.4285714285714,"mean_def":67,"n_pkmn":14,"type_1":"poison","color_1":"#A040A0"},{"mean_att":60.125,"mean_def":57.5,"n_pkmn":8,"type_1":"psychic","color_1":"#F85888"},{"mean_att":82.2222222222222,"mean_def":110,"n_pkmn":9,"type_1":"rock","color_1":"#B8A038"},{"mean_att":70.25,"mean_def":77.5,"n_pkmn":28,"type_1":"water","color_1":"#6890F0"}],"x":"mean_att","y":"mean_def","size":"n_pkmn","group":"type_1","color":"color_1","title":"Average Attack vs Average Defense by Type"},"evals":[],"jsHooks":[]}</script>

## Network

Let's visualize a `igraph` object, we need a seed to make the layout
reproducible:

```r
set.seed(4321)
d3po(pokemon_network) %>%
  po_network(
    daes(size = size, color = color, layout = "nicely")
  )
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-73b50b5b32f7a0c5c5f5" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-73b50b5b32f7a0c5c5f5">{"x":{"type":"network","edges":[{"source":"bug","target":"flying"},{"source":"bug","target":"grass"},{"source":"bug","target":"poison"},{"source":"dragon","target":"flying"},{"source":"electric","target":"flying"},{"source":"electric","target":"steel"},{"source":"fairy","target":"normal"},{"source":"fairy","target":"psychic"},{"source":"fighting","target":"water"},{"source":"fire","target":"flying"},{"source":"flying","target":"ice"},{"source":"flying","target":"normal"},{"source":"flying","target":"poison"},{"source":"flying","target":"rock"},{"source":"flying","target":"water"},{"source":"ghost","target":"poison"},{"source":"grass","target":"poison"},{"source":"grass","target":"psychic"},{"source":"ground","target":"poison"},{"source":"ground","target":"rock"},{"source":"ice","target":"psychic"},{"source":"ice","target":"water"},{"source":"poison","target":"water"},{"source":"psychic","target":"water"},{"source":"rock","target":"water"}],"data":[{"name":"bug","size":12,"color":"#A8B820","d3poKey":"bug"},{"name":"dragon","size":3,"color":"#7038F8","d3poKey":"dragon"},{"name":"electric","size":9,"color":"#F8D030","d3poKey":"electric"},{"name":"fairy","size":5,"color":"#EE99AC","d3poKey":"fairy"},{"name":"fighting","size":8,"color":"#C03028","d3poKey":"fighting"},{"name":"fire","size":12,"color":"#F08030","d3poKey":"fire"},{"name":"flying","size":19,"color":"#A890F0","d3poKey":"flying"},{"name":"ghost","size":3,"color":"#705898","d3poKey":"ghost"},{"name":"grass","size":14,"color":"#78C850","d3poKey":"grass"},{"name":"ground","size":14,"color":"#E0C068","d3poKey":"ground"},{"name":"ice","size":5,"color":"#98D8D8","d3poKey":"ice"},{"name":"poison","size":33,"color":"#A040A0","d3poKey":"poison"},{"name":"psychic","size":14,"color":"#F85888","d3poKey":"psychic"},{"name":"rock","size":11,"color":"#B8A038","d3poKey":"rock"},{"name":"steel","size":2,"color":"#B8B8D0","d3poKey":"steel"},{"name":"normal","size":22,"color":"#A8A878","d3poKey":"normal"},{"name":"water","size":32,"color":"#6890F0","d3poKey":"water"}],"size":"size","color":"color","nodes":[{"name":"bug","size":12,"color":"#A8B820","x":3.389,"y":-0.914,"d3poKey":"bug"},{"name":"dragon","size":3,"color":"#7038F8","x":4.452,"y":-4.13,"d3poKey":"dragon"},{"name":"electric","size":9,"color":"#F8D030","x":6.04,"y":-3.975,"d3poKey":"electric"},{"name":"fairy","size":5,"color":"#EE99AC","x":0.898,"y":-3.589,"d3poKey":"fairy"},{"name":"fighting","size":8,"color":"#C03028","x":0.671,"y":-0.376,"d3poKey":"fighting"},{"name":"fire","size":12,"color":"#F08030","x":5.83,"y":-2.474,"d3poKey":"fire"},{"name":"flying","size":19,"color":"#A890F0","x":4.055,"y":-2.371,"d3poKey":"flying"},{"name":"ghost","size":3,"color":"#705898","x":3.683,"y":1.905,"d3poKey":"ghost"},{"name":"grass","size":14,"color":"#78C850","x":2.126,"y":-0.354,"d3poKey":"grass"},{"name":"ground","size":14,"color":"#E0C068","x":4.966,"y":0.51,"d3poKey":"ground"},{"name":"ice","size":5,"color":"#98D8D8","x":2.475,"y":-2.395,"d3poKey":"ice"},{"name":"poison","size":33,"color":"#A040A0","x":3.588,"y":-0.058,"d3poKey":"poison"},{"name":"psychic","size":14,"color":"#F85888","x":1.343,"y":-1.944,"d3poKey":"psychic"},{"name":"rock","size":11,"color":"#B8A038","x":4.403,"y":-0.89,"d3poKey":"rock"},{"name":"steel","size":2,"color":"#B8B8D0","x":7.453,"y":-5.081,"d3poKey":"steel"},{"name":"normal","size":22,"color":"#A8A878","x":2.454,"y":-3.817,"d3poKey":"normal"},{"name":"water","size":32,"color":"#6890F0","x":2.578,"y":-1.237,"d3poKey":"water"}],"group":"d3poKey"},"evals":[],"jsHooks":[]}</script>

## Aesthetics

Going back to the treemap example, it is possible to move the labels and
also use any font that you like:

```r
d3po(pokemon_count) %>%
  po_treemap(
    daes(size = n, group = type_1, color = color_1, align = "left")
  ) %>%
  po_title("Share of Pokemon by Type") %>%
  po_font("Fira Sans", 12, "uppercase") %>%
  po_labels("left", "top", F, "Times", 30, "uppercase")
```

<div class="d3po html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-ac298338020e3b19998d" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-ac298338020e3b19998d">{"x":{"type":"treemap","data":[{"n":12,"type_1":"bug","color_1":"#A8B820"},{"n":3,"type_1":"dragon","color_1":"#7038F8"},{"n":9,"type_1":"electric","color_1":"#F8D030"},{"n":2,"type_1":"fairy","color_1":"#EE99AC"},{"n":7,"type_1":"fighting","color_1":"#C03028"},{"n":12,"type_1":"fire","color_1":"#F08030"},{"n":3,"type_1":"ghost","color_1":"#705898"},{"n":12,"type_1":"grass","color_1":"#78C850"},{"n":8,"type_1":"ground","color_1":"#E0C068"},{"n":2,"type_1":"ice","color_1":"#98D8D8"},{"n":22,"type_1":"normal","color_1":"#A8A878"},{"n":14,"type_1":"poison","color_1":"#A040A0"},{"n":8,"type_1":"psychic","color_1":"#F85888"},{"n":9,"type_1":"rock","color_1":"#B8A038"},{"n":28,"type_1":"water","color_1":"#6890F0"}],"size":"n","group":"type_1","color":"color_1","title":"Share of Pokemon by Type","font":{"family":"Fira Sans","size":12,"transform":"uppercase"},"labels":{"align":"left","valign":"top","resize":false,"font":{"family":"Times","size":30,"transform":"uppercase"}}},"evals":[],"jsHooks":[]}</script>


