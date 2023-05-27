#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @import shiny
#' @import shinydashboard
#' @importFrom d3po d3po_output
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
          choices = list_maps(), # see golem_utils_ui.R
          selected = "Canada"
        ),
        selectInput(
          inputId = "distribution",
          label = "Select a distribution",
          choices = c("Normal", "Poisson", "Uniform", "Exponential"),
          selected = "Normal"
        ),
        sliderInput(
          inputId = "poisson_parameter",
          label = "Select a Poisson parameter",
          min = 1L,
          max = 10L,
          step = 1L,
          value = 5L
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
