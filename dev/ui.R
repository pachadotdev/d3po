dashboardPage(
    dashboardHeader(title = "d3po examples in Shiny"),
    dashboardSidebar(),
    dashboardBody(
        box(
            title = "Boxplot",
            d3po_output("boxplot"),
            collapsible = T
        ),
        
        box(
            title = "Barplot",
            d3po_output("barplot"),
            collapsible = T
        ),
        
        box(
            title = "Treemap",
            d3po_output("treemap"),
            collapsible = T
        ),
        
        box(
            title = "Pie",
            d3po_output("pie"),
            collapsible = T
        ),
        
        box(
            title = "Line",
            d3po_output("line"),
            collapsible = T
        ),
        
        box(
            title = "Density",
            d3po_output("density"),
            collapsible = T
        ),
        
        box(
            title = "Scatterplot",
            d3po_output("scatterplot"),
            collapsible = T
        ),
        
        box(
            title = "Network",
            d3po_output("network"),
            collapsible = T
        )
    )
)
