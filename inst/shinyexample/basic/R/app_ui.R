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
          inputId = "type",
          label = "Select a Pokemon type",
          choices = list_types(), # see golem_utils_ui.R
          selected = "water"
        )
      ),
      dashboardBody(
        tags$head(tags$style(HTML(".content-wrapper { overflow: auto; }"))),
        col_12(d3po_output("type_bar", height = "650px"))
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
      app_title = "d3pobasicdemo"
    )
    # Add here other external resources
    # for example, you can add shinyalert::useShinyalert()
  )
}
