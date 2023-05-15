#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import shinydashboard
#' @import d3po
#' @import dplyr
#' @importFrom rlang sym
#' @importFrom jsonlite fromJSON
#' @noRd
app_server <- function(input, output, session) {
  # Your application server logic
  output$boxplot <- render_d3po({
    d3po(d3pogolem::pokemon) %>%
      po_box(daes(x = !!sym("type_1"), y = !!sym("speed"), group = !!sym("name"), color = !!sym("color_1"))) %>%
      po_title("Distribution of Pokemon Speed by Type")
  })

  output$barplot <- render_d3po({
    d3po(d3pogolem::pokemon_count) %>%
      po_bar(
        daes(x = !!sym("type_1"), y = !!sym("n"), group = !!sym("type_1"), color = !!sym("color_1"))
      ) %>%
      po_title("Count of Pokemon by Type")
  })

  output$treemap <- render_d3po({
    d3po(d3pogolem::pokemon_count) %>%
      po_treemap(
        daes(size = !!sym("n"), group = !!sym("type_1"), color = !!sym("color_1"))
      ) %>%
      po_title("Share of Pokemon by Type")
  })

  output$pie <- render_d3po({
    d3po(d3pogolem::pokemon_count) %>%
      po_pie(
        daes(size = !!sym("n"), group = !!sym("type_1"), color = !!sym("color_1"))
      ) %>%
      po_title("Share of Pokemon by Type")
  })

  output$donut <- render_d3po({
    d3po(d3pogolem::pokemon_count) %>%
      po_donut(
        daes(size = !!sym("n"), group = !!sym("type_1"), color = !!sym("color_1"))
      ) %>%
      po_title("Share of Pokemon by Type")
  })

  output$line <- render_d3po({
    d3po(d3pogolem::pokemon_decile) %>%
      po_line(
        daes(x = !!sym("decile"), y = !!sym("weight"), group = !!sym("type_1"), color = !!sym("color_1"))
      ) %>%
      po_title("Decile of Pokemon Weight by Type")
  })

  output$density <- render_d3po({
    d3po(d3pogolem::pokemon_density) %>%
      po_area(
        daes(x = !!sym("x"), y = !!sym("y"), group = !!sym("variable"), color = !!sym("color"))
      ) %>%
      po_title("Approximated Density of Pokemon Weight")
  })

  output$scatterplot <- render_d3po({
    d3po(d3pogolem::pokemon_def_vs_att) %>%
      po_scatter(
        daes(x = !!sym("mean_att"), y = !!sym("mean_def"), size = !!sym("n_pkmn"), group = !!sym("type_1"), color = !!sym("color_1"))
      ) %>%
      po_title("Average Attack vs Average Defense by Type")
  })

  output$network <- render_d3po({
    set.seed(4321)
    d3po(d3pogolem::pokemon_network) %>%
      po_network(daes(size = !!sym("size"), color = !!sym("color"), layout = "nicely")) %>%
      po_title("Connections between Pokemon types based on Type 1 and 2")
  })

  output$geomap <- render_d3po({
    countries <- data.frame(
      id = c("CL","GY","VE","CO","EC","PE","BO","PY","AR","UY","BR","SR","GB"),
      value = c(1,1, rep(0,11)),
      pkmn = c("Mewtwo","Mew", rep("",11))
    )

    d3po(countries) %>%
      po_geomap(daes(group = !!sym("id"), color = !!sym("value"), tooltip = !!sym("pkmn")), map = d3po::maps$south_america) %>%
      po_title("Pokemon found in South America")
  })

}
