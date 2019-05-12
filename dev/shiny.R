library(shiny)
library(dplyr)
library(d3plus)

ui <- fluidPage(
  
  titlePanel("Hello Shiny!"),
  
  sidebarLayout(
    
    sidebarPanel(
      h1("Testing resize")
    ),
    
    mainPanel(
      div(
        d3plusOutput("treemap")
      )
    )
  )
)

server <- function(input, output) {
  dta <- tibble(
    parent = c(rep("Group 1", 3), rep("Group 2", 2)),
    id = c("alpha", "beta", "gamma", "delta", "eta"),
    value = c(29, 10, 2, 29, 25),
    icon = c(rep("https://datausa.io/static/img/attrs/thing_apple.png", 3),
             rep("https://datausa.io/static/img/attrs/thing_fish.png", 2))
  )
  
  output$treemap <- renderD3plus({
    d3plus() %>%
      d3p_type("tree_map") %>%
      d3p_data(data = dta, size = "value") %>%
      d3p_id(c("parent", "id")) %>% 
      d3p_color("parent") %>% 
      d3p_labels(align = "left", valign = "top") %>% 
      d3p_icon(style = "knockout", value = "icon") %>% 
      d3p_legend(size = 30) %>% 
      d3p_depth(1)
  })
}

shinyApp(ui, server)
