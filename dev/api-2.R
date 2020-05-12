library(d3po)

box_data <- tibble::tibble(
  year = rep(c(1991, 1992), 8),
  name = c(
    rep("alpha", 2), rep("alpha2", 2),
    rep("beta", 2), rep("beta2", 2),
    rep("gamma", 2), rep("gamma2", 2),
    rep("delta", 2), rep("delta2", 2)
  ),
  value = c(
    15, 34, 17, 65, 10, 10, 40, 38, 5, 10, 20, 34, 50,
    43, 17, 35
  )
)

d3po(box_data) %>%
  po_box(daes(x = year, y = value, group = name)) %>%
  po_title("TITLE HERE")

# why methods?
# for easy shiny proxies
# DOES NOT WORK: JS ISSUE?
library(shiny)

ui <- fluidPage(
  d3po_output("d3po", height = 400),
  textInput("title", "title")
)

server <- function(input, output) {
  output$d3po <- render_d3po({
    d3po(box_data) %>%
      po_box(daes(x = year, y = value, group = name)) %>%
      po_title("INITIAL HERE")
  })

  observeEvent(input$title, {
    d3po_proxy("d3po") %>%
      po_title(input$title)
  })
}

shinyApp(ui, server)
