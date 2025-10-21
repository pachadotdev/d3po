#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @import d3po
#' @importFrom stats aggregate
#' @importFrom rlang .data
#' @importFrom htmlwidgets JS
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

  # Render the selected plot via modular functions
  output$plot <- render_d3po({
    req(input$plot_type)

    # mapping plot_type -> function name (as string) then get() it to avoid static linter warnings
    plot_fun_name <- switch(input$plot_type,
      box1 = "mod_box1_plot",
      box2 = "mod_box2_plot",
      box_custom1 = "mod_box_custom1_plot",
      box_custom2 = "mod_box_custom2_plot",
      bar1 = "mod_bar1_plot",
      bar2 = "mod_bar2_plot",
      bar_custom1 = "mod_bar_custom1_plot",
      bar_custom2 = "mod_bar_custom2_plot",
      treemap1 = "mod_treemap1_plot",
      treemap2 = "mod_treemap2_plot",
      treemap3 = "mod_treemap3_plot",
      treemap4 = "mod_treemap4_plot",
      treemap_style = "mod_treemap_style_plot",
      treemap_twolevel = "mod_treemap_twolevel_plot",
      treemap_twolevel_custom = "mod_treemap_twolevel_custom_plot",
      pie = "mod_pie_plot",
      pie_custom = "mod_pie_custom_plot",
      donut = "mod_donut_plot",
      line = "mod_line_plot",
      area = "mod_area_plot",
      line_area_custom = "mod_line_area_custom_plot",
      scatter1 = "mod_scatter1_plot",
      scatter2 = "mod_scatter2_plot",
      scatter3 = "mod_scatter3_plot",
      scatter4 = "mod_scatter4_plot",
      scatter_custom = "mod_scatter_custom_plot",
      geomap1 = "mod_geomap1_plot",
      geomap2 = "mod_geomap2_plot",
      geomap_custom = "mod_geomap_custom_plot",
      network_kk = "mod_network_kk_plot",
      network_fr = "mod_network_fr_plot",
      network_manual = "mod_network_manual_plot",
      network_custom = "mod_network_custom_plot",
      NULL
    )

    if (is.null(plot_fun_name)) {
      stop("Unknown plot type: ", input$plot_type)
    }

    plot_fun <- get(plot_fun_name, mode = "function", inherits = TRUE)

    # Safe call: only pass pokemon if the function signature accepts it (data or ...),
    # otherwise call without arguments. Fall back with tryCatch to be robust.
    fmls <- names(formals(plot_fun))
    if (!is.null(fmls) && ("data" %in% fmls || "..." %in% fmls)) {
      plot_fun(pokemon)
    } else if (is.null(fmls) || length(fmls) == 0) {
      plot_fun()
    } else {
      tryCatch(
        plot_fun(pokemon),
        error = function(e) plot_fun()
      )
    }
  })

  # (old helper removed; module function source is rendered instead)

  # Render the source of the module function for the selected plot
  output$plot_code <- renderPrint({
    req(input$plot_type)
    plot_fun_name <- switch(input$plot_type,
      box1 = "mod_box1_plot",
      box2 = "mod_box2_plot",
      box_custom1 = "mod_box_custom1_plot",
      box_custom2 = "mod_box_custom2_plot",
      bar1 = "mod_bar1_plot",
      bar2 = "mod_bar2_plot",
      bar_custom1 = "mod_bar_custom1_plot",
      bar_custom2 = "mod_bar_custom2_plot",
      treemap1 = "mod_treemap1_plot",
      treemap2 = "mod_treemap2_plot",
      treemap3 = "mod_treemap3_plot",
      treemap4 = "mod_treemap4_plot",
      treemap_style = "mod_treemap_style_plot",
      treemap_twolevel = "mod_treemap_twolevel_plot",
      treemap_twolevel_custom = "mod_treemap_twolevel_custom_plot",
      pie = "mod_pie_plot",
      pie_custom = "mod_pie_custom_plot",
      donut = "mod_donut_plot",
      line = "mod_line_plot",
      area = "mod_area_plot",
      line_area_custom = "mod_line_area_custom_plot",
      scatter1 = "mod_scatter1_plot",
      scatter2 = "mod_scatter2_plot",
      scatter3 = "mod_scatter3_plot",
      scatter4 = "mod_scatter4_plot",
      scatter_custom = "mod_scatter_custom_plot",
      geomap1 = "mod_geomap1_plot",
      geomap2 = "mod_geomap2_plot",
      geomap_custom = "mod_geomap_custom_plot",
      network_kk = "mod_network_kk_plot",
      network_fr = "mod_network_fr_plot",
      network_manual = "mod_network_manual_plot",
      network_custom = "mod_network_custom_plot",
      NULL
    )

    if (is.null(plot_fun_name)) {
      cat("# No function available for:", input$plot_type)
      return()
    }

    fun <- readLines(system.file("R", paste0(gsub("_plot$", "", plot_fun_name), ".R"), package = "d3podemo"))

    writeLines(fun)
  })
}
