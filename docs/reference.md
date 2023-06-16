# Reference 

## D3po template
-----------------------------------

### Description

Create a new d3po templated project

### Usage

    d3po_template(path)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="d3po_template_:_path">path</code></td>
<td><p>The path to create the new project in</p></td>
</tr>
</tbody>
</table>


---
## D3po-exports
-------------------------

### Description

D3po (re)exported methods


---
## D3po-shiny
-------------------------

### Description

Output and render functions for using d3po within Shiny applications and
interactive Rmd documents.

### Usage

    d3po_output(output_id, width = "100%", height = "400px")

    render_d3po(expr, env = parent.frame(), quoted = FALSE)

    d3po_proxy(id, session = shiny::getDefaultReactiveDomain())

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="d3po-shiny_:_output_id">output_id</code></td>
<td><p>output variable to read from</p></td>
</tr>
<tr class="even">
<td><code id="d3po-shiny_:_width">width</code>, <code id="d3po-shiny_:_height">height</code></td>
<td><p>Must be a valid CSS unit (like <code>'100%'</code>, <code>'400px'</code>, <code>'auto'</code>) or a number, which will be coerced to a string and have <code>'px'</code> appended.</p></td>
</tr>
<tr class="odd">
<td><code id="d3po-shiny_:_expr">expr</code></td>
<td><p>An expression that generates a d3po object</p></td>
</tr>
<tr class="even">
<td><code id="d3po-shiny_:_env">env</code></td>
<td><p>The environment in which to evaluate <code>expr</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="d3po-shiny_:_quoted">quoted</code></td>
<td><p>Is <code>expr</code> a quoted expression (with <code>quote()</code>)? This is useful if you want to save an expression in a variable.</p></td>
</tr>
<tr class="even">
<td><code id="d3po-shiny_:_id">id</code></td>
<td><p>Id of plot to create a proxy of.</p></td>
</tr>
<tr class="odd">
<td><code id="d3po-shiny_:_session">session</code></td>
<td><p>A valid shiny session.</p></td>
</tr>
</tbody>
</table>

### Value

Creates a basic 'htmlwidget' object for 'Shiny' and interactive
documents


---
## D3po
--------------------------------------------------------------

### Description

This function provides 'd3po' methods from R console

### Usage

    d3po(data = NULL, ..., width = NULL, height = NULL, elementId = NULL)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="d3po_:_data">data</code></td>
<td><p>d3po need explicit specified data objects formatted as JSON, and this parameter passed it from R.</p></td>
</tr>
<tr class="even">
<td><code id="d3po_:_...">...</code></td>
<td><p>Aesthetics to pass, see <code>daes()</code></p></td>
</tr>
<tr class="odd">
<td><code id="d3po_:_width">width</code></td>
<td><p>Must be a valid CSS unit (like <code>'100%'</code>, <code>'400px'</code>, <code>'auto'</code>) or a number, which will be coerced to a string and have <code>'px'</code> appended.</p></td>
</tr>
<tr class="even">
<td><code id="d3po_:_height">height</code></td>
<td><p>Same as width parameter.</p></td>
</tr>
<tr class="odd">
<td><code id="d3po_:_elementId">elementId</code></td>
<td><p>Dummy string parameter. Useful when you have two or more charts on the same page.</p></td>
</tr>
</tbody>
</table>

### Value

Creates a basic 'htmlwidget' object for simple visualization

### Author(s)

Mauricio Vargas


---
## Daes
----------

### Description

Aesthetics of the chart.

### Usage

    daes(x, y, ...)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="daes_:_x">x</code>, <code id="daes_:_y">y</code>, <code id="daes_:_...">...</code></td>
<td><p>List of name value pairs giving aesthetics to map to variables. The names for x and y aesthetics are typically omitted because they are so common; all other aspects must be named.</p></td>
</tr>
</tbody>
</table>

### Value

Aesthetics for the plots such as axis (x,y), group, color and/or size

### Aesthetics

Valid aesthetics (depending on the geom)

-   `x`, `y`: cartesian coordinates.

-   `group`: grouping data.

-   `color`: color of geom.

-   `size`: size of geom.

-   `layout`: layout of geom (nicely, fr, kk, graphopt, drl, lgl, mds,
    sugiyama), in quotes.


---
## Map ids
--------------------------

### Description

Extract the IDs from a Map

### Usage

    map_ids(map)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="map_ids_:_map">map</code></td>
