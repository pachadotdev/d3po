#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @import shiny
#' @import tabler
#' @noRd
app_ui <- function(request) {
  tagList(
    # Leave this function for adding external resources
    golem_add_external_resources(),
    # Your application UI logic using tabler layout
    tablerPage(
      title = "d3po Visualization Examples",
      layout = "horizontal",
      body = tablerBody(
        tablerCard(
          title = "D3po demo",
          selectInput("plot_type", "Select Visualization Type:",
            choices = c(
              "Box Plot (Weight by Type)" = "box1",
              "Box Plot (Height by Type)" = "box2",
              "Box Plot (Weight by Type) - Custom Labels/Units" = "box_custom1",
              "Box Plot (Height by Type) - Custom Labels/Units" = "box_custom2",
              "Bar Chart (Vertical)" = "bar1",
              "Bar Chart (Horizontal)" = "bar2",
              "Bar Chart (Custom Labels/Units) - Vertical" = "bar_custom1",
              "Bar Chart (Custom Labels/Units) - Horizontal" = "bar_custom2",
              "Treemap (Squarify)" = "treemap1",
              "Treemap (Binary)" = "treemap2",
              "Treemap (Slice)" = "treemap3",
              "Treemap (Dice)" = "treemap4",
              "Treemap Style Example (Labels/Background/Font/No Download)" = "treemap_style",
              "Pie Chart" = "pie",
              "Donut Chart" = "donut",
              "Pie (Custom Labels & Tooltip)" = "pie_custom",
              "Line Chart" = "line",
              "Area Chart" = "area",
              "Line/Area (Custom Labels & Tooltip)" = "line_area_custom",
              "Scatter Plot" = "scatter1",
              "Scatter Plot (Log Scale)" = "scatter2",
              "Scatter Plot (Weighted)" = "scatter3",
              "Scatter Plot (Weighted, Log Scale)" = "scatter4",
              "Scatter Plot (Custom Tooltip)" = "scatter_custom",
              "Geomap (South America)" = "geomap1",
              "Geomap (Chile)" = "geomap2",
              "Geomap (Custom Tooltip) - South America" = "geomap_custom",
              "Network Graph (KK Layout)" = "network_kk",
              "Network Graph (FR Layout)" = "network_fr",
              "Network Graph (Manual Layout)" = "network_manual",
              "Network Graph (Custom Tooltip)" = "network_custom"
            ),
            selected = "box1"
          ),
          d3po::d3po_output("plot", width = "100%", height = "600px")
        )
      ),
      footer = tablerFooter(left = "", right = "d3po demo")
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
