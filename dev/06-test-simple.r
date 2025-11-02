load_all()

library(dplyr)
library(sf)

mymap <- sf::st_as_sf(geojsonio::topojson_read("dev/simple.topojson"))
mymap$value <- c(10,20)

class(mymap)

vis <- d3po(mymap, width = 800, height = 600) %>%
    po_geomap(daes(group = name, size = value, tooltip = name)) %>%
    po_labels(title = "Random Values by Country")

vis
