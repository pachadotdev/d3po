load_all()

library(dplyr)
library(sf)
library(ggplot2)

india <- subnational %>%
  filter(country == "India")

india$random <- sample(seq_len(nrow(india)), size = nrow(india), replace = TRUE)

cat('Testing ALL', nrow(india), 'regions\n')

vis <- d3po(india, width = 800, height = 600) %>%
  po_geomap(daes(group = region_iso, size = random, tooltip = region)) %>%
  po_labels(title = "All India Regions Test")

vis

# minus Andaman and Nicobar
india2  <- india %>%
  filter(!region_iso %in% "IN-AN")

vis <- d3po(india2, width = 800, height = 600) %>%
  po_geomap(daes(group = region_iso, size = random, gradient = T, tooltip = region)) %>%
  po_labels(title = "India Regions minus Andaman and Nicobar Test")

vis
