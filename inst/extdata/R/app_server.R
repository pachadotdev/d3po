#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import d3po
#' @importFrom rlang sym
#' @importFrom stringr str_to_lower str_replace_all
#' @noRd
app_server <- function(input, output, session) {
  selected_map <- reactive({
    as.character(input$map)
  })

  selected_distribution <- reactive({
    as.character(input$distribution)
  })

  selected_seed <- reactive({
    as.integer(input$seed)
  })

  map_topojson <- reactive({
    # Pro tip: use the pipe for clarity
    map_imp <- selected_map() %>%
      str_to_lower() %>%
      str_replace_all(" ", "_")

    # Create a data frame with all the countries in d3po::maps and their continent
    # Visually this is not the best, but it works
    daux <- data.frame(
      country = c(
        names(d3po::maps$africa)[names(d3po::maps$africa) != "continent"],
        names(d3po::maps$asia)[names(d3po::maps$asia) != "continent"],
        names(d3po::maps$europe)[names(d3po::maps$europe) != "continent"],
        names(d3po::maps$north_america)[names(d3po::maps$north_america) != "continent"],
        names(d3po::maps$oceania)[names(d3po::maps$oceania) != "continent"],
        names(d3po::maps$south_america)[names(d3po::maps$south_america) != "continent"]
      ),
      continent = c(
        rep("africa", length(names(d3po::maps$africa)[names(d3po::maps$africa) != "continent"])),
        rep("asia", length(names(d3po::maps$asia)[names(d3po::maps$asia) != "continent"])),
        rep("europe", length(names(d3po::maps$europe)[names(d3po::maps$europe) != "continent"])),
        rep("north_america", length(names(d3po::maps$north_america)[names(d3po::maps$north_america) != "continent"])),
        rep("oceania", length(names(d3po::maps$oceania)[names(d3po::maps$oceania) != "continent"])),
        rep("south_america", length(names(d3po::maps$south_america)[names(d3po::maps$south_america) != "continent"]))
      )
    )

    if (map_imp %in% c("africa", "asia", "europe", "north_america", "oceania", "south_america")) {
      out <- d3po::maps[[map_imp]][["continent"]]
    } else if (map_imp == "world") {
      out <- d3po::maps$world
    } else {
      out <- d3po::maps[[daux[daux$country == map_imp, "continent"]]][[map_imp]]
    }

    return(out)
  })

  random_data <- reactive({
    # for each geometry, get the id
    ids <- c()
    i <- length(ids)
    for (i in seq_along(map_topojson()$objects$default$geometries)) {
      ids[i] <- map_topojson()$objects$default$geometries[[i]]$id
      i <- i + 1
    }

    len <- length(ids)

    set.seed(selected_seed())
    daux <- switch(
      selected_distribution(),
      "Normal" = rnorm(len, 0, 1),
      "Poisson" = rpois(len, 5),
      "Uniform" = runif(len),
      "Exponential" = rexp(len)
    )

    out <- data.frame(
      id = ids,
      value = daux
    )

    return(out)
  })

  output$geomap <- render_d3po({
    d3po(random_data()) %>%
      po_geomap(
        daes(
          group = !!sym("id"),
          color = !!sym("value")
        ),
        map = map_topojson(),
      ) %>%
      po_title(sprintf("Map of %s with random values", selected_map()))
  })
}
