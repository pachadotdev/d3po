#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import d3po
#' @importFrom rlang sym
#' @importFrom stringr str_to_lower str_replace_all
#' @importFrom stats rnorm rpois runif rexp
#' @noRd
app_server <- function(input, output, session) {
  # selected_map <- function() { "Asia" }
  selected_map <- reactive({
    as.character(input$map)
  })

  # selected_distribution <- function() { "Poisson" }
  selected_distribution <- reactive({
    as.character(input$distribution)
  })

  # selected_poisson_parameter <- function() { 5L }
  selected_poisson_parameter <- reactive({
    as.integer(input$poisson_parameter)
  })

  # selected_seed <- function() { 42L }
  selected_seed <- reactive({
    as.integer(input$seed)
  })

  # map_topojson <- function() {  d3po::maps$asia$continent }
  map_topojson <- reactive({
    # Pro tip: use the pipe for clarity
    map_imp <- selected_map() %>%
      str_to_lower() %>%
      str_replace_all(" ", "_")

    maps <- d3po::maps

    # Create a data frame with all the countries in maps and their continent
    # Visually this is not the best, but it works
    daux <- data.frame(
      country = c(
        names(maps$africa)[names(maps$africa) != "continent"],
        names(maps$asia)[names(maps$asia) != "continent"],
        names(maps$europe)[names(maps$europe) != "continent"],
        names(maps$north_america)[names(maps$north_america) != "continent"],
        names(maps$oceania)[names(maps$oceania) != "continent"],
        names(maps$south_america)[names(maps$south_america) != "continent"]
      ),
      continent = c(
        rep("africa", length(names(maps$africa)[names(maps$africa) != "continent"])),
        rep("asia", length(names(maps$asia)[names(maps$asia) != "continent"])),
        rep("europe", length(names(maps$europe)[names(maps$europe) != "continent"])),
        rep("north_america", length(names(maps$north_america)[names(maps$north_america) != "continent"])),
        rep("oceania", length(names(maps$oceania)[names(maps$oceania) != "continent"])),
        rep("south_america", length(names(maps$south_america)[names(maps$south_america) != "continent"]))
      )
    )

    if (map_imp %in% c("africa", "asia", "europe", "north_america", "oceania", "south_america")) {
      out <- maps[[map_imp]][["continent"]]
    } else if (map_imp == "world") {
      out <- maps$world
    } else {
      out <- maps[[daux[daux$country == map_imp, "continent"]]][[map_imp]]
    }

    return(out)
  })

  random_data <- reactive({
    # for each geometry, get the id
    out <- map_ids(map_topojson())

    len <- length(out$id)

    set.seed(selected_seed())

    out$value <- switch(selected_distribution(),
      "Normal" = rnorm(len, 0, 1),
      "Poisson" = rpois(len, selected_poisson_parameter()),
      "Uniform" = runif(len),
      "Exponential" = rexp(len)
    )

    return(out)
  })

  output$geomap <- render_d3po({
    d3po(random_data()) %>%
      po_geomap(
        daes(group = !!sym("id"), color = !!sym("value")),
        map = map_topojson()
      ) %>%
      po_title(sprintf("Map of %s with random values", selected_map()))
  })
}
