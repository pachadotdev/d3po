load_all()

map <- system.file("extdata", "world.topojson", package = "d3po")
map <- jsonlite::fromJSON(map, simplifyVector = FALSE)

countries <- data.frame(id = c("CA","US","MX"), value = 1:3, value2 = 3:1)

d3po(countries, height = 500) %>%
  po_geomap(daes(group = id, color = value, labels = NULL, tooltip = value2), map = map)

d3po(countries, height = 800) %>%
  po_treemap(daes(group = id, size = value))
