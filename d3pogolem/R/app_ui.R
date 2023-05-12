#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @import shiny
#' @import shinydashboard
#' @noRd
app_ui <- function(request) {
  tagList(
    # Leave this function for adding external resources
    golem_add_external_resources(),

    # Your application UI logic
    dashboardPage(
      dashboardHeader(title = "d3po examples in Shiny"),
      dashboardSidebar(),
      dashboardBody(
        box(
          title = "Boxplot",
          d3po_output("boxplot"),
          collapsible = T
        ),
        box(
          title = "Barplot",
          d3po_output("barplot"),
          collapsible = T
        ),
        box(
          title = "Treemap",
          d3po_output("treemap"),
          collapsible = T
        ),
        box(
          title = "Pie",
          d3po_output("pie"),
          collapsible = T
        ),
        box(
          title = "Line",
          d3po_output("line"),
          collapsible = T
        ),
        box(
          title = "Density",
          d3po_output("density"),
          collapsible = T
        ),
        box(
          title = "Scatterplot",
          d3po_output("scatterplot"),
          collapsible = T
        ),
        box(
          title = "Network",
          d3po_output("network"),
          collapsible = T
        )
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
      app_title = "d3pogolem"
    )
    # Add here other external resources
    # for example, you can add shinyalert::useShinyalert()
  )
}
