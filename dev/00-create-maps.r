library(magrittr)
library(jsonlite)
library(rmapshaper)
library(geojsonio)
library(d3po)

# Start with empty list ----

maps <- list()

# Experiment with country ----

# country <- topojson_read("dev/ca-all.topojson")

# # merge polygons by hc.a2
# country <- country %>%
#   ms_simplify(keep = 0.3) %>%
#   ms_dissolve(field = "hc.a2")

# # convert to geojson
# country_id <- country$hc.a2

# ftemp <- "dev/temp.geojson"
# try(file.remove(ftemp))
# geojson_write(country$geometry, file = ftemp)
# country <- suppressWarnings(readLines(ftemp))

# country <- geojsonio::geo2topo(country, object_name = "default")
# try(file.remove(ftemp))
# writeLines(country, ftemp)

# country <- fromJSON(ftemp, simplifyVector = F)
# # add id to each geometry
# for (i in seq_along(country$objects$default$geometries)) {
#     country$objects$default$geometries[[i]]$id <- country_id[i]
# }

# Now I create a function to simplify ----

download_and_simplify_topojson <- function(url) {
  topojson <- paste0("dev/", gsub("topo\\.json", "topojson", gsub(".*/", "", url)))

  if (!file.exists(topojson)) {
    download.file(url, topojson)
  }

  country <- topojson_read(topojson)

  # merge polygons by hc.a2
  country <- country %>%
    ms_simplify(keep = 0.95, keep_shapes = TRUE) %>%
    ms_dissolve(field = "hc.a2")

  # convert to geojson
  country_id <- country$hc.a2

  ftemp <- "dev/temp.geojson"
  try(file.remove(ftemp))
  geojson_write(country$geometry, file = ftemp)
  country <- suppressWarnings(readLines(ftemp))

  country <- geojsonio::geo2topo(country, object_name = "default")
  try(file.remove(ftemp))
  writeLines(country, ftemp)

  country <- fromJSON(ftemp, simplifyVector = FALSE)
  # add id to each geometry
  for (i in seq_along(country$objects$default$geometries)) {
      country$objects$default$geometries[[i]]$id <- country_id[i]
  }

  return(country)
}

# Africa ----

## Continent ----

url <- "https://code.highcharts.com/mapdata/custom/africa.topo.json"

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "africa"

j <- length(maps$africa) + 1
maps$africa[[j]] <- download_and_simplify_topojson(url)
names(maps$africa)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/africa.topojson")

countries <- data.frame(
  id = tolower(countries$hc.a2),
  name = gsub(" ", "_", tolower(countries$name))
)

countries <- countries[order(countries$id), ]

urls <- sprintf("https://code.highcharts.com/mapdata/countries/%s/%s-all.topo.json", countries$id, countries$id)
countries <- countries$name

for (i in seq_along(urls)) {
  url <- urls[i]
  country <- countries[i]

  j <- length(maps$africa) + 1
  maps$africa[[j]] <- download_and_simplify_topojson(url)
  names(maps$africa)[j] <- country
}

# Asia ----

## Continent ----

url <- "https://code.highcharts.com/mapdata/custom/asia.topo.json"
topojson <- paste0("dev/", gsub("topo\\.json", "topojson", gsub(".*/", "", url)))

if (!file.exists(topojson)) {
  download.file(url, topojson)
}

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "asia"

j <- length(maps$asia) + 1
maps$asia[[j]] <- fromJSON("dev/asia.topojson", simplifyVector = F)
names(maps$asia)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/asia.topojson")

countries <- data.frame(
  id = tolower(countries$hc.a2),
  name = gsub(" ", "_", tolower(countries$name))
)

countries <- countries[order(countries$id), ]

urls <- sprintf("https://code.highcharts.com/mapdata/countries/%s/%s-all.topo.json", countries$id, countries$id)
countries <- countries$name

for (i in seq_along(urls)) {
  url <- urls[i]
  country <- countries[i]

  if (grepl("/jk/|/sh/|/sp/", url)) {
    next
  }

  j <- length(maps$asia) + 1
  maps$asia[[j]] <- download_and_simplify_topojson(url)
  names(maps$asia)[j] <- country
}

# Europe ----

## Continent ----

url <- "https://code.highcharts.com/mapdata/custom/europe.topo.json"

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "europe"

