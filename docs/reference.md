# Reference 

## D3po template
-----------------------------------

### Description

Create a new d3po templated project

### Usage

    d3po_template(path = ".")

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
## Freedom house network
----------------------------------------------

### Description

Connections between countries correspond to the strongest arcs based on
the products they export. The network was trimmed until obtaining an
average of four arcs per node.

### Usage

    freedom_house_network

### Format

A `igraph` object with 190 vertices (nodes) and 316 edges (arcs).

### Source

Adapted from the United Nations (trade volumes) and Freedom House
(freedom information).


---
## Freedom house
-------------------------------------------------------------------

### Description

For each country and territory, Freedom in the World analyzes the
electoral process, political pluralism and participation, the
functioning of the government, freedom of expression and of belief,
associational and organizational rights, the rule of law, and personal
autonomy and individual rights.

### Usage

    freedom_house

### Format

A `data frame` with 9,044 observations and 5 variables.

### Variables

-   `year`: Year of observation (1973-2023).

-   `country`: Country name.

-   `iso2c`: ISO 2-character country code. Czechoslovakia, Kosovo,
    Micronesia, Serbia and Montenegro, and Yugoslavia do not have
    unambiguous matches and appear as 'NA'.

-   `iso3c`: ISO 3-character country code. Czechoslovakia, Kosovo,
    Micronesia, Serbia and Montenegro, and Yugoslavia do not have
    unambiguous matches and appear as 'NA'.

-   `continent`: Continent name.

-   `year`: Year of observation (1973-2023).

-   `political_rights`: Political rights score (1-7 scale, with one
    representing the highest degree of Freedom and seven the lowest).

-   `civil_liberties`: Civil liberties score (1-7 scale, with one
    representing the highest degree of Freedom and seven the lowest).

-   `status`: Status of the country (Free, Partly Free, Not Free).

-   `color`: Color associated with the status of the country.

### Source

Adapted from Freedom House.


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
library(dplyr)

dout <- freedom_house %>%
  group_by(year, status, color) %>%
  count()

d3po(dout) %>%
  po_area(
daes(x = year, y = n, group = status, color = color),
stack = TRUE
  ) %>%
  po_title("Evolution of Country Status in Time")
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
library(dplyr)

dout <- freedom_house %>%
  filter(year >= 2010) %>%
  group_by(year, status, color) %>%
  count()

d3po(dout) %>%
  po_bar(
daes(x = year, y = n, group = status, color = color)
  ) %>%
  po_title("Evolution of Country Status in Time")
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
library(dplyr)

dout <- freedom_house %>% 
  filter(year == 2023)
 
d3po(dout) %>%
  po_box(daes(x = continent, y = civil_liberties, group = country, color = color)) %>% 
  po_title("Civil Liberties Distribution by Continent")
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
library(dplyr)

dout <- freedom_house %>%
  filter(year == 2023) %>%
  group_by(status, color) %>%
  count()

d3po(dout) %>%
  po_donut(
daes(size = n, group = status, color = color)
  ) %>%
  po_title("Count of Countries by Continent and Status")
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
<td><p>transform to use ("lowercase", "uppercase", "capitalize", "none").</p></td>
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
if (rlang::is_installed("d3pomaps")) {
 library(dplyr)

 dout <- freedom_house %>%
   filter(year == 2023, !is.na(iso2c)) %>%
   select(id = iso2c, status, color)

 d3po(dout) %>% 
   po_geomap(
 daes(group = id, color = color, size = status, tooltip = status),
 map = d3pomaps::maps$south_america$continent
   )
}
```


---
## Po labels
------

### Description

Edit labels positioning in a chart.

### Usage

    po_labels(
      d3po,
      align = "center",
      valign = "middle",
      resize = TRUE,
      family = "Fira Sans",
      size = 16,
      transform = "capitalize"
    )

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
<tr class="odd">
<td><code id="po_labels_:_family">family</code></td>
<td><p>family font to use ("Roboto", "Merriweather", etc.).</p></td>
</tr>
<tr class="even">
<td><code id="po_labels_:_size">size</code></td>
<td><p>size to use (10, 11, 12, etc. overrides auto-sizing).</p></td>
</tr>
<tr class="odd">
<td><code id="po_labels_:_transform">transform</code></td>
<td><p>transform to use ("lowercase", "uppercase", "capitalize", "none").</p></td>
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
library(dplyr)

dout <- freedom_house %>%
  group_by(year, status, color) %>%
  count()

d3po(dout) %>%
  po_line(
daes(x = year, y = n, group = status, color = color)
  ) %>%
  po_title("Evolution of Country Status in Time")
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
if (rlang::is_installed("igraph")) {
 library(magrittr)

 d3po(freedom_house_network) %>%
   po_network(daes(size = exports, color = color,
 tooltip = status, layout = "kk")) %>%
   po_title("Network of countries by Freedom House status and exports")
}
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
library(dplyr)

dout <- freedom_house %>%
  filter(year == 2023) %>%
  group_by(status, color) %>%
  count()

d3po(dout) %>%
  po_pie(
daes(size = n, group = status, color = color)
  ) %>%
  po_title("Count of Countries by Continent and Status")
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
library(dplyr)

dout <- freedom_house %>%
filter(
 year %in% c(1975, 1985, 1995, 2005, 2015),
 country == "Chile"
) %>%
mutate(
  inv_civil_liberties = sqrt(1 / civil_liberties),
  inv_political_rights = sqrt(1 / political_rights)
)

d3po(dout) %>%
  po_scatter(
daes(x = inv_civil_liberties, y = inv_political_rights,
  group = year, color = color)
  ) %>%
po_title("Evolution of Chile in Time")
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
library(dplyr)

dout <- freedom_house %>%
  filter(year == 2023) %>%
  group_by(status, color) %>%
  count()

d3po(dout) %>%
  po_treemap(
daes(size = n, group = status, color = color)
  ) %>%
  po_title("Count of Countries by Continent and Status")
```


---
