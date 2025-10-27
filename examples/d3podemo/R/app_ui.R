#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @noRd
app_ui <- function(request) {
  tagList(
    # Leave this function for adding external resources
    golem_add_external_resources(),
    # Your application UI logic using tabler layout
    page(
      title = "d3po Visualization Examples",
      layout = "horizontal",
      body = body(
        fluidRow(
          column(
            7,
            card(
              title = "D3po demo",
              selectInput("plot_type", "Select Visualization Type:",
                width = "100%",
                choices = list(
                  "Box Plots" = list(
                    "Vertical" = "box1",
                    "Horizontal" = "box2",
                    "Vertical (log scale)" = "box3",
                    "Horizontal (log scale)" = "box4",
                    "Custom labels" = "box_custom",
                    "Custom colors" = "box_custom2"
                  ),
                  "Bar Charts" = list(
                    "Vertical" = "bar1",
                    "Horizontal" = "bar2",
                    "Stacked vertical" = "bar3",
                    "Stacked horizontal" = "bar4",
                    "Vertical sorted ascending by y-axis values" = "bar5",
                    "Vertical sorted descending by y-axis values" = "bar6",
                    "Horizontal sorted ascending by x-axis values" = "bar7",
                    "Horizontal sorted descending by x-axis values" = "bar8",
                    "Custom labels" = "bar_custom"
                  ),
                  "Treemaps" = list(
                    "One-level" = "treemap_onelevel",
                    "Two-level" = "treemap_twolevel",
                    "One-level with custom labels and tooltip" = "treemap_onelevel_custom",
                    "One-level with custom labels and tooltip (extra labels' work)" = "treemap_onelevel_custom2",
                    "Two-level with custom labels and tooltip" = "treemap_twolevel_custom",
                    "Custom fonts and colors" = "treemap_style"
                  ),
                  "Pie" = list(
                    "Full pie" = "pie1",
                    "Donut" = "pie2",
                    "Half pie" = "pie3",
                    "Half donut" = "pie4",
                    "Custom tooltip" = "pie_custom"
                  ),
                  "Line" = list(
                    "Grouped" = "line",
                    "Custom labels and tooltip (identical for area plots)" = "line_area_custom"
                  ),
                  "Area" = list(
                    "Non-stacked" = "area1",
                    "Stacked" = "area2"
                  ),
                  "Scatter" = list(
                    "Unweighted" = "scatter1",
                    "Unweighted, log scale" = "scatter2",
                    "Weighted" = "scatter3",
                    "Weighted, log scale" = "scatter4",
                    "Custom tooltip" = "scatter_custom"
                  ),
                  "Geomaps" = list(
                    "Country-level with custom tooltip" = "geomap1",
                    "Region-level  with custom tooltip" = "geomap2"
                  ),
                  "Network" = list(
                    "KK layout" = "network_kk",
                    "FR layout" = "network_fr",
                    "Manual Layout" = "network_manual",
                    "Custom tooltip" = "network_custom"
                  )
                ),
                selected = "box1"
              ),
              br(),
              d3po::d3po_output("plot", width = "100%", height = "600px")
            )
          ),
          column(
            5,
            card(
              tags$div(
                style = "margin-top: 1rem;",
                tags$h4("Code used to generate the plot"),
                markdown(
                  "For non-modular / non-Golem Shiny apps:
               * You only need the `d3po(data) %>% po_*()` parts.
               * You do not need `function(data)`, `.data$variable` and  `!!sym(\"variable\")`.",
                ),
                verbatimTextOutput("plot_code")
              )
            )
          )
        )
      ),
      footer = footer(
        left = "Created by Mauricio 'Pacha' Vargas Sepulveda",
        right = paste("Last updated:", format(Sys.time(), "%a %b %d %X %Y"))
      )
    )
  )
}

#' Add external Resources to the Application
#'
#' This function is internally used to add external
#' resources inside the Shiny application.
#'
#' @importFrom golem add_resource_path activate_js favicon bundle_resources
#' @noRd
golem_add_external_resources <- function() {
  add_resource_path(
    "www",
    app_sys("app/www")
  )

  tags$head(
    favicon(),
    # Improve selection highlight for verbatim code outputs
    tags$style(HTML(
      ".verbatim, pre.shiny-text-output {
        background-color: #f8f9fa;
        color: black;
        font-family: 'Hack', 'Fira Mono', 'Courier New', monospace;
        padding: 0.75rem;
        border-radius: 4px;
        border: 1px solid #e9ecef;
        overflow: auto;
      }"
    )),
    bundle_resources(
      path = app_sys("app/www"),
      app_title = "d3podemo"
    )
    # Add here other external resources
    # for example, you can add shinyalert::useShinyalert()
  )
}