j <- length(maps$europe) + 1
maps$europe[[j]] <- download_and_simplify_topojson(url)
names(maps$europe)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/europe.topojson")

countries <- data.frame(
  id = tolower(countries$hc.a2),
  name = gsub(" ", "_", tolower(countries$name))
)

countries <- countries[order(countries$id), ]

urls <- sprintf("https://code.highcharts.com/mapdata/countries/%s/%s-all.topo.json", countries$id, countries$id)
countries <- countries$name

for (i in seq_along(urls)) {
  url <- urls[i]
  country <- countries[i]

  if (grepl("/va/", url)) {
    next
  }

  j <- length(maps$europe) + 1
  maps$europe[[j]] <- download_and_simplify_topojson(url)
  names(maps$europe)[j] <- country
}

# North america ----

## Continent ----

url <- "https://code.highcharts.com/mapdata/custom/north-america.topo.json"

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "north_america"

j <- length(maps$north_america) + 1
maps$north_america[[j]] <- download_and_simplify_topojson(url)
names(maps$north_america)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/north-america.topojson")

countries <- data.frame(
  id = tolower(countries$hc.a2),
  name = gsub(" ", "_", tolower(countries$name))
)

countries <- countries[order(countries$id), ]

urls <- sprintf("https://code.highcharts.com/mapdata/countries/%s/%s-all.topo.json", countries$id, countries$id)
countries <- countries$name

for (i in seq_along(urls)) {
  url <- urls[i]
  country <- countries[i]

  if (grepl("/bu/|/sw/|/um/", url)) {
    next
  }

  j <- length(maps$north_america) + 1
  maps$north_america[[j]] <- download_and_simplify_topojson(url)
  names(maps$north_america)[j] <- country
}

# Oceania ----

## Continent ----

url <- "https://code.highcharts.com/mapdata/custom/oceania.topo.json"

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "oceania"

j <- length(maps$oceania) + 1
maps$oceania[[j]] <- download_and_simplify_topojson(url)
names(maps$oceania)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/oceania.topojson")

countries <- data.frame(
  id = tolower(countries$hc.a2),
  name = gsub(" ", "_", tolower(countries$name))
)

countries <- countries[order(countries$id), ]

urls <- sprintf("https://code.highcharts.com/mapdata/countries/%s/%s-all.topo.json", countries$id, countries$id)
countries <- countries$name

for (i in seq_along(urls)) {
  url <- urls[i]
  country <- countries[i]

  if (grepl("/fm/|/mh/|/tv/", url)) {
    next
  }

  j <- length(maps$oceania) + 1
  maps$oceania[[j]] <- download_and_simplify_topojson(url)
  names(maps$oceania)[j] <- country
}

# South america ----

## Continent ----

url <- "https://code.highcharts.com/mapdata/custom/south-america.topo.json"

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "south_america"

j <- length(maps$south_america) + 1
maps$south_america[[j]] <- download_and_simplify_topojson(url)
names(maps$south_america)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/south-america.topojson")

countries <- data.frame(
  id = tolower(countries$hc.a2),
  name = gsub(" ", "_", tolower(countries$name))
)

countries <- countries[order(countries$id), ]

urls <- sprintf("https://code.highcharts.com/mapdata/countries/%s/%s-all.topo.json", countries$id, countries$id)
countries <- countries$name

for (i in seq_along(urls)) {
  url <- urls[i]
  country <- countries[i]

  j <- length(maps$south_america) + 1
  maps$south_america[[j]] <- download_and_simplify_topojson(url)
  names(maps$south_america)[j] <- country
}

# World ----

url <- "https://code.highcharts.com/mapdata/custom/world.topo.json"

i <- length(maps) + 1
maps[[i]] <- download_and_simplify_topojson(url)
names(maps)[i] <- "world"

# Test ----

map_topojson <- function() {
  maps$south_america$suriname
}

ids <- c()
i <- length(ids)
for (i in seq_along(map_topojson()$objects$default$geometries)) {
  ids[i] <- map_topojson()$objects$default$geometries[[i]]$id
  i <- i + 1
}

len <- length(ids)

set.seed(42)
daux <- rnorm(len, 0, 1)
out <- data.frame(
  id = ids,
  value = daux
)

d3po(out) %>%
  po_geomap(daes(group = id, color = value), map = map_topojson())

# Save ----

use_data(maps, overwrite = TRUE, compress = "xz")
