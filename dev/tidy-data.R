# Based on
# https://martakolczynska.com/post/cleaning-fh-data/
# https://freedomhouse.org/report/freedom-world/

library(dplyr)
library(tidyr)
library(readxl)
library(countrycode)
library(stringr)
library(igraph)
library(RPostgres)
library(economiccomplexity)

url <- "https://freedomhouse.org/sites/default/files/2023-02/Country_and_Territory_Ratings_and_Statuses_FIW_1973-2023%20.xlsx"
raw_xlsx <- gsub("%20", "", gsub(".*/", "dev/", url))

if (!file.exists(raw_xlsx)) {
  download.file(url, raw_xlsx)
}

freedom_house <- read_excel(raw_xlsx,
  sheet = 2, # read in data from the second sheet
  na = "-"
) # recode "-" to missing

names(freedom_house)[1] <- "country"

freedom_house

# filter out the first and second row of data
freedom_house <- freedom_house %>%
  filter(
    country != "Year(s) Under Review",
    !is.na(country)
  )

freedom_house

# convert the whole data set to long format
freedom_house <- freedom_house %>%
  pivot_longer(cols = 2:151, names_to = "year", values_to = "value")

freedom_house

# obtain the year by removing all non-numeric characters in year
freedom_house <- freedom_house %>%
  mutate(
    year = as.integer(gsub("[^0-9]", "", year)) - 1L,
    year = case_when(
      year < 1973 ~ NA_integer_,
      TRUE ~ year
    )
  )

freedom_house

# replace year = NA
freedom_house <- freedom_house %>%
  fill(year)

freedom_house

# add measurement categories
freedom_house <- freedom_house %>%
  group_by(country, year) %>%
  mutate(
    n = row_number(),
    category = case_when(
        n == 1 ~ "political_rights",
        n == 2 ~ "civil_liberties",
        n == 3 ~ "status"
    )
  ) %>% 
  ungroup()

freedom_house

# put in tidy format
freedom_house <- freedom_house %>%
  select(-n) %>% 
  pivot_wider(names_from = category, values_from = value)

freedom_house

# convert political rights and civil liberties to integer
remove_parenthesis <- function(x) {
  y <- str_extract(x, "\\((.*?)\\)")
  y <- str_replace_all(y, "\\(|\\)", "")
  return(y)
}

freedom_house <- freedom_house %>%
  mutate(
    political_rights = case_when(
      country == "South Africa" & year == 1973 ~ remove_parenthesis(political_rights),
      TRUE ~ political_rights
    ),
    civil_liberties = case_when(
      country == "South Africa" & year == 1973 ~ remove_parenthesis(civil_liberties),
      TRUE ~ civil_liberties
    ),
    status = case_when(
      country == "South Africa" & year == 1973 ~ remove_parenthesis(status),
      TRUE ~ status
    ),

    political_rights = as.integer(political_rights),
    civil_liberties = as.integer(civil_liberties)
  )

freedom_house %>%
  filter(country == "South Africa", year == 1973)

freedom_house

# recode the status
freedom_house <- freedom_house %>%
  mutate(
    status = factor(
      case_when(
        status == "PF" ~ "Partially Free",
        status == "NF" ~ "Not Free",
        status == "F" ~ "Free"
      ),
      levels = c("Free", "Partially Free", "Not Free"),
    )
  )

freedom_house

# some verifications

freedom_house %>%
  filter(is.na(country))

freedom_house %>%
  filter(is.na(year))

freedom_house %>%
  filter(is.na(political_rights))

# fix the year variable as some years are in the format "1983-84"
freedom_house <- freedom_house %>% 
  mutate(
    year = case_when(
      nchar(year) > 4 ~ as.integer(substr(year, 1, 4)),
      TRUE ~ year
    )
  )

freedom_house %>%
  filter(is.na(political_rights))

# discard country-year combinations with missing values
freedom_house <- freedom_house %>% 
  drop_na(political_rights, civil_liberties, status)

