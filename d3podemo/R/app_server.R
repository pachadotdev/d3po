#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import d3po
#' @importFrom stats aggregate
#' @importFrom rlang .data
#' @noRd
app_server <- function(input, output, session) {
  # Prepare data
  pokemon <- d3po::pokemon
  pokemon$log_weight <- log10(pokemon$weight)
  pokemon$log_height <- log10(pokemon$height)
  
  # Calculate inverse distance from mean for weighted scatterplots
  mean_weight <- mean(pokemon$weight, na.rm = TRUE)
  mean_height <- mean(pokemon$height, na.rm = TRUE)
  pokemon$distance_from_mean_weight <- abs(pokemon$weight - mean_weight)
  pokemon$distance_from_mean_height <- abs(pokemon$height - mean_height)
  pokemon$avg_distance <- (pokemon$distance_from_mean_weight + pokemon$distance_from_mean_height) / 2
  pokemon$inverse_distance_from_mean <- 1 / (pokemon$avg_distance + 0.01)

  # Render the selected plot
  output$plot <- render_d3po({
    req(input$plot_type)

    if (input$plot_type == "box1") {
      d3po(pokemon) %>%
        po_box(daes(x = .data$type_1, y = .data$weight, color = .data$color_1)) %>%
        po_title("Weight Distribution by Type")
    } else if (input$plot_type == "box2") {
      d3po(pokemon) %>%
        po_box(daes(x = .data$height, y = .data$type_1, color = .data$color_1)) %>%
        po_title("Height Distribution by Type")
    } else if (input$plot_type == "bar1") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_bar(daes(x = .data$type, y = .data$count, color = .data$color)) %>%
        po_title("Pokemon Count by Type (Vertical)")
    } else if (input$plot_type == "bar2") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_bar(daes(x = .data$count, y = .data$type, color = .data$color)) %>%
        po_title("Pokemon Count by Type (Horizontal)")
    } else if (input$plot_type == "treemap1") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "squarify")) %>%
        po_title("Share of Pokemon by Main Type (Squarify)")
    } else if (input$plot_type == "treemap2") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "binary")) %>%
        po_title("Share of Pokemon by Main Type (Binary)")
    } else if (input$plot_type == "treemap3") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "slice")) %>%
        po_title("Share of Pokemon by Main Type (Slice)")
    } else if (input$plot_type == "treemap4") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_treemap(daes(size = .data$count, group = .data$type, color = .data$color, tiling = "dice")) %>%
        po_title("Share of Pokemon by Main Type (Dice)")
    } else if (input$plot_type == "pie") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_pie(daes(size = .data$count, group = .data$type, color = .data$color)) %>%
        po_title("Pokemon Distribution by Type (Pie)")
    } else if (input$plot_type == "donut") {
      dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1,
        data = pokemon, FUN = length
      )
      names(dout) <- c("type", "color", "count")

      d3po(dout) %>%
        po_pie(daes(size = .data$count, group = .data$type, color = .data$color, innerRadius = 0.5)) %>%
        po_title("Pokemon Distribution by Type (Donut)")
    } else if (input$plot_type == "line") {
      dout <- pokemon[pokemon$name %in% c(
        "Squirtle", "Wartortle", "Blastoise",
        "Charmander", "Charmeleon", "Charizard",
        "Pikachu", "Raichu"
      ), c("height", "weight", "type_1", "color_1")]
      colnames(dout) <- c("height", "weight", "type", "color")

      d3po(dout) %>%
        po_line(daes(x = .data$height, y = .data$weight, group = .data$type, color = .data$color)) %>%
        po_title("Pokemon Evolution: Weight vs Height by Type")
    } else if (input$plot_type == "area") {
      dout <- pokemon[pokemon$name %in% c(
        "Squirtle", "Wartortle", "Blastoise",
        "Charmander", "Charmeleon", "Charizard",
        "Pikachu", "Raichu"
      ), c("height", "weight", "type_1", "color_1")]
      colnames(dout) <- c("height", "weight", "type", "color")

      d3po(dout) %>%
        po_area(daes(x = .data$height, y = .data$weight, group = .data$type, color = .data$color),
          stack = FALSE
        ) %>%
        po_title("Pokemon Evolution: Weight vs Height by Type (Area)")
    } else if (input$plot_type == "scatter1") {
      d3po(pokemon) %>%
        po_scatter(daes(x = .data$height, y = .data$weight, group = .data$name, color = .data$color_1)) %>%
        po_title("Height vs Weight")
    } else if (input$plot_type == "scatter2") {
      d3po(pokemon) %>%
        po_scatter(daes(x = .data$log_height, y = .data$log_weight, group = .data$name, color = .data$color_1)) %>%
        po_title("Log(Height) vs Log(Weight)")
    } else if (input$plot_type == "scatter3") {
      d3po(pokemon) %>%
        po_scatter(daes(
          x = .data$height, y = .data$weight, size = .data$inverse_distance_from_mean,
          group = .data$name, color = .data$color_1
        )) %>%
        po_title("Height vs Weight (Size = 1 / Distance from the Mean)")
    } else if (input$plot_type == "scatter4") {
      d3po(pokemon) %>%
        po_scatter(daes(
          x = .data$log_height, y = .data$log_weight, size = .data$inverse_distance_from_mean,
          group = .data$name, color = .data$color_1
        )) %>%
        po_title("Log(Height) vs Log(Weight) (Size = 1 / Distance from the Mean)")
    } else if (input$plot_type == "geomap") {
	  maps <- d3po::maps
      dout <- map_ids(maps$south_america$chile)
      dout$pokemon_count <- ifelse(dout$id == "MA", 1L, 0L)
      dout$color <- ifelse(dout$id == "MA", "#F85888", "#e0e0e0")

      d3po(dout) %>%
        po_geomap(
          daes(group = .data$id, color = .data$color, size = .data$pokemon_count, tooltip = .data$name),
          map = maps$south_america$chile
        ) %>%
        po_title("Pokemon Distribution in Chile")
    } else if (input$plot_type == "network") {
	  pokemon_network <- d3po::pokemon_network
      d3po(pokemon_network) %>%
        po_network(daes(size = .data$size, color = .data$color, layout = "kk")) %>%
        po_title("Pokemon Type Network")
    }
  })
}
