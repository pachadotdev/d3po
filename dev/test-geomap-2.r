load_all()

map <- system.file("extdata", "south-america.topojson", package = "d3po")
map <- jsonlite::fromJSON(map, simplifyVector = FALSE)

# extract id from map
id <- c()
for (i in seq_along(map$objects$default$geometries)) {
  id[i] <- map$objects$default$geometries[[i]]$id
}

name <- c()
for (i in seq_along(map$objects$default$geometries)) {
  name[i] <- map$objects$default$geometries[[i]]$properties$name
}

set.seed(4321)
countries <- data.frame(id = id, name = name, value = abs(100 * rnorm(length(id))))

d3po(countries) %>%
  po_geomap(daes(group = id, text = name, color = value, tooltip = value), map = map) %>%
  po_title("Random values for each country in South America")
