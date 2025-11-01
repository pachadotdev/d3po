load_all()

library(dplyr)
library(sf)

url <- "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
finp <- "dev/countries-110m.json"

if (!file.exists(finp)) {
  download.file(url, finp)
}

# Read TopoJSON and convert to sf object
world_topo <- geojsonio::topojson_read(finp)
world <- sf::st_as_sf(world_topo)
world$random <- sample(seq_len(nrow(world)), size = nrow(world), replace = TRUE)

class(world)

# subset to South America

south_america_countries <- c(
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
  "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
  "Falkland Islands", "South Georgia and the South Sandwich Islands",
  "French Guiana"
)

world <- world %>%
  filter(name %in% south_america_countries)

vis <- d3po(world, width = 800, height = 600) %>%
    po_geomap(daes(group = id, size = random, tooltip = name)) %>%
    po_labels(title = "Random Values by Country")

vis

# htmlwidgets::saveWidget(vis, "dev/test-topojson.html", selfcontained = F)
