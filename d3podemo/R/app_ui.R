#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @import shiny
#' @noRd
app_ui <- function(request) {
  tagList(
    # Leave this function for adding external resources
    golem_add_external_resources(),
    # Your application UI logic
    fluidPage(
      titlePanel("d3po Visualization Examples"),
      sidebarLayout(
        sidebarPanel(
          selectInput("plot_type", "Select Visualization Type:",
            choices = c(
              "Box Plot (Weight by Type)" = "box1",
              "Box Plot (Height by Type)" = "box2",
              "Bar Chart (Vertical)" = "bar1",
              "Bar Chart (Horizontal)" = "bar2",
              "Treemap (Squarify)" = "treemap1",
			  "Treemap (Binary)" = "treemap2",
			  "Treemap (Slice)" = "treemap3",
			  "Treemap (Dice)" = "treemap4",
			  "Treemap (Custom Aesthetics)" = "treemap5",
              "Pie Chart" = "pie",
              "Donut Chart" = "donut",
              "Line Chart" = "line",
              "Area Chart" = "area",
              "Scatter Plot" = "scatter1",
              "Scatter Plot (Log Scale)" = "scatter2",
              "Scatter Plot (Weighted)" = "scatter3",
              "Scatter Plot (Weighted, Log Scale)" = "scatter4",
              "Geomap (Chile)" = "geomap",
              "Network Graph" = "network"
            ),
            selected = "box1"
          ),
          width = 3
        ),
        mainPanel(
          d3po::d3po_output("plot", width = "100%", height = "600px"),
          width = 9
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
      app_title = "d3podemo"
    )
    # Add here other external resources
    # for example, you can add shinyalert::useShinyalert()
  )
}
