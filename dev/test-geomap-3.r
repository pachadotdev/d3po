load_all()

map <- system.file("extdata", "world.topojson", package = "d3po")
map <- jsonlite::fromJSON(map, simplifyVector = FALSE)

countries <- data.frame(id = c("CA","US","MX"), value = 1:3)

d3po(countries, height = 800) %>%
  po_geomap(daes(group = id, color = value, labels = NULL), map = map)
