#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @import shiny
#' @import shinydashboard
#' @import d3po
#' @importFrom stringr str_to_title str_replace_all
#' @noRd
app_ui <- function(request) {
  tagList(
    # Leave this function for adding external resources
    golem_add_external_resources(),
    # Your application UI logic
    dashboardPage(
      dashboardHeader(title = "D3po demo"),
      dashboardSidebar(
        collapsed = FALSE,
        selectInput(
          inputId = "map",
          label = "Select a continent or country",
          # Get a nested list thanks to this amazing trick taught by Dean Attali https://github.com/daattali/advanced-shiny/tree/master/dropdown-groups
          choices = list(
            "Africa" = str_to_title(str_replace_all(names(d3po::maps$africa)[names(d3po::maps$africa) != "continent"], "_", " ")),
            "Asia" = str_to_title(str_replace_all(names(d3po::maps$asia)[names(d3po::maps$asia) != "continent"], "_", " ")),
            "Europe" = str_to_title(str_replace_all(names(d3po::maps$europe)[names(d3po::maps$europe) != "continent"], "_", " ")),
            "North America" = str_to_title(str_replace_all(names(d3po::maps$north_america)[names(d3po::maps$north_america) != "continent"], "_", " ")),
            "Oceania" = str_to_title(str_replace_all(names(d3po::maps$oceania)[names(d3po::maps$oceania) != "continent"], "_", " ")),
            "South America" = str_to_title(str_replace_all(names(d3po::maps$south_america)[names(d3po::maps$south_america) != "continent"], "_", " ")),
            "Continents" = c("Africa", "Asia", "Europe", "North America", "Oceania", "South America"),
            "World" = "World"
          ),
          selected = "Canada"
        ),
        selectInput(
          inputId = "distribution",
          label = "Select a distribution",
          choices = c("Normal", "Poisson", "Uniform", "Exponential"),
          selected = "Normal"
        ),
        textInput(
          inputId = "seed",
          label = "Seed value",
          value = 42
        )
      ),
      dashboardBody(
        tags$head(tags$style(HTML(".content-wrapper { overflow: auto; }"))),
        col_12(d3po_output("geomap", height = "650px"))
      )
    )
  )
}

#' Add external Resources to the Application
#'
#' This function is internally used to add external
#' resources inside the Shiny application.
#'
#' @import shiny
#' @importFrom golem add_resource_path activate_js favicon bundle_resources
#' @noRd
golem_add_external_resources <- function() {
  add_resource_path(
    "www",
    app_sys("app/www")
  )

  tags$head(
    favicon(),
    bundle_resources(
      path = app_sys("app/www"),
      app_title = "d3podemocovid"
    )
    # Add here other external resources
    # for example, you can add shinyalert::useShinyalert()
  )
}
