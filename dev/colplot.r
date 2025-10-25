
library(dplyr)
library(d3po)
library(RPostgres)
library(pool)
library(forcats)

max_year <- 2023L
inp_r <- "GBR"

con <- dbPool(
    drv = Postgres(),
    dbname = Sys.getenv("TRADESTATISTICS_SQL_NAME"),
    host = Sys.getenv("TRADESTATISTICS_SQL_HOST"),
    user = Sys.getenv("TRADESTATISTICS_SQL_USER"),
    password = Sys.getenv("TRADESTATISTICS_SQL_PASSWORD"),
    port = Sys.getenv("TRADESTATISTICS_SQL_PORT")
  )

d <- tbl(con, "yrp")

# Show top 4 partners + "Rest of the world" for multilateral trade
d <- d %>%
  filter(
    !!sym("year") == !!max_year &
      !!sym("reporter_iso") == inp_r
  )

d <- d %>% collect()

d <- d %>%
  inner_join(
    tbl(con, "countries") %>%
      select(!!sym("country_iso"), !!sym("country_name")) %>%
      collect(),
    by = c("partner_iso" = "country_iso")
  )

d <- d %>%
  group_by(!!sym("country_name")) %>%
  summarise(trade_value_usd_imp = sum(!!sym("trade_value_usd_imp"), na.rm = TRUE), .groups = "drop") %>%
  filter(!!sym("trade_value_usd_imp") > 0) %>%
  mutate(country_name = fct_lump_n(
    f = !!sym("country_name"),
    n = 4,
    w = !!sym("trade_value_usd_imp"),
    other_level = "Rest of the world"
  )) %>%
  group_by(!!sym("country_name")) %>%
  summarise(trade_value_usd_imp = sum(!!sym("trade_value_usd_imp"), na.rm = TRUE), .groups = "drop") %>%
  mutate(color = "#26667f")

d <- d %>%
    filter(!!sym("country_name") == "Rest of the world") %>%
    mutate(n = 5L) %>%
    bind_rows(
        d %>%
            filter(!!sym("country_name") != "Rest of the world") %>%
            arrange(desc(!!sym("trade_value_usd_imp"))) %>%
            mutate(n = row_number())
    ) %>%
    mutate(
        country_name = paste(n, !!sym("country_name"), sep = " - ")
    ) %>%
    select(-n)

d <- d %>% mutate(trade = round(.data$trade_value_usd_imp / 1e9, 2))

d3po(d) %>%
  po_bar(
    daes(
      y = .data$country_name,
      x = .data$trade,
      color = .data$color,
      sort = "asc-y"
    )
  ) %>%
  po_labels(title = "Test sorting", y = "Country", x = "Trade Value (USD Billion)") %>%
  po_format(x = format(.data$trade, big.mark = " ", scientific = FALSE)) %>%
  po_tooltip("{country_name}: {trade} B") %>%
  po_background("transparent")
