library(tradestatistics)
library(dplyr)

trade <- ots_create_tidy_data(years = 2023, table = "yrp")

trade <- as_tibble(trade)

trade <- trade %>%
  select(reporter_iso, partner_iso, trade_value_usd_imp, trade_value_usd_exp)

trade <- trade %>%
  group_by(reporter_iso, partner_iso) %>%
  summarise(
    trade = sum(trade_value_usd_imp, na.rm = TRUE) / 1e9,
    .groups = "drop"
  ) %>%
  filter(trade > 0)

trade <- trade %>%
  filter(trade >= 1)

trade %>%
    filter(partner_iso == "CHL")

use_data(trade, overwrite = TRUE)
