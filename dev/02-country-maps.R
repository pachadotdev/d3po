load_all()

library(sf)
library(dplyr)
library(purrr)
library(rnaturalearth)
library(countrycode)

# Sub-national regions (states/provinces) by subnational ----

fout <- "dev/admin1_all.rds"

if (!file.exists(fout)) {
  admin1_all <- rnaturalearth::ne_states(returnclass = 'sf')
  admin1_all <- admin1_all %>% rename_with(~ tolower(.x))
  admin1_all <- admin1_all %>%
    select(region_iso = iso_3166_2, country_iso = sov_a3, region = name, geometry)
  saveRDS(admin1_all, file = fout, compress = 'xz')
} else {
  admin1_all <- readRDS(fout)
}

strong_simplify_sfc <- function(sfc, keep = 0.05) {
  crs <- sf::st_crs(sfc)
  # try rmapshaper if available
  if (requireNamespace('rmapshaper', quietly = TRUE)) {
    sf_row <- sf::st_sf(geometry = sfc)
    ms <- tryCatch(rmapshaper::ms_simplify(sf_row, keep = keep, keep_shapes = TRUE), error = function(e) NULL)
    if (!is.null(ms) && nrow(ms) == nrow(sf_row)) return(ms$geometry)
  }

  # fallback: aggressive sf simplify without preserveTopology
  bbox <- sf::st_bbox(sfc)
  diag <- sqrt((bbox$xmax - bbox$xmin)^2 + (bbox$ymax - bbox$ymin)^2)
  tol <- max(1e-6, diag * 0.02)
  sfc2 <- tryCatch(sf::st_simplify(sfc, dTolerance = tol, preserveTopology = FALSE), error = function(e) sfc)
  sf::st_sfc(sfc2, crs = crs)
}

subnational <- admin1_all

# add subnational name and continent
subnational <- subnational %>%
  mutate(
    country = countrycode(country_iso, origin = 'iso3c', destination = 'country.name'),
    continent = countrycode(country_iso, origin = 'iso3c', destination = 'continent')
  )

subnational <- subnational %>%
  filter(!is.na(country))

subnational <- tryCatch({
  subnational$geometry <- strong_simplify_sfc(subnational$geometry, keep = 0.05)
  subnational
}, error = function(e) {
  message('Strong simplification pipeline failed overall: ', e$message, ' — keeping original geometries')
  subnational
})

sort(unique(subnational$country))

subnational %>%
  filter(country_iso == 'CHL')

subnational <- as_tibble(subnational)

subnational <- subnational %>%
  select(continent, country, region, country_iso, region_iso, geometry)

south_america_countries <- c(
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
    "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
    "Falkland Islands", "South Georgia and the South Sandwich Islands",
    "French Guiana"
)

# South America / North America split
subnational <- subnational %>%
  mutate(
    continent = case_when(
      continent == "Americas" & as.character(country) %in% south_america_countries ~ "South America",
      continent == "Americas" ~ "North America",
      TRUE ~ as.character(continent)
    )
  )

subnational <- subnational %>%
  mutate(
    region = as.factor(region),
    country = as.factor(country),
    country_iso = as.factor(country_iso),
    continent = as.factor(continent)
  )


subnational <- subnational %>%
  arrange(continent, country, region)

# Convert to sf and ensure geometries are valid and 2D
subnational <- sf::st_as_sf(subnational)

subnational <- tryCatch({
  subnational <- sf::st_make_valid(subnational)
  subnational <- sf::st_zm(subnational, drop = TRUE, what = "ZM")
  try({ sf::st_geometry(subnational) <- sf::st_cast(sf::st_geometry(subnational), 'MULTIPOLYGON') }, silent = TRUE)
  subnational
}, error = function(e) {
  message('Geometry cleanup failed: ', e$message)
  subnational
})

use_data(subnational, overwrite = TRUE, compress = "xz")

# Countries ----

# Aggregate to one row per country_iso (country level)
national <- subnational %>%
  group_by(continent, country, country_iso) %>%
  summarize(geometry = sf::st_union(geometry), .groups = 'drop') %>%
  mutate(geometry = sf::st_make_valid(geometry))

# Additional geometry cleanup for national level
national <- tryCatch({
  # Ensure all geometries are MULTIPOLYGON and valid
  national <- sf::st_cast(national, 'MULTIPOLYGON')
  national <- sf::st_make_valid(national)
  # Simplify slightly to remove potential artifacts from st_union
  national$geometry <- sf::st_simplify(sf::st_geometry(national), dTolerance = 0.001, preserveTopology = TRUE)
  national
}, error = function(e) {
  message('National geometry cleanup failed: ', e$message)
  national
})

use_data(national, overwrite = TRUE, compress = "xz")

# Test ----

chile <- subnational %>%
  filter(country_iso == 'CHL')

chile$random <- sample(seq_len(nrow(chile)), size = nrow(chile), replace = TRUE)

d3po(chile, width = 800, height = 600) %>%
  po_geomap(daes(group = region_iso, size = random, tooltip = region)) %>%
  po_labels(title = "Random Values by Region in Chile")

south_america <- national %>%
  filter(continent == "South America")

south_america$random <- sample(seq_len(nrow(south_america)), size = nrow(south_america), replace = TRUE)

d3po(south_america, width = 800, height = 600) %>%
  po_geomap(daes(group = country_iso, size = random, tooltip = country)) %>%
  po_labels(title = "Random Values by Country in South America")

south_america <- south_america %>%
  rename(
    id = country_iso,
    name = country
  ) %>%
  mutate(
    id = as.character(id),
    name = as.character(name)
  )

dim(south_america)

length(unique(south_america$id))

d3po(south_america, width = 800, height = 600) %>%
  po_geomap(daes(group = id, size = random, tooltip = name)) %>%
  po_labels(title = "Random Values by Country in South America")
