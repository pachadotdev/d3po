# Input to asJSON(keep_vec_names=TRUE) is a named vector. In a future version of jsonlite, this option will not be
# supported, and named vectors will be translated into arrays instead of objects. If you want JSON object output,
# please use a named list instead. See ?toJSON.

load_all()

library(sf)

# BAR CHARTS ----

# Bar 1: Trade by Continent with Color Vector
trade_by_continent <- d3po::trade[d3po::trade$year == 2023L, ]
trade_by_continent <- aggregate(
  trade ~ reporter_continent,
  data = d3po::trade,
  FUN = sum
)

# Assign colors to continents
my_pal <- tintin::tintin_pal()(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_bar(daes(x = reporter_continent, y = trade, color = my_pal)) %>%
  po_labels(
    x = "Continent",
    y = "Trade (USD billion)",
    title = "Total Trade by Reporter Continent in 2023 (Vertical Bars)"
)

# Bar 2: Trade by Continent with Color Column (Horizontal Bars)
trade_by_continent$color <- my_pal[trade_by_continent$reporter_continent]

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_bar(daes(x = trade, y = reporter_continent, color = color)) %>%
  po_labels(
    x = "Trade (USD billion)",
    y = "Continent",
    title = "Total Trade by Reporter Continent in 2023 (Horizontal Bars)"
 )

# Bar 3: Trade by Reporter and Partner Continent (Stacked Bars)
trade_stacked <- d3po::trade
trade_stacked <- aggregate(trade ~ reporter_continent + partner_continent, data = trade_stacked, FUN = sum)

trade_stacked$color <- ifelse(trade_stacked$partner_continent == "Africa" , my_pal["Africa"], NA)
trade_stacked$color <- ifelse(trade_stacked$partner_continent == "Antarctica" , my_pal["Antarctica"], trade_stacked$color)
trade_stacked$color <- ifelse(trade_stacked$partner_continent == "Asia" , my_pal["Asia"], trade_stacked$color)
trade_stacked$color <- ifelse(trade_stacked$partner_continent == "Europe" , my_pal["Europe"], trade_stacked$color)
trade_stacked$color <- ifelse(trade_stacked$partner_continent == "North America" , my_pal["North America"], trade_stacked$color)
trade_stacked$color <- ifelse(trade_stacked$partner_continent == "Oceania" , my_pal["Oceania"], trade_stacked$color)
trade_stacked$color <- ifelse(trade_stacked$partner_continent == "South America" , my_pal["South America"], trade_stacked$color)

d3po(trade_stacked, width = 800, height = 600) %>%
  po_bar(daes(
    x = reporter_continent, y = trade, group = partner_continent,
    color = color, stack = TRUE
  )) %>%
  po_labels(
    x = "Reporter Continent",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter and Partner Continent in 2023 (Stacked)"
  )

# Bar 4: Bar 1 with Customised Theme

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_bar(daes(x = reporter_continent, y = trade, color = my_pal)) %>%
  po_labels(
    x = "Reporter Continent",
    y = "Trade (USD billion)",
    title = "Total Trade by Reporter Continent in 2023 (Vertical Bars)"
  ) %>%
  po_theme(axis = "#012169", tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)

# PIE/DONUT CHARTS ----

# Pie 1: Trade Share by Continent with Color Vector
trade_by_continent <- d3po::trade[d3po::trade$year == 2023L, ]
trade_by_continent <- aggregate(
  trade ~ reporter_continent,
  data = d3po::trade,
  FUN = sum
)

# Assign colors to continents
my_pal <- tintin::tintin_pal(option = "The Black Island")(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_pie(daes(size = trade, group = reporter_continent, color = my_pal)) %>%
  po_labels(title = "Trade Share by Reporter Continent in 2023 (Pie)")

# Donut 1: Donut Chart with Color Column
trade_by_continent$color <- my_pal[trade_by_continent$reporter_continent]

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_donut(daes(size = trade, group = reporter_continent, innerRadius = 0.3, color = color)) %>%
  po_labels(title = "Trade Share by Reporter Continent in 2023 (Donut)")

# Pie 2: Pie 1 with Customised Theme

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_pie(daes(size = trade, group = reporter_continent, color = my_pal)) %>%
  po_labels(title = "Trade Share by Reporter Continent in 2023 (Pie)") %>%
  po_theme(tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)

# AREA CHARTS ----

# Area 1: Trade by Continent and Year with Color Vector
trade_by_continent <- d3po::trade
trade_by_continent <- aggregate(
  trade ~ year + reporter_continent,
  data = trade_by_continent,
  FUN = sum
)

# Assign colors to continents
my_pal <- tintin::tintin_pal(option = "Cigars of the Pharaoh")(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_area(daes(
    x = year, y = trade, group = reporter_continent, color = my_pal
  )) %>%
  po_labels(
    x = "Year",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent in 2019 and 2023 (Area)"
)

# Area 2: Trade by Continent and Year with Color Column

trade_by_continent$color <- my_pal[trade_by_continent$reporter_continent]

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_area(daes(
    x = year, y = trade, group = reporter_continent, color = color
  )) %>%
  po_labels(
    x = "Year",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent in 2019 and 2023 (Area)"
)

# Area 3: Trade Proportions by Continent and Year with Color Vector (Stacked)

trade_by_continent$proportion <- ave(
  trade_by_continent$trade,
  trade_by_continent$year,
  FUN = function(x) x / sum(x)
)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_area(daes(
    x = year, y = proportion, group = reporter_continent, color = my_pal, stack = TRUE
  )) %>%
  po_labels(
    x = "Year",
    y = "Proportion of Trade",
    title = "Trade Proportions by Reporter Continent in 2019 and 2023 (Stacked Area)"
)

# Area 4: Trade Proportions by Continent and Year with Color Column (Stacked)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_area(daes(
    x = year, y = proportion, group = reporter_continent, color = color, stack = TRUE
  )) %>%
  po_labels(
    x = "Year",
    y = "Proportion of Trade",
    title = "Trade Proportions by Reporter Continent in 2019 and 2023 (Stacked Area)"
)

# Area 5: Area 1 with Customised Theme

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_area(daes(
    x = year, y = trade, group = reporter_continent, color = my_pal
  )) %>%
  po_labels(
    x = "Year",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent in 2019 and 2023 (Area)"
  ) %>%
  po_theme(axis = "#012169", tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)

# LINE CHARTS ----

# This is very similar to Area charts but using po_line()

# Line 1: Trade by Continent and Year with Color Vector

trade_by_continent <- d3po::trade
trade_by_continent <- aggregate(
  trade ~ year + reporter_continent,
  data = trade_by_continent,
  FUN = sum
)

# Assign colors to continents
my_pal <- tintin::tintin_pal(option = "The Broken Ear")(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_line(daes(x = year, y = trade, group = reporter_continent, color = my_pal)) %>%
  po_labels(
    x = "Year",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent in 2019 and 2023"
)

# Line 2: Trade by Continent and Year with Color Column

trade_by_continent$color <- my_pal[trade_by_continent$reporter_continent]

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_line(daes(x = year, y = trade, group = reporter_continent, color = color)) %>%
  po_labels(
    x = "Year",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent in 2019 and 2023"
)

# Line 3: Line 1 with Customised Theme

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_line(daes(x = year, y = trade, group = reporter_continent, color = my_pal)) %>%
  po_labels(
    x = "Year",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent in 2019 and 2023"
  ) %>%
  po_theme(axis = "#012169", tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)

# SCATTER CHARTS ----

# Scatter 1: Trade in 2019 and 2023 by Country with Color Vector

# Create a wide dataset with x = 2019 and y = 2023 trade values
trade_wide_2019 <- d3po::trade[d3po::trade$year == 2019L, c("reporter", "trade")]
trade_wide_2019 <- aggregate(trade ~ reporter, data = trade_wide_2019, FUN = sum)

trade_wide_2023 <- d3po::trade[d3po::trade$year == 2023L, c("reporter", "trade")]
trade_wide_2023 <- aggregate(trade ~ reporter, data = trade_wide_2023, FUN = sum)

trade_wide <- merge(
  trade_wide_2019,
  trade_wide_2023,
  by = "reporter",
  suffixes = c("_2019", "_2023")
)

my_pal <- tintin::tintin_pal(option = "red_rackhams_treasure")(7)

d3po(trade_wide, width = 800, height = 600) %>%
  po_scatter(daes(x = trade_2019, y = trade_2023, group = reporter, color = my_pal)) %>%
  po_labels(
    x = "Trade in 2019 (USD billion)",
    y = "Trade in 2023 (USD billion)",
    title = "Trade Volume by Country in 2019 and 2023"
  )

# Scatter 2: Trade in 2019 and 2023 by Country with Color Column

trade_wide$color <- sample(my_pal, nrow(trade_wide), replace = TRUE)

d3po(trade_wide, width = 800, height = 600) %>%
  po_scatter(daes(x = trade_2019, y = trade_2023, group = reporter, color = color)) %>%
  po_labels(
    x = "Trade in 2019 (USD billion)",
    y = "Trade in 2023 (USD billion)",
    title = "Trade Volume by Country in 2019 and 2023"
  )

# Scatter 3: Trade in 2019 and 2023 by Country Weighted by Trade Volume

trade_wide$size <- (trade_wide$trade_2019 + trade_wide$trade_2023) / 2

d3po(trade_wide, width = 800, height = 600) %>%
  po_scatter(daes(
    x = trade_2019, y = trade_2023,
    group = reporter, color = color, size = size
  )) %>%
  po_labels(
    x = "Trade in 2019 (USD billion)",
    y = "Trade in 2023 (USD billion)",
    title = "Trade Volume by Country in 2019 and 2023 (Weighted Scatter)"
  )

# Scatter 4: Scatter 1 with Customised Theme

d3po(trade_wide, width = 800, height = 600) %>%
  po_scatter(daes(x = trade_2019, y = trade_2023, group = reporter, color = my_pal)) %>%
  po_labels(
    x = "Trade in 2019 (USD billion)",
    y = "Trade in 2023 (USD billion)",
    title = "Trade Volume by Country in 2019 and 2023"
  ) %>%
  po_theme(axis = "#012169", tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)

# BOX PLOTS ----

# Box 1: Trade Distribution by Continent with Color Vector
trade_continent <- d3po::trade
trade_continent <- aggregate(
  trade ~ reporter_continent + reporter,
  data = trade_continent,
  FUN = sum
)

my_pal <- tintin::tintin_pal(option = "Destination Moon")(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(trade_continent, width = 800, height = 600) %>%
  po_box(daes(x = reporter_continent, y = trade, color = my_pal, tooltip = reporter_continent)) %>%
  po_labels(
    x = "Continent",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent"
)

# Box 2: Trade Distribution by Continent with Color Column (Horizontal)
trade_continent$color <- my_pal[trade_continent$reporter_continent]

d3po(trade_continent, width = 800, height = 600) %>%
  po_box(daes(y = reporter_continent, x = trade, color = color, tooltip = reporter_continent)) %>%
  po_labels(
    y = "Continent",
    x = "Trade (USD billion)",
    title = "Trade Distribution by Continents with Custom Colors"
  )

# Box 3: Box 1 with Customised Theme

d3po(trade_continent, width = 800, height = 600) %>%
  po_box(daes(x = reporter_continent, y = trade, color = my_pal, tooltip = reporter_continent)) %>%
  po_labels(
    x = "Continent",
    y = "Trade (USD billion)",
    title = "Trade Distribution by Reporter Continent"
  ) %>%
  po_theme(axis = "#012169", tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)

# TREEMAP CHARTS ----

# Treemap 1: Trade by Continent with Color Vector (Single Level, Squarify)
trade_by_continent <- d3po::trade[d3po::trade$year == 2023L, ]
trade_by_continent <- aggregate(trade ~ reporter_continent, data = trade_by_continent, FUN = sum)

my_pal <- tintin::tintin_pal(option = "The Secret of the Unicorn")(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_treemap(daes(size = trade, group = reporter_continent, color = my_pal, tiling = "Squarify")) %>%
  po_labels(title = "Trade Share by Continent in 2023 (Squarify Treemap)")

# Treemap 2: Trade by Continent with Color Column (Single Level, Slice-Dice)
trade_by_continent$color <- my_pal[trade_by_continent$reporter_continent]

d3po(trade_by_continent, width = 800, height = 600) %>%
  po_treemap(daes(size = trade, group = reporter_continent, color = color, tiling = "slice-dice")) %>%
  po_labels(title = "Trade Share by Continent (Slice-Dice Treemap)")

# Treemap 3: Two-Level (Continent and Top Countries)
trade_twolevel <- d3po::trade[d3po::trade$year == 2023L, ]
trade_twolevel <- aggregate(trade ~ reporter_continent + reporter, data = trade_twolevel, FUN = sum)
trade_twolevel$color <- my_pal[trade_twolevel$reporter_continent]

d3po(trade_twolevel, width = 800, height = 600) %>%
  po_treemap(daes(
    size = trade, group = reporter_continent, subgroup = reporter,
    color = color, tiling = "squarify"
  )) %>%
  po_labels(title = "Trade Share by Continent in 2023 (Two Levels, click to drill)")

# Treemap 4: Treemap 3 with Customised Theme and Tooltip

d3po(trade_twolevel, width = 800, height = 600) %>%
  po_treemap(daes(
    size = trade, group = reporter_continent, subgroup = reporter,
    color = color, tiling = "squarify"
  )) %>%
  po_theme(background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE) %>%
  po_labels(
    align = "center-middle",
    labels = JS(
        "function(percentage, row) {
          var pct = (percentage).toFixed(2) + '%';
          // Show reporter (country) if available, otherwise show reporter_continent
          var name = (row && row.reporter) ? row.reporter : (row && row.reporter_continent ? row.reporter_continent : '');
          var count = row && (row.trade != null ? row.trade : (row.value != null ? row.value : ''));
          count = (count).toFixed(2) + 'B';
          return '<i>' + name + '</i><br/>Trade: ' + (count || '') + '<br/>Percentage: ' + pct;\n      
        }"
    ),
    title = "Trade Share by Continent in 2023 (Two Levels, click to drill)",
    subtitle = JS(
        "function(_v, row) {
          // row.mode is 'aggregated' | 'flat' | 'drilled'
          if (row && row.mode === 'drilled') return 'Displaying Countries';
          return 'Displaying Continents';\
        }"
    )
  ) %>%
  po_tooltip(JS(
      "function(percentage, row) {
        var pct = (percentage).toFixed(2) + '%';

        var count = row && row.count != null ? row.count : '';
        count = (count).toFixed(2) + 'B';

        if (!row || !row.reporter) {
          var t1 = row && (row.reporter_continent || row.reporter) ? (row.reporter_continent || row.reporter) : '';
          return '<i>Continent: ' + t1 + '</i><br/>Trade: ' + count + '<br/>Percentage: ' + pct;
        }

        return '<i>Continent: ' + (row.reporter_continent || '') + '<br/>Country: ' + (row.reporter || '') +
        '</i><br/>Trade: ' + count + '<br/>Percentage: ' + pct;
      }"
    ))

# GEOMAP ----

# Geomap 1: Trade Volume by Country with Color Vector
world <- d3po::national

# Fix geometries that cross the antimeridian (date line) to avoid horizontal lines
# This affects Russia, Fiji, and other countries spanning the 180° meridian
world$geometry <- sf::st_wrap_dateline(world$geometry, options = c("WRAPDATELINE=YES"))

total_trade <- d3po::trade[d3po::trade$year == 2023L, c("reporter", "reporter_continent", "trade")]
total_trade <- aggregate(trade ~ reporter, data = total_trade, FUN = sum)
colnames(total_trade) <- c("country", "trade")

world <- merge(
  world,
  total_trade,
  by = "country",
  all.x = TRUE,
  all.y = FALSE
)

my_pal <- tintin::tintin_pal(option = "The Calculus Affair")(7)

names(my_pal) <- c(
  "Africa", "Antarctica", "Asia",
  "Europe", "North America", "Oceania", "South America"
)

d3po(world, width = 800, height = 600) %>%
  po_geomap(daes(group = country, size = trade, color = my_pal, tooltip = country)) %>%
  po_labels(title = "Trade Volume by Country in 2023")

# Geomap 2: Trade Volume by Country with Color Column (Europe)
europe <- world[world$continent == "Europe", ]

# Filter to continental Europe + Iceland using bounding box
# This excludes overseas territories like Canary Islands, French Guiana, etc.
bbox <- sf::st_bbox(c(xmin = -27, ymin = 30, xmax = 40, ymax = 72), crs = sf::st_crs(europe))
europe <- sf::st_crop(europe, bbox)

europe$color <- my_pal[europe$continent]

d3po(europe, width = 800, height = 600) %>%
  po_geomap(daes(group = country, size = trade, color = color, tooltip = country)) %>%
  po_labels(title = "Trade Volume by Country in 2023")

# Geomap 3: With custom color vector
my_color <- c("#e74c3c", "#3498db", "#2ecc71")

d3po(europe, width = 800, height = 600) %>%
  po_geomap(daes(group = country, size = trade, color = my_color, tooltip = country)) %>%
  po_labels(title = "Trade Volume by Country in 2023")

# Geomap 4: Gradient coloring based on values
d3po(europe, width = 800, height = 600) %>%
  po_geomap(daes(group = country, size = trade, gradient = TRUE, tooltip = country)) %>%
  po_labels(title = "Trade Volume by Country in 2023")

# Geomap 5: Gradient coloring with custom palette
d3po(europe, width = 800, height = 600) %>%
  po_geomap(daes(group = country, size = trade, color = my_color, gradient = TRUE, tooltip = country)) %>%
  po_labels(title = "Trade Volume by Country in 2023")

# Geomap 6: Geomap 5 with Customised Theme

d3po(europe, width = 800, height = 600) %>%
  po_geomap(daes(group = country, size = trade, color = my_color, gradient = TRUE, tooltip = country)) %>%
  po_labels(title = "Trade Volume by Country in 2023") %>%
  po_theme(axis = "#012169", tooltip = "#101418", background = "#cccccc") %>%
  po_font("Liberation Serif", 12, "uppercase") %>%
  po_download(FALSE)
