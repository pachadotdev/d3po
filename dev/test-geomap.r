load_all()

map <- system.file("extdata", "south-america.topojson", package = "d3po")
map <- jsonlite::fromJSON(map, simplifyVector = FALSE)
pokemon_mewtwo <- data.frame(id = "CL", value = 1)

d3po(pokemon_mewtwo) %>%
  po_geomap(daes(group = id, color = value), map = map) %>%
  po_title("Mewtwo was found in Isla Nueva (New Island, Chile)")
