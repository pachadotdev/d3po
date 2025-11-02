load_all()

library(dplyr)
library(sf)

south_america <- national %>%
  filter(continent == "South America")

south_america <- south_america %>%
  select(id = country_iso, name = country, geometry)

sf::st_write(south_america, "dev/south_america.geojson", delete_dsn = TRUE)

south_america <- geojsonio::topojson_read("dev/south_america.geojson")
south_america <- sf::st_as_sf(south_america)
south_america$random <- sample(seq_len(nrow(south_america)), size = nrow(south_america), replace = TRUE)

vis <- d3po(south_america, width = 800, height = 600) %>%
    po_geomap(daes(group = id, size = random, tooltip = name)) %>%
    po_labels(title = "Random Values by Country")

htmlwidgets::saveWidget(vis, "dev/test-topojson.html", selfcontained = F)

vis
