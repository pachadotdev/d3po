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
  tol <- max(1e-5, diag * 0.05)
  sfc2 <- tryCatch(sf::st_simplify(sfc, dTolerance = tol, preserveTopology = FALSE), error = function(e) sfc)
  sf::st_sfc(sfc2, crs = crs)
}

subnational <- admin1_all

subnational <- tryCatch({
  subnational$geometry <- strong_simplify_sfc(subnational$geometry, keep = 0.1)
  subnational
}, error = function(e) {
  message('Strong simplification pipeline failed overall: ', e$message, ' — keeping original geometries')
  subnational
})

# add subnational name and continent
subnational <- subnational %>%
  mutate(
    country = countrycode(country_iso, origin = 'iso3c', destination = 'country.name'),
    continent = countrycode(country_iso, origin = 'iso3c', destination = 'continent')
  )

subnational %>%
  as.data.frame() %>%
  filter(is.na(country)) %>%
  distinct(country_iso, country)

# see https://raw.githubusercontent.com/nvkelso/natural-earth-vector/refs/heads/master/housekeeping/ne_admin_0_details.ods
# US1 -> USA
# GB1 -> GBR
# CH1 -> CHN
# FR1 -> FRA
# NL1 -> NLD
# FI1 -> FIN
# DN1 -> DNK
# NZ1 -> NZL
# AU1 -> AUS

subnational <- subnational %>%
  mutate(
    country_iso = case_when(
      country_iso == 'US1' ~ 'USA',
      country_iso == 'GB1' ~ 'GBR',
      country_iso == 'CH1' ~ 'CHN',
      country_iso == 'FR1' ~ 'FRA',
      country_iso == 'NL1' ~ 'NLD',
      country_iso == 'FI1' ~ 'FIN',
      country_iso == 'DN1' ~ 'DNK',
      country_iso == 'NZ1' ~ 'NZL',
      country_iso == 'AU1' ~ 'AUS',
      TRUE ~ as.character(country_iso)
    )
  ) %>%
  mutate(
    country = countrycode(country_iso, origin = 'iso3c', destination = 'country.name'),
    continent = countrycode(country_iso, origin = 'iso3c', destination = 'continent')
  )

subnational %>%
  as.data.frame() %>%
  filter(is.na(country)) %>%
  distinct(country_iso, country)

sort(unique(subnational$country))

subnational <- subnational %>%
  filter(!is.na(country_iso))

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
  national$geometry <- sf::st_simplify(sf::st_geometry(national), dTolerance = 0.1, preserveTopology = TRUE)
  national
}, error = function(e) {
  message('National geometry cleanup failed: ', e$message)
  national
})

use_data(national, overwrite = TRUE, compress = "xz")
