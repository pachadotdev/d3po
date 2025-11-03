library(tradestatistics)
library(dplyr)
library(sf)

trade <- ots_create_tidy_data(years = c(2019,2023), table = "yrp")

trade <- as_tibble(trade)

trade <- trade %>%
  select(year, reporter_iso, partner_iso, trade_value_usd_imp, trade_value_usd_exp)

trade <- trade %>%
  group_by(year, reporter_iso, partner_iso) %>%
  summarise(
    trade = sum(trade_value_usd_imp, na.rm = TRUE) / 1e9,
    .groups = "drop"
  ) %>%
  filter(trade > 0)

trade <- trade %>%
  filter(trade >= 1)

trade %>%
    filter(partner_iso == "CHL")

trade <- trade %>% 
  left_join(
    d3po::national %>%
      sf::st_drop_geometry() %>%
      select(reporter = country, reporter_continent = continent, reporter_iso = country_iso)
  ) %>%
  left_join(
    d3po::national %>%
      sf::st_drop_geometry() %>%
      select(partner = country, partner_continent = continent, partner_iso = country_iso)
  )

trade %>%
  filter(is.na(reporter_iso))

trade %>%
  filter(is.na(partner_iso))

trade <- trade %>%
  select(
    year,
    reporter_continent, partner_continent,
    reporter, partner,
    reporter_iso, partner_iso,
    trade
  )

trade <- trade %>%
  mutate(
    reporter_iso = as.factor(reporter_iso),
    partner_iso = as.factor(partner_iso)
  )

use_data(trade, overwrite = TRUE)
