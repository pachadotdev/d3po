library(shiny)
library(d3po)

ui <- fluidPage(
  titlePanel("Debug d3po App"),
  sidebarLayout(
    sidebarPanel(
      selectInput("plot_type", "Select Plot:", 
                  choices = c("Box" = "box", "Bar" = "bar")),
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
  pokemon <- d3po::pokemon
  
  plot_obj <- reactive({
    req(input$plot_type)
    
    cat("Creating plot of type:", input$plot_type, "\n")
    
    if (input$plot_type == "box") {
      result <- d3po(pokemon) %>%
        po_box(daes(x = type_1, y = weight, color = color_1)) %>%
        po_labels(title = "Weight Distribution by Type")
    } else {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
                        data = pokemon, FUN = length)
      names(dout) <- c("type", "color", "count")
      
      result <- d3po(dout) %>%
        po_bar(daes(x = type, y = count, color = color)) %>%
        po_labels(title = "Pokemon Count by Type")
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
