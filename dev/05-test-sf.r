load_all()

library(dplyr)
library(sf)

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

# htmlwidgets::saveWidget(vis, "dev/test-sf.html", selfcontained = F)

