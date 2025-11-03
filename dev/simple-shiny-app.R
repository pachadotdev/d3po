library(shiny)
library(d3po)
library(dplyr)

ui <- fluidPage(
  titlePanel("Debug d3po App"),
  sidebarLayout(
    sidebarPanel(
      selectInput("plot_type", "Select Plot:", 
                  choices = c("Bar" = "bar", "Treemap" = "treemap")),
      hr(),
      verbatimTextOutput("debug_info")
    ),
    mainPanel(
      h3("Plot Output:"),
      d3po_output("plot", width = "100%", height = "600px"),
      hr(),
      h3("Raw HTML Widget:"),
      verbatimTextOutput("widget_info")
    )
  )
)

server <- function(input, output, session) {
  trade <- d3po::trade
  
  plot_obj <- reactive({
    req(input$plot_type)
    
    cat("Creating plot of type:", input$plot_type, "\n")
    
    trade2 <- trade %>%
        filter(reporter_iso == "GBR") %>%
        arrange(desc(trade)) %>%
        mutate(
          partner = case_when(
            row_number() > 4 ~ "Rest of the World",
            TRUE ~ partner
          )
        ) %>%
        group_by(reporter, partner) %>%
        summarise(trade = sum(trade), .groups = "drop")

    if (input$plot_type == "bar") {
      result <- d3po(trade2) %>%
        po_bar(daes(x = partner, y = trade)) %>%
        po_labels(title = "United Kingdom Trade Partners (2023)")
    } else {
      result <- d3po(trade2) %>%
        po_treemap(daes(group = partner, size = trade)) %>%
        po_labels(title = "United Kingdom Trade Partners (2023)")
    }
    
    cat("Plot created successfully\n")
    cat("- Class:", class(result), "\n")
    cat("- Type:", result$x$type, "\n")
    
    return(result)
  })
  
  output$plot <- render_d3po({
    plot_obj()
  })
  
  output$debug_info <- renderPrint({
    req(input$plot_type)
    p <- plot_obj()
    cat("Plot Type:", input$plot_type, "\n")
    cat("Widget Class:", class(p), "\n")
    cat("Data Type:", p$x$type, "\n")
    cat("Data Rows:", nrow(p$x$data), "\n")
    cat("X:", p$x$x, "\n")
    cat("Y:", p$x$y, "\n")
  })
  
  output$widget_info <- renderPrint({
    p <- plot_obj()
    str(p, max.level = 2)
  })
}

shinyApp(ui, server)
