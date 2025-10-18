# I lost the original script :(

load_all()

library(dplyr)

pokemon <- pokemon %>%
    mutate_if(is.character, stringr::str_to_title) %>%
    mutate_if(is.factor, stringr::str_to_title)
    
pokemon <- pokemon %>%
    mutate(
        type_1 = as.factor(type_1),
        type_2 = as.factor(type_2),
        color_1 = as.factor(color_1),
        color_2 = as.factor(color_2)
    )

use_data(pokemon, overwrite = TRUE, compress = "xz")
