load_all()

library(dplyr)
library(sf)
library(ggplot2)

india <- subnational %>%
  filter(country == "India")

india$random <- sample(seq_len(nrow(india)), size = nrow(india), replace = TRUE)

cat('Testing ALL', nrow(india), 'regions\n')

# Now test the map with ALL regions
vis <- d3po(india, width = 800, height = 600) %>%
  po_geomap(daes(group = region_iso, size = random, tooltip = region)) %>%
  po_labels(title = "All India Regions Test")

vis
