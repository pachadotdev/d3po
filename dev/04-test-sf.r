load_all()

library(dplyr)
library(sf)

south_america <- national %>%
  filter(continent == "South America")

south_america$random <- sample(seq_len(nrow(south_america)), size = nrow(south_america), replace = TRUE)

vis <- d3po(south_america, width = 800, height = 600) %>%
  po_geomap(daes(group = country_iso, size = random, gradient = T, tooltip = country)) %>%
  po_labels(title = "Random Values by Country in South America")

# htmlwidgets::saveWidget(vis, "dev/test-sf.html", selfcontained = F)

vis

load_all()

library(dplyr)
library(sf)

uk <- d3po::subnational %>%
  filter(country == "United Kingdom") %>%
  # filter England, Scotland, Wales and Northern Ireland by latitude/longitude
  mutate(
    latitude = sf::st_coordinates(sf::st_centroid(geometry))[, 2],
    longitude = sf::st_coordinates(sf::st_centroid(geometry))[, 1]
  ) %>%
  filter(
    latitude >= 49 & latitude <= 61,
    longitude >= -8 & longitude <= 2
  )