# almost there, now add ISO-2 and ISO-3 codes
countries <- freedom_house %>% 
  ungroup() %>%
  distinct(country) %>%
  mutate(
    iso2c = countrycode(
      country,
      origin = "country.name",
      destination = "iso2c"
    ),
    iso3c = countrycode(
      country,
      origin = "country.name",
      destination = "iso3c"
    )
  )

# countries without unambiguous matches
countries %>% 
  filter(is.na(iso2c))

# add continent
countries <- countries %>%
  mutate(
    continent = countrycode(
      iso3c,
      origin = "iso3c",
      destination = "continent"
    )
  )

# fix missing continents
countries %>%
  filter(is.na(continent))

countries <- countries %>%
  mutate(
    continent = case_when(
      country == "Czechoslovakia" ~ "Europe",
      country == "Kosovo" ~ "Europe",
      country == "Micronesia" ~ "Oceania",
      country == "Serbia and Montenegro" ~ "Europe",
      country == "Yugoslavia" ~ "Europe",
      TRUE ~ continent
    )
  )

# join the two data sets
freedom_house <- freedom_house %>%
  left_join(countries, by = "country") %>% 
  select(year, country, iso2c, iso3c, continent, political_rights, civil_liberties, status)

# add colours
freedom_house <- freedom_house %>%
  mutate(
    color = case_when(
      status == "Free" ~ "#549f95",
      status == "Partially Free" ~ "#a1aafc",
      status == "Not Free" ~ "#7454a6"
    )
  )

# save
use_data(freedom_house, overwrite = TRUE)

con <- dbConnect(
    Postgres(),
    host = "localhost",
    dbname = "uncomtrade",
    user = Sys.getenv("LOCAL_SQL_USR"),
    password = Sys.getenv("LOCAL_SQL_PWD")
  )

trade <- tbl(con, "hs_rev1992_tf_import_al_6") %>%
  filter(year == 2020) %>%
  mutate(commodity_code = substr(commodity_code, 1, 4)) %>%
  filter(partner_iso != "wld") %>%
  filter(partner_iso != "0-unspecified") %>%
  filter(reporter_iso != "0-unspecified") %>%
  group_by(partner_iso, commodity_code) %>%
  summarise(
    trade = sum(trade_value_usd, na.rm = TRUE)
  ) %>%
  collect()

dbDisconnect(con)

saveRDS(trade, "dev/trade.rds")

# trade <- readRDS("dev/trade.rds")

trade <- trade %>%
  mutate(
    partner_iso = toupper(partner_iso)
  )

trade <- trade %>%
  filter(trade > 0)

trade <- trade %>%
  rename(country = partner_iso, product = commodity_code, value = trade)

trade_aux <- freedom_house %>%
  filter(year == 2023) %>%
  distinct(country, iso2c, iso3c) %>%
  inner_join(
    trade %>%
      distinct(country), by = c("iso3c" = "country")) %>%
  inner_join(
    trade %>%
      distinct(country), by = c("iso3c" = "country"))

trade <- trade %>%
  inner_join(trade_aux, by = c("country" = "iso3c")) %>%
  select(country = country.y, product, value)

bi <- balassa_index(trade)

pro <- proximity(bi)

net <- projections(pro$proximity_country, pro$proximity_product)

freedom_house_network <- net$network_country

trade <- trade %>%
  group_by(country) %>%
  summarise(value = sum(value, na.rm = TRUE))
trade_size <- trade$value
names(trade_size) <- trade$country
trade_size <- trade_size[V(freedom_house_network)$name]
V(freedom_house_network)$exports <- unname(trade_size)

trade_color <- tibble(country = trade$country) %>%
  left_join(
    freedom_house %>% 
      filter(year == 2023) %>%
      select(country, color), 
    by = "country")
trade_color_2 <- trade_color$color
names(trade_color_2) <- trade_color$country
trade_color_2 <- trade_color_2[V(freedom_house_network)$name]
V(freedom_house_network)$color <- unname(trade_color_2)

V(freedom_house_network)$status <- ifelse(V(freedom_house_network)$color == "#549f95", "Free", 
  ifelse(V(freedom_house_network)$color == "#a1aafc", "Partially Free", "Not Free"))

use_data(freedom_house_network, overwrite = TRUE)
