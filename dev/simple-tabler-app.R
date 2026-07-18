library(tabler)
library(d3po)

ui <- page(
  theme = "light",
  color = "teal",
  title = "Debug d3po App",
  layout = "combo",
  show_theme_button = FALSE,
  body = list(
    # Page header
    header(
      title = "Debug d3po App",
      subtitle = "Overview"
    ),
    # Page body content
    body(
      div(
        class = "row",
        # Left column: controls ----
        column(
          4,
          card(
            title = "Controls",
            selectInput(
              "plot_type", "Select Plot:",
              choices = c("Bar" = "bar", "Treemap" = "treemap")
            ),
            verbatimTextOutput("debug_info")
          )
        ),
        # Right column: outputs ----
        column(
          8,
          card(
            title = "Plot Output",
            d3po_output("plot", width = "100%", height = "600px")
          ),
          card(
            title = "Raw HTML Widget",
            verbatimTextOutput("widget_info")
          )
        )
      )
    )
  ),
  footer = footer(
    left = "Tabler",
    right = tags$span("v1.4.0")
  )
)

server <- function(input, output, session) {
  trade <- d3po::trade
  
  plot_obj <- reactive({
    req(input$plot_type)
    
    cat("Creating plot of type:", input$plot_type, "\n")
    
    trade2 <- trade[trade$reporter_iso == "GBR", ]
    trade2 <- trade2[order(-trade2$trade), ]
    trade2$partner <- as.character(trade2$partner)
    trade2$partner <- ifelse(
      seq_len(nrow(trade2)) > 4,
      "Rest of the World",
      trade2$partner
    )
    trade2 <- aggregate(
      trade ~ reporter + partner,
      data = trade2,
      FUN = sum
    )

    if (input$plot_type == "bar") {
      result <- d3po(trade2) |>
        po_bar(daes(x = partner, y = trade)) |>
        po_labels(title = "United Kingdom Trade Partners (2023)")
    } else {
      result <- d3po(trade2) |>
        po_treemap(daes(group = partner, size = trade)) |>
        po_labels(title = "United Kingdom Trade Partners (2023)")
    }
    
    cat("Plot created successfully\n")
    cat("- Class:", class(result), "\n")
    cat("- Type:", result$x$type, "\n")
    
    return(result)
  })
  
  output$plot <- renderWidget({
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

tablerApp(ui, server)