<td><p>A map object</p></td>
</tr>
</tbody>
</table>

### Value

A tibble containing IDs and names

### Examples

```r
map <- map_ids(maps$south_america$continent)
```


---
## Maps
----

### Description

World, continent and country maps. These maps are provided as R lists
structured by following the 'topojson' standard. The maps are organized
in sub-lists by continent and here I provide maps for both the
continents and the countries. There are missing states or regions
because those could not be found in the original maps.

### Usage

    maps

### Format

A `list` object with 6 elements (one per continent). The Americas are
separated in North America and South America.

### Details

Missing in Asia: 'Siachen Glacier (JK)', 'Scarborough Reef (SH)', and
'Spratly Islands (SP)'. Missing in Europe: 'Vatican City (VA)'.

Missing in North America: 'Bajo Nuevo Bank (BU)', 'Serranilla Bank
(SW)', and 'United States Minor Outlying Islands (UM)'.

Missing in Oceania: 'Federated States of Micronesia (FM)', 'Marshall
Islands (MH)', and 'Tuvalu (TV)'.

Consider all these maps as referential and unofficial.

### Source

Adapted from Natural Earth.


---
## Po area
----

### Description

Plot an area chart.

### Usage

    po_area(d3po, ..., data = NULL, inherit_daes = TRUE, stack = FALSE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_area_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_area_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_area_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_area_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
<tr class="odd">
<td><code id="po_area_:_stack">stack</code></td>
<td><p>Whether to stack the series.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  filter(
#   type_1 == "water"
#  ) %>%
#  group_by(type_1, color_1) %>%
#  reframe(
#   probability = c(0, 0.25, 0.5, 0.75, 1),
#   quantile = quantile(speed, probability)
#  )

dout <- data.frame(
  type_1 = rep("water", 5),
  color_1 = rep("#6890F0", 5),
  probability = c(0, 0.25, 0.5, 0.75, 1),
  quantile = c(15, 57.25, 70, 82, 115)
)

d3po(dout) %>%
  po_area(daes(
x = probability, y = quantile, group = type_1,
color = color_1
  )) %>%
  po_title("Sample Quantiles for Water Pokemon Speed")
```


---
## Po background
----------

### Description

Add a background to a chart.

### Usage

    po_background(d3po, background = "#fff")

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_background_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_background_:_background">background</code></td>
<td><p>background to add (hex code).</p></td>
</tr>
</tbody>
</table>

### Value

Appends custom background to an 'htmlwidgets' object


---
## Po bar
---

### Description

Draw a bar chart.

### Usage

    po_bar(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_bar_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_bar_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_bar_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_bar_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  group_by(type_1, color_1) %>%
#  count()

dout <- data.frame(
  type_1 = c(
"bug", "dragon", "electric", "fairy", "fighting",
"fire", "ghost", "grass", "ground", "ice",
"normal", "poison", "psychic", "rock", "water"
  ),
  color_1 = c(
"#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
"#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
"#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
  ),
  n = c(
12, 3, 9, 2, 7,
12, 3, 12, 8, 2,
22, 14, 8, 9, 28
  )
)

d3po(dout) %>%
  po_bar(daes(x = type_1, y = n, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```


---
## Po box
-------

### Description

Draw a boxplot.

### Usage

    po_box(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_box_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_box_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_box_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_box_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
d3po(pokemon) %>%
  po_box(daes(x = type_1, y = speed, color = color_1)) %>%
  po_title("Distribution of Pokemon speed by main type")
```


---
## Po donut
-----

### Description

Plot a donut

### Usage

    po_donut(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_donut_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_donut_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_donut_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_donut_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  group_by(type_1, color_1) %>%
#  count()

dout <- data.frame(
  type_1 = c(
"bug", "dragon", "electric", "fairy", "fighting",
"fire", "ghost", "grass", "ground", "ice",
"normal", "poison", "psychic", "rock", "water"
  ),
  color_1 = c(
"#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
"#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
"#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
  ),
  n = c(
12, 3, 9, 2, 7,
12, 3, 12, 8, 2,
22, 14, 8, 9, 28
  )
)

d3po(dout) %>%
  po_donut(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```


---
## Po font
----

### Description

Edit the font used in a chart.

### Usage

    po_font(d3po, family = "Fira Sans", size = 16, transform = "none")

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_font_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_font_:_family">family</code></td>
<td><p>family font to use ("Roboto", "Merriweather", etc.).</p></td>
</tr>
<tr class="odd">
<td><code id="po_font_:_size">size</code></td>
<td><p>size to use (10, 11, 12, etc. overrides auto-sizing).</p></td>
</tr>
<tr class="even">
<td><code id="po_font_:_transform">transform</code></td>
<td><p>transformation to use for the title ("lowercase", "uppercase", "capitalize", "none").</p></td>
</tr>
</tbody>
</table>

### Value

Appends custom font to an 'htmlwidgets' object


---
## Po geomap
------

### Description

Plot a geomap

### Usage

    po_geomap(d3po, ..., data = NULL, map = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_geomap_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_geomap_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_geomap_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_geomap_:_map">map</code></td>
<td><p>map to use (i.e., any valid list or topojson file such as <code>maps$south_america</code> or <code>jsonlite::fromJSON("south_america.topojson", simplifyVector = F)</code>)</p></td>
</tr>
<tr class="odd">
<td><code id="po_geomap_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

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


---
## Po labels
------

### Description

Edit labels positioning in a chart.

### Usage

    po_labels(d3po, align = "center", valign = "middle", resize = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_labels_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_labels_:_align">align</code></td>
<td><p>horizontal alignment ("left", "center", "right", "start", "middle", "end").</p></td>
</tr>
<tr class="odd">
<td><code id="po_labels_:_valign">valign</code></td>
<td><p>vertical alignment ("top", "middle", "botton").</p></td>
</tr>
<tr class="even">
<td><code id="po_labels_:_resize">resize</code></td>
<td><p>resize labels text (TRUE or FALSE).</p></td>
</tr>
</tbody>
</table>

### Value

Appends custom labels to an 'htmlwidgets' object


---
## Po legend
------

### Description

Add a legend to a chart.

### Usage

    po_legend(d3po, legend)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_legend_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_legend_:_legend">legend</code></td>
<td><p>legend to add.</p></td>
</tr>
</tbody>
</table>

### Value

Appends custom legend to an 'htmlwidgets' object


---
## Po line
----

### Description

Plot an line chart.

### Usage

    po_line(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_line_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_line_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_line_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_line_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  filter(
#   type_1 == "water"
#  ) %>%
#  group_by(type_1, color_1) %>%
#  reframe(
#   probability = c(0, 0.25, 0.5, 0.75, 1),
#   quantile = quantile(speed, probability)
#  )

dout <- data.frame(
  type_1 = rep("water", 5),
  color_1 = rep("#6890F0", 5),
  probability = c(0, 0.25, 0.5, 0.75, 1),
  quantile = c(15, 57.25, 70, 82, 115)
)

d3po(dout) %>%
  po_line(daes(
x = probability, y = quantile, group = type_1,
color = color_1
  )) %>%
  po_title("Sample Quantiles for Water Pokemon Speed")
```


---
## Po network
-------

### Description

Draw a network.

### Usage

    po_network(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_network_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_network_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_network_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_network_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

Appends nodes arguments to a network-specific 'htmlwidgets' object

### Examples

```r
d3po(pokemon_network) %>%
  po_network(daes(size = size, color = color, layout = "kk")) %>%
  po_title("Connections Between Pokemon Types")
```


---
## Po pie
---

### Description

Plot a pie

### Usage

    po_pie(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_pie_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_pie_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_pie_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_pie_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  group_by(type_1, color_1) %>%
#  count()

dout <- data.frame(
  type_1 = c(
"bug", "dragon", "electric", "fairy", "fighting",
"fire", "ghost", "grass", "ground", "ice",
"normal", "poison", "psychic", "rock", "water"
  ),
  color_1 = c(
"#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
"#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
"#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
  ),
  n = c(
12, 3, 9, 2, 7,
12, 3, 12, 8, 2,
22, 14, 8, 9, 28
  )
)

d3po(dout) %>%
  po_pie(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```


---
## Po scatter
-------

### Description

Plot an scatter chart.

### Usage

    po_scatter(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_scatter_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_scatter_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_scatter_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_scatter_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  group_by(type_1, color_1) %>%
#  summarise(
#   attack = mean(attack),
#   defense = mean(defense)
#  ) %>%
#  mutate(log_attack_x_defense = log(attack * defense))

dout <- data.frame(
  type_1 = c(
"bug", "dragon", "electric", "fairy", "fighting",
"fire", "ghost", "grass", "ground", "ice",
"normal", "poison", "psychic", "rock", "water"
  ),
  color_1 = c(
"#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
"#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
"#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
  ),
  attack = c(
63.7, 94, 62, 57.5, 102.8,
83.9, 50, 70.6, 81.8, 67.5,
67.7, 74.4, 60.1, 82.2, 70.2
  ),
  defense = c(
57, 68.3, 64.6, 60.5, 61,
62.5, 45, 69.5, 86.2, 67.5,
53.5, 67, 57.5, 110, 77.5
  ),
  log_attack_x_defense = c(
8.1, 8.7, 8.2, 8.1, 8.7,
8.5, 7.7, 8.5, 8.8, 8.4,
8.1, 8.5, 8.1, 9.1, 8.6
  )
)

d3po(dout) %>%
  po_scatter(daes(
x = defense, y = attack,
size = log_attack_x_defense, group = type_1, color = color_1
  )) %>%
  po_title("Pokemon Mean Attack vs Mean Defense by Main Type")
```


---
## Po title
-----

### Description

Add a title to a chart.

### Usage

    po_title(d3po, title)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_title_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_title_:_title">title</code></td>
<td><p>Title to add.</p></td>
</tr>
</tbody>
</table>

### Value

Appends a title to an 'htmlwidgets' object


---
## Po treemap
-------

### Description

Plot a treemap

### Usage

    po_treemap(d3po, ..., data = NULL, inherit_daes = TRUE)

### Arguments

<table>
<tbody>
<tr class="odd">
<td><code id="po_treemap_:_d3po">d3po</code></td>
<td><p>Either the output of <code>d3po()</code> or <code>d3po_proxy()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_treemap_:_...">...</code></td>
<td><p>Aesthetics, see <code>daes()</code>.</p></td>
</tr>
<tr class="odd">
<td><code id="po_treemap_:_data">data</code></td>
<td><p>Any dataset to use for plot, overrides data passed to <code>d3po()</code>.</p></td>
</tr>
<tr class="even">
<td><code id="po_treemap_:_inherit_daes">inherit_daes</code></td>
<td><p>Whether to inherit aesthetics previous specified.</p></td>
</tr>
</tbody>
</table>

### Value

an 'htmlwidgets' object with the desired interactive plot

### Examples

```r
# library(dplyr)
# dout <- pokemon %>%
#  group_by(type_1, color_1) %>%
#  count()

dout <- data.frame(
  type_1 = c(
"bug", "dragon", "electric", "fairy", "fighting",
"fire", "ghost", "grass", "ground", "ice",
"normal", "poison", "psychic", "rock", "water"
  ),
  color_1 = c(
"#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
"#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
"#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
  ),
  n = c(
12, 3, 9, 2, 7,
12, 3, 12, 8, 2,
22, 14, 8, 9, 28
  )
)

d3po(dout) %>%
  po_treemap(daes(size = n, group = type_1, color = color_1)) %>%
  po_title("Share of Pokemon by main type")
```


---
## Pokemon network
----------------

### Description

Connections between Pokemon types based on Type 1 and 2.

### Usage

    pokemon_network

### Format

A `igraph` object with 17 vertices (nodes) and 26 edges (arcs).

### Source

Adapted from the `highcharter` package.


---
## Pokemon
-------

### Description

Statistical information about 151 Pokemon from Nintendo RPG series.

### Usage

    pokemon

### Format

A `data frame` with 151 observations and 15 variables.

### Variables

-   `id`: Pokedex number.

-   `name`: Pokedex name.

-   `height`: Height in meters.

-   `weight`: Weight in kilograms.

-   `base_experience`: How much the Pokemon has battled.

-   `type_1`: Primary Pokemon type (i.e. Grass, Fire and Water)

-   `type_2`: Secondary Pokemon type (i.e. Poison, Dragon and Ice)

-   `attack`: How much damage a Pokemon deals when using a technique.

-   `defense`: How much damage a Pokemon receives when it is hit by a
    technique.

-   `hp`: How much damage a Pokemon can receive before fainting.

-   `special_attack`: How much damage a Pokemon deals when using a
    special technique.

-   `special_defense`: How much damage a Pokemon receives when it is hit
    by a special technique.

-   `speed`: Determines the order of Pokemon that can act in battle, if
    the speed is tied then the 1st move is assigned at random.

-   `color_1`: Hex color code for Type 1.

-   `color_2`: Hex color code for Type 2.

### Source

Adapted from `highcharter` package.


---
