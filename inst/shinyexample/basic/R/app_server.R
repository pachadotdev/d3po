#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import d3po
#' @importFrom rlang sym
#' @importFrom stringr str_to_lower str_replace_all
#' @importFrom dplyr filter group_by count ungroup mutate case_when
#' @noRd
app_server <- function(input, output, session) {
  selected_type <- reactive({
    input$type
  })

  selected_question <- reactive({
    input$question
  })

  type_tbl <- reactive({
    out <- d3po::pokemon %>%
      filter(!!sym("type_1") == selected_type())

    return(out)
  })

  output$type_bar <- render_d3po({
    inp <- type_tbl() %>%
      group_by(!!sym("type_2"), !!sym("color_2")) %>%
      count() %>%
      ungroup() %>%
      mutate(
        type_2 = case_when(
          is.na(!!sym("type_2")) ~ "None",
          TRUE ~ !!sym("type_2")
        ),
        color_2 = case_when(
          is.na(!!sym("color_2")) ~ "#d3d3d3",
          TRUE ~ !!sym("color_2")
        )
      )

    out <- d3po(inp) %>%
      po_bar(
        daes(
          x = !!sym("type_2"),
          y = !!sym("n"),
          group = !!sym("type_2"),
          color = !!sym("color_2")
        )
      ) %>%
      po_title(paste("Sub-types for", selected_type(), "type"))
  })
}
