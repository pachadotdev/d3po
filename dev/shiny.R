library(shiny)
library(dplyr)
library(d3po)

ui <- fluidPage(
  titlePanel("Testing Shiny and d3po"),

  sidebarLayout(
    sidebarPanel(
      p("The examples here are fully tailored to show all the functions within the package.
        You can obtain similar results with much simpler code."),
      p("Included examples:"),
      HTML(
        "<ul>
           <li>Bar</li>
           <li>Box and whiskers</li>
           <li>Bubbles</li>
           <li>Geomap</li>
           <li>Line</li>
           <li>Network</li>
           <li>Pie</li>
           <li>Radar</li>
           <li>Rings</li>
           <li>Sankey (WIP)</li>
           <li>Scatterplot</li>
           <li>Stacked</li>
           <li>Treemap</li>
        </ul>"
      )
    ),

    mainPanel(
      h1("Bar"),
      d3po_output("bar", height = "400px"),

      h1("Box and whiskers"),
      d3po_output("box", height = "400px"),

      h1("Bubbles"),
      d3po_output("bubbles", height = "400px"),

      h1("Geomap"),
      d3po_output("geomap", height = "400px"),

      h1("Line"),
      d3po_output("line", height = "400px"),

      h1("Network"),
      d3po_output("network", height = "400px"),

      h1("Pie"),
      d3po_output("pie", height = "400px"),

      h1("Radar"),
      d3po_output("radar", height = "400px"),

      h1("Rings"),
      d3po_output("rings", height = "400px"),

      h1("Sankey"),
      d3po_output("sankey", height = "400px"),

      h1("Scatterplot"),
      d3po_output("scatterplot", height = "400px"),

      h1("Stacked"),
      d3po_output("stacked", height = "400px"),

      h1("Treemap"),
      d3po_output("treemap", height = "400px")
    )
  )
)

server <- function(input, output) {
  # Data ----

  bar_data <- tibble(
    id = c(rep("alpha", 3), "beta"),
    ab1 = letters[1:4],
    ab2 = c(1, 2, 5, -1)
  )

  box_data <- tibble(
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

  bubbles_data <- tibble(
    value = c(100, 70, 40, 15, 5, 1),
    name = c("alpha", "beta", "gamma", "delta", "epsilon", "zeta"),
    group = c("group 1", rep("group 2", 3), rep("group 1", 2))
  )

  geomap_data <- tibble(
    value = c(2315987123, 38157121349, 21891735098, 9807134982),
    country = c("nausa", "aschn", "euesp", "sabra"),
    name = c("United States", "China", "Spain", "Brazil")
  )

  line_data <- tibble(
    id = "alpha",
    ab1 = c(0, -1, 1, 0),
    ab2 = c(1, 2, 5, 0)
  )

  network_data <- tibble(
    name = c("alpha", "beta", "gamma", "theta", "zeta", "epsilon"),
    val = c(10, 20, 30, 30, 20, 10)
  )

  network_edges <- tibble(
    source = c("alpha", "alpha", "theta", "theta", "epsilon"),
    target = c("beta", "gamma", "zeta", "epsilon", "alpha")
  )

  network_nodes <- tibble(
    name = c("alpha", "beta", "gamma", "theta", "zeta", "epsilon"),
    x = c(1, 2, 1, 3, 2.5, 2),
    y = c(1, 1, 2, 2, 1.5, 2)
  )

  pie_data <- tibble(
    parent = c(rep("Group 1", 3), rep("Group 2", 2)),
    id = c("alpha", "beta", "gamma", "delta", "eta"),
    value = c(29, 10, 2, 29, 25),
    icon = c(
      rep("https://datausa.io/static/img/attrs/thing_apple.png", 3),
      rep("https://datausa.io/static/img/attrs/thing_fish.png", 2)
    )
  )

  radar_data <- tibble(
    name = c(rep("alpha", 3), rep("beta", 3)),
    skill = rep(c("power", "courage", "wisdom"), 2),
    value = c(4, 8, 2, 5, 4, 6),
    color = c(rep("firebrick", 3), rep("cornflowerblue", 3))
  )

  rings_edges <- tibble(
    source = c(rep("alpha", 2), rep("beta", 2), "zeta", "theta", "eta"),
    target = c("beta", "gamma", "delta", "epsilon", rep("gamma", 3))
  )

  sankey_data <- tibble(
    id = c("alpha", "beta", "gamma"),
    color = c("firebrick", "cornflowerblue", "khaki"),
    val = c(100, 200, 300)
  )

  sankey_edges <- tibble(
    strength = c(2, 1, 1, 3),
    source = c(0, 1, 2, 2),
    target = c(2, 2, 0, 1)
  )

  sankey_nodes <- tibble(
    id = c("alpha", "beta", "gamma")
  )

  scatterplot_data <- tibble(
    value = c(100, 70, 40, 15),
    weigth = c(.45, .6, -.2, .1),
    type = c("alpha", "beta", "gamma", "delta"),
    color = c("firebrick", "cornflowerblue", "khaki", "cadetblue")
  )

  stacked_data <- tibble(
    id = c(rep("alpha", 3), rep("beta", 3)),
    ab1 = c(4, 5, 6, 4, 5, 6),
    ab2 = c(7, 25, 13, 17, 8, 13),
    color = c(rep("cornflowerblue", 3), rep("firebrick", 3))
  )

  treemap_data <- tibble(
    parent = c(rep("Group 1", 3), rep("Group 2", 2)),
    id = c("alpha", "beta", "gamma", "delta", "eta"),
    value = c(29, 10, 2, 29, 25),
    icon = c(
      rep("https://datausa.io/static/images/attrs/thing_apple.png", 3),
      rep("https://datausa.io/static/images/attrs/thing_fish.png", 2)
    ),
    color = c(rep("cornflowerblue", 3), rep("firebrick", 2))
  )

  # Output ----

  output$bar <- render_d3po({
    d3po() %>%
      d3po_type("bar") %>%
      d3po_data(data = bar_data) %>%
      d3po_id("id") %>%
      d3po_axis(x = "ab1", y = "ab2") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$box <- render_d3po({
    d3po() %>%
      d3po_type("box") %>%
      d3po_data(data = box_data) %>%
      d3po_id("name") %>%
      d3po_axis(x = "year", y = "value") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle"
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$bubbles <- render_d3po({
    d3po() %>%
      d3po_type("bubbles") %>%
      d3po_data(data = bubbles_data, size = "value") %>%
      d3po_id(c("group", "name")) %>%
      d3po_depth(1) %>%
      d3po_color("group") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$geomap <- render_d3po({
    d3po() %>%
      d3po_type("geo_map") %>%
      d3po_data(
        data = geomap_data,
        coords = "http://d3po.org/topojson/countries.json",
        text = "name"
      ) %>%
      d3po_id("country") %>%
      d3po_color("value") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$line <- render_d3po({
    d3po() %>%
      d3po_type("line") %>%
      d3po_data(data = line_data) %>%
      d3po_id("id") %>%
      d3po_axis(x = "ab2", y = "ab2") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle"
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$network <- render_d3po({
    d3po() %>%
      d3po_type("network") %>%
      d3po_data(data = network_data, size = "val", nodes = network_nodes, edges = network_edges) %>%
      d3po_id("name") %>%
      d3po_title(
        list(
          value = "Titles and Footers Example",
          sub = "Subtitles are smaller than titles.",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$pie <- render_d3po({
    d3po() %>%
      d3po_type("pie") %>%
      d3po_data(data = pie_data, size = "value") %>%
      d3po_id("id") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$rings <- render_d3po({
    d3po() %>%
      d3po_type("rings") %>%
      d3po_data(edges = rings_edges) %>%
      d3po_focus("alpha") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$radar <- render_d3po({
    d3po() %>%
      d3po_type("radar") %>%
      d3po_data(
        data = radar_data,
        size = "value"
      ) %>%
      d3po_id(c("name", "skill")) %>%
      d3po_color("color") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$sankey <- render_d3po({
    d3po() %>%
      d3po_type("sankey") %>%
      d3po_data(data = sankey_data, size = "val", nodes = sankey_nodes, edges = sankey_edges) %>%
      # should be something like
      # d3po_data(size = 100, nodes = nodes, edges = list(strength = "strength", value = edges)) %>%
      d3po_id("id") %>%
      d3po_color("color") %>%
      d3po_focus(list(tooltip = FALSE, value = "gamma")) %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle"
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$scatterplot <- render_d3po({
    d3po() %>%
      d3po_type("scatter") %>%
      d3po_data(data = scatterplot_data) %>%
      d3po_id(c("type")) %>%
      d3po_axis(x = "value", y = "weigth") %>%
      d3po_color("color") %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle"
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$stacked <- render_d3po({
    d3po() %>%
      d3po_type("stacked") %>%
      d3po_data(data = stacked_data) %>%
      d3po_id("id") %>%
      d3po_axis(x = "ab1", y = "ab2") %>%
      d3po_color("color") %>%
      d3po_font(family = "Fira Sans", weight = 400) %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })

  output$treemap <- render_d3po({
    d3po() %>%
      d3po_type("tree_map") %>%
      d3po_data(data = treemap_data, size = "value") %>%
      d3po_id(c("parent", "id")) %>%
      d3po_depth(1) %>%
      d3po_color("color") %>%
      d3po_font(family = "Fira Sans", weight = 400) %>%
      d3po_labels(align = "left", valign = "top") %>%
      d3po_icon(style = "knockout", value = "icon") %>%
      d3po_legend(size = 30) %>%
      d3po_title(
        list(
          value = "This is a title",
          sub = "This is a subtitle",
          total = TRUE
        )
      ) %>%
      d3po_footer(
        list(
          link = "https://www.duckduckgo.com",
          value = "Click here to search DuckDuckGo"
        )
      )
  })
}

shinyApp(ui, server)
