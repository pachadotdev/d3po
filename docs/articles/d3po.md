# Introduction to d3po

The package `d3po` integrates well with `dplyr`. All the examples here
use the pipe, `%>%`, both to filter/summarise data and create the
charts.

These examples are the same as in the documentation but with some
extended comments.

## Setup

Let's start by loading packages.

```r
library(dplyr)
library(d3po)
```

## Pokemon dataset

The included dataset, `pokemon`, has a detailed documentation but let's
explore the data structure:

```r
glimpse(pokemon)
```

## Box and Whiskers

To plot the distribution of civil liberties in 2023 by continent, we
need to indicate the variables for the axis, group, and (optionally)
color:

```r
d3po(pokemon) %>%
  po_box(daes(x = type_1, y = speed, color = color_1)) %>%
  po_title("Distribution of Pokemon speed by main type")
```

## Bar

To plot the evolution of country status in time, we need to indicate the
variables for the axis and, group, and (optionally) color:

```r
dout <- pokemon %>%
  group_by(type_1, color_1) %>%
  count()

d3po(dout) %>%
  po_bar(daes(x = type_1, y = n, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```

## Treemap

To plot the share of countries by status in 2023, we need to indicate
the variables for the size, group, and (optionally) color:

```r
dout <- pokemon %>%
  group_by(type_1, color_1) %>%
  count()

d3po(dout) %>%
  po_treemap(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```

## Pie

Use these plots with caution because polar coordinates has major
perceptual problems. Use with *EXTREME* caution.

This method is exactly the same as `treemap` but calling a different
function:

```r
d3po(dout) %>%
  po_pie(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```

## Donut

Use these plots with caution because polar coordinates has major
perceptual problems. Use with *EXTREME* caution.

This method is exactly the same as `treemap` but calling a different
function:

```r
d3po(dout) %>%
  po_donut(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```

## Line

To plot the evolution of country status in time, we need to indicate the
variables for the axis, group, and (optionally) color:

```r
dout <- pokemon %>%
  filter(
    type_1 == "water"
  ) %>%
  group_by(type_1, color_1) %>%
  reframe(
    probability = c(0, 0.25, 0.5, 0.75, 1),
    quantile = quantile(speed, probability)
  )

d3po(dout) %>%
  po_line(daes(
    x = probability, y = quantile, group = type_1,
    color = color_1
  )) %>%
  po_title("Sample Quantiles for Water Pokemon Speed")
```

## Area

This method is exactly the same as `line` but calling a different
function and with the option of stacking the areas:

```r
d3po(dout) %>%
  po_line(daes(
    x = probability, y = quantile, group = type_1,
    color = color_1
  ), stacked = FALSE) %>%
  po_title("Sample Quantiles for Water Pokemon Speed")
```

## Scatterplot

This method is a combination of `line` and `treemap` but calling a
different function:

```r
dout <- pokemon %>%
  group_by(type_1, color_1) %>%
  summarise(
    attack = mean(attack),
    defense = mean(defense)
  ) %>%
  mutate(log_attack_x_defense = log(attack * defense))

d3po(dout) %>%
  po_scatter(daes(
    x = defense, y = attack,
    size = log_attack_x_defense, group = type_1, color = color_1
  )) %>%
  po_title("Pokemon Mean Attack vs Mean Defense by Main Type")
```

## Geomap

This method is very similar to all the others but we need to specify the
map. In this case, we are going to use the map of South America from the
`d3pomaps` package:

```r
dout <- map_ids(d3po::maps$asia$japan)
dout$value <- ifelse(dout$id == "TK", 1L, NA)
dout$color <- ifelse(dout$id == "TK", "#bd0029", NA)

d3po(dout) %>%
  po_geomap(
    daes(
      group = id, color = color, size = value,
      tooltip = name
    ),
    map = d3po::maps$asia$japan
  ) %>%
  po_title("Pokemon was created in the Japanese city of Tokyo")
```

## Network

This method is very similar to all the others but, unlike the others, it
needs an igraph object as input, and with the option of using a specific
layout:

```r
d3po(pokemon_network) %>%
  po_network(daes(size = size, color = color, layout = "kk")) %>%
  po_title("Connections Between Pokemon Types")
```

## Aesthetics

Going back to the treemap example, it is possible to move the labels,
change the background, and also use any font that you like:

```r
dout <- pokemon %>%
  group_by(type_1, color_1) %>%
  count()

d3po(dout) %>%
  po_treemap(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type") %>%
  po_labels("left", "top", F) %>%
  po_background("#ffcc00") %>%
  po_font("Comic Sans MS", 20, "uppercase")
```


