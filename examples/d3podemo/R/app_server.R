#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
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
      box3 = "mod_box3_plot",
      box4 = "mod_box4_plot",
      box5 = "mod_box5_plot",
      box6 = "mod_box6_plot",
      box_custom = "mod_box_custom_plot",
      box_custom2 = "mod_box_custom2_plot",
      bar1 = "mod_bar1_plot",
      bar2 = "mod_bar2_plot",
      bar3 = "mod_bar3_plot",
      bar4 = "mod_bar4_plot",
      bar5 = "mod_bar5_plot",
      bar6 = "mod_bar6_plot",
      bar7 = "mod_bar7_plot",
      bar8 = "mod_bar8_plot",
      bar9 = "mod_bar9_plot",
      bar10 = "mod_bar10_plot",
      bar_custom = "mod_bar_custom_plot",
      treemap_onelevel = "mod_treemap_onelevel_plot",
      treemap_twolevel = "mod_treemap_twolevel_plot",
      treemap_onelevel_nocolors = "mod_treemap_onelevel_nocolors_plot",
      treemap_onelevel_colorsvector = "mod_treemap_onelevel_colorsvector_plot",
      treemap_onelevel_custom = "mod_treemap_onelevel_custom_plot",
      treemap_onelevel_custom2 = "mod_treemap_onelevel_custom2_plot",
      treemap_twolevel_custom = "mod_treemap_twolevel_custom_plot",
      treemap_style = "mod_treemap_style_plot",
      pie1 = "mod_pie_plot",
      pie2 = "mod_donut_plot",
      pie3 = "mod_pie3_plot",
      pie4 = "mod_pie4_plot",
      pie5 = "mod_pie5_plot",
      pie6 = "mod_pie6_plot",
      pie_custom = "mod_pie_custom_plot",
      line = "mod_line_plot",
      line2 = "mod_line2_plot",
      line3 = "mod_line3_plot",
      line_area_custom = "mod_line_area_custom_plot",
      area1 = "mod_area_plot",
      area2 = "mod_area2_plot",
      area3 = "mod_area3_plot",
      area4 = "mod_area4_plot",
      scatter1 = "mod_scatter1_plot",
      scatter2 = "mod_scatter2_plot",
      scatter3 = "mod_scatter3_plot",
      scatter4 = "mod_scatter4_plot",
      scatter5 = "mod_scatter5_plot",
      scatter6 = "mod_scatter6_plot",
      scatter_custom = "mod_scatter_custom_plot",
      geomap1 = "mod_geomap1_plot",
      geomap2 = "mod_geomap2_plot",
      geomap3 = "mod_geomap3_plot",
      geomap4 = "mod_geomap4_plot",
      network_kk = "mod_network_kk_plot",
      network_fr = "mod_network_fr_plot",
      network_kk_nocolors = "mod_network_kk_nocolors_plot",
      network_kk_colorsvector = "mod_network_kk_colorsvector_plot",
      network_manual = "mod_network_manual_plot",
      network_custom = "mod_network_custom_plot",
      NULL
    )

    if (is.null(plot_fun_name)) {
      stop("Unknown plot type: ", input$plot_type)
    }

    plot_fun <- get(plot_fun_name, mode = "function", inherits = TRUE)
    # Select proper data to pass: network examples require the package's
    # pokemon_network graph object, not the `pokemon` data.frame.
    network_types <- c("network_kk", "network_fr", "network_kk_nocolors", "network_kk_colorsvector", "network_manual", "network_custom")
    data_to_pass <- if (input$plot_type %in% network_types) d3po::pokemon_network else pokemon

    # Safe call: only pass data_to_pass if the function signature accepts it (data or ...),
    # otherwise call without arguments. Fall back with tryCatch to be robust.
    fmls <- names(formals(plot_fun))
    if (!is.null(fmls) && ("data" %in% fmls || "..." %in% fmls)) {
      plot_fun(data_to_pass)
    } else if (is.null(fmls) || length(fmls) == 0) {
      plot_fun()
    } else {
      tryCatch(
        plot_fun(data_to_pass),
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
      box3 = "mod_box3_plot",
      box4 = "mod_box4_plot",
      box5 = "mod_box5_plot",
      box6 = "mod_box6_plot",
      box_custom = "mod_box_custom_plot",
      box_custom2 = "mod_box_custom2_plot",
      bar1 = "mod_bar1_plot",
      bar2 = "mod_bar2_plot",
      bar3 = "mod_bar3_plot",
      bar4 = "mod_bar4_plot",
      bar5 = "mod_bar5_plot",
      bar6 = "mod_bar6_plot",
      bar7 = "mod_bar7_plot",
      bar8 = "mod_bar8_plot",
      bar9 = "mod_bar9_plot",
      bar10 = "mod_bar10_plot",
      bar_custom = "mod_bar_custom_plot",
      treemap_onelevel = "mod_treemap_onelevel_plot",
      treemap_twolevel = "mod_treemap_twolevel_plot",
      treemap_onelevel_nocolors = "mod_treemap_onelevel_nocolors_plot",
      treemap_onelevel_colorsvector = "mod_treemap_onelevel_colorsvector_plot",
      treemap_twolevel_custom = "mod_treemap_twolevel_custom_plot",
      treemap_onelevel_custom = "mod_treemap_onelevel_custom_plot",
      treemap_onelevel_custom2 = "mod_treemap_onelevel_custom2_plot",
      treemap_style = "mod_treemap_style_plot",
      pie1 = "mod_pie_plot",
      pie2 = "mod_donut_plot",
      pie3 = "mod_pie3_plot",
      pie4 = "mod_pie4_plot",
      pie5 = "mod_pie5_plot",
      pie6 = "mod_pie6_plot",
      pie_custom = "mod_pie_custom_plot",
      line = "mod_line_plot",
      line2 = "mod_line2_plot",
      line3 = "mod_line3_plot",
      line_area_custom = "mod_line_area_custom_plot",
      area1 = "mod_area_plot",
      area2 = "mod_area2_plot",
      area3 = "mod_area3_plot",
      area4 = "mod_area4_plot",
      scatter1 = "mod_scatter1_plot",
      scatter2 = "mod_scatter2_plot",
      scatter3 = "mod_scatter3_plot",
      scatter4 = "mod_scatter4_plot",
      scatter5 = "mod_scatter5_plot",
      scatter6 = "mod_scatter6_plot",
      scatter_custom = "mod_scatter_custom_plot",
      geomap1 = "mod_geomap1_plot",
      geomap2 = "mod_geomap2_plot",
      geomap3 = "mod_geomap3_plot",
      geomap4 = "mod_geomap4_plot",
      network_kk = "mod_network_kk_plot",
      network_fr = "mod_network_fr_plot",
      network_kk_nocolors = "mod_network_kk_nocolors_plot",
      network_kk_colorsvector = "mod_network_kk_colorsvector_plot",
      network_manual = "mod_network_manual_plot",
      network_custom = "mod_network_custom_plot",
      NULL
    )

    if (is.null(plot_fun_name)) {
      cat("# No function available for:", input$plot_type)
      return()
    }

    # Special-case: for the treemap example that comes from the package vignette
    # show the Rmd vignette snippet (treemap-custom-2) instead of the module file.
    if (identical(plot_fun_name, "mod_treemap_onelevel_custom2_plot")) {
      fun <- c(
        "dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1, data = pokemon, FUN = length)",
        "names(dout) <- c(\"type\", \"color\", \"count\")",
        "",
        "d3po(dout, width = 800, height = 600) %>%",
        "  po_treemap(",
        "    daes(",
        "      size = count, group = type, color = color, tiling = \"squarify\"",
        "    )",
        "  ) %>%",
        "  po_labels(",
        "    align = \"center-middle\",",
        "    title = \"Share of Pokemon by main type\",",
        "    labels = JS(\"function(percentage, row) {",
        "        var pct = (percentage).toFixed(1) + '%';",
        "        var name = (row && (row.type || row.name)) ? (row.type || row.name) : '';",
        "        var count = row && (row.count != null ? row.count : (row.value != null ? row.value : ''));",
        "        return '<i>' + name + '</i><br/>Count: ' + (count || '') + '<br/>Share: ' + pct;",
        "      }\")",
        "  ) %>%",
        "  po_tooltip(\"<i>Type: {type}</i><br/>Count: {count}\")"
      )

      writeLines(fun)
      return()
    }

    fun <- readLines(system.file("R", paste0(gsub("_plot$", "", plot_fun_name), ".R"), package = "d3podemo"))

    writeLines(fun)
  })
}
