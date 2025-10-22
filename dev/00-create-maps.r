library(dplyr)
library(jsonlite)
library(rmapshaper)
library(geojsonio)
library(sf)
library(d3po)

# Start with empty list ----

maps <- list()

# Experiment with country ----

# country <- topojson_read("dev/maps/ca-all.topojson")

# # merge polygons by hc.a2
# country <- country %>%
#   ms_simplify(keep = 0.3) %>%
#   ms_dissolve(field = "hc.a2")

# # convert to geojson
# country_id <- country$hc.a2

# ftemp <- "dev/maps/temp.geojson"
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
  print(url)

  topojson <- paste0("dev/maps/", gsub("topo\\.json", "topojson", gsub(".*/", "", url)))

  if (!file.exists(topojson)) {
    download.file(url, topojson)
  }

  country <- topojson_read(topojson)

  # if ("hasc" %in% names(country)) {
  #   country <- country %>%
  #     dplyr::filter(hasc != "-99")
  # }

  # merge polygons by hc.a2
  country_aux <- country %>%
    st_set_crs("NAD83") %>%
    ms_dissolve(field = "hc.a2") %>%
    arrange(`hc.a2`) %>%
    ms_simplify(keep = 0.95, keep_shapes = TRUE)

  # if (grepl("world", topojson)) {
  #   # rotate the map 11 degrees to the left with st_transform
  #   country_aux <- country_aux %>%
  #     st_transform(crs = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs +towgs84=0,0,0 +to +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs +towgs84=-11,0,0")
  # }

  country <- country %>%
    as.data.frame() %>%
    select(`hc.a2`, name) %>%
    arrange(`hc.a2`) %>%
    group_by(`hc.a2`) %>%
    filter(!is.na(name)) %>% # trick to avoid name = NA
    inner_join(country_aux, by = "hc.a2")

  # convert to geojson
  country_id <- country$hc.a2
  country_name <- country$name

  ftemp <- "dev/maps/temp.geojson"
  suppressWarnings(try(file.remove(ftemp)))
  geojson_write(country$geometry, file = ftemp)
  country <- suppressWarnings(readLines(ftemp))

  country <- geojsonio::geo2topo(country, object_name = "default")
  suppressWarnings(try(file.remove(ftemp)))
  writeLines(country, ftemp)

  country <- fromJSON(ftemp, simplifyVector = FALSE)
  # add id to each geometry
  for (i in seq_along(country$objects$default$geometries)) {
      country$objects$default$geometries[[i]]$id <- country_id[i]
      country$objects$default$geometries[[i]]$name <- country_name[i]
  }

  suppressWarnings(try(file.remove(ftemp)))

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

countries <- topojson_read("dev/maps/africa.topojson")

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
topojson <- paste0("dev/maps/", gsub("topo\\.json", "topojson", gsub(".*/", "", url)))

i <- length(maps) + 1
maps[[i]] <- list()
names(maps)[i] <- "asia"

j <- length(maps$asia) + 1
maps$asia[[j]] <- download_and_simplify_topojson(url)
names(maps$asia)[j] <- "continent"

## Countries ----

countries <- topojson_read("dev/maps/asia.topojson")

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

countries <- topojson_read("dev/maps/europe.topojson")

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

countries <- topojson_read("dev/maps/north-america.topojson")

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

countries <- topojson_read("dev/maps/oceania.topojson")

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

countries <- topojson_read("dev/maps/south-america.topojson")

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

# url <- "https://code.highcharts.com/mapdata/custom/world.topo.json"

# i <- length(maps) + 1
# maps[[i]] <- download_and_simplify_topojson(url)
# names(maps)[i] <- "world"

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
