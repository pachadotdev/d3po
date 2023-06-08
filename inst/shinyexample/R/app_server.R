#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import d3po
#' @import freedom
#' @importFrom rlang sym
#' @importFrom stringr str_to_lower str_replace_all
#' @importFrom dplyr filter pull select inner_join bind_rows summarise group_by
#' @noRd
app_server <- function(input, output, session) {
  selected_country <- reactive({
    input$country
  })

  selected_question <- reactive({
    input$question
  })

  question_tbl <- reactive({
    daux <- freedom::category_scores %>%
      filter(
        !!sym("country_territory") == selected_country(),
        !!sym("sub_item") == selected_question(),
        !is.na(!!sym("score"))
      ) %>%
      select(!!sym("year"), !!sym("country_territory"), !!sym("score")) %>%
      inner_join(
        freedom::country_rating_statuses %>%
          select(!!sym("year"), !!sym("country"), !!sym("status"), !!sym("color")),
        by = c("year", "country_territory" = "country")
      ) %>%
      bind_rows(
        freedom::category_scores %>%
          filter(
            !!sym("sub_item") == selected_question(),
            !is.na(!!sym("score"))
          ) %>%
          group_by(!!sym("year")) %>%
          summarise(
            country_territory = "World Average",
            color = "#385e8a",
            score = mean(!!sym("score"), na.rm = TRUE)
          )
      )

    yrs <- range(daux$year, na.rm = TRUE)

    daux <- daux %>%
      filter(!!sym("year") %in% seq(yrs[1], yrs[2], 2))

    return(daux)
  })

  output$question_plot <- render_d3po({
    d3po(question_tbl()) %>%
      po_bar(
        daes(x = !!sym("year"),
             y = !!sym("score"),
             # group = !!sym("status"),
             group = !!sym("country_territory"),
             color = !!sym("color"))
      ) %>%
      po_title(paste(selected_country(), " vs World Average"))
  })
}
