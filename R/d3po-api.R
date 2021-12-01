# Box ----

#' Boxplot
#' 
#' Draw a boxplot.
#' 
#' @param d3po Either the output of [d3po()] or [d3po_proxy()].
#' @param ... Aesthetics, see [daes()].
#' @param data Any dataset to use for plot, overrides data passed
#' to [d3po()].
#' @param inherit_daes Whether to inherit aesthetics previous specified.
#' 
#' @examples 
#' d3po(pokemon) %>%
#'  po_box(daes(x = type_1, y = speed, group = name, color = color_1)) %>%
#'  po_title("Distribution of Pokemon Speed")
#' 
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot 
po_box <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_box")

#' @export
#' @method po_box d3po
po_box.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE){

  # defaults
  d3po$x$type <- "box"

  data <- .get_data(d3po$x$tempdata, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")

  return(d3po)
}

# Treemap ----

#' Treemap
#' 
#' Plot a treemap
#' 
#' @inheritParams po_box
#' 
#' @examples 
#' library(dplyr)
#' 
#' pokemon_count <- pokemon %>% 
#'  group_by(type_1, color_1) %>% 
#'  count()
#'  
#' d3po(pokemon_count) %>%
#'  po_treemap(
#'   daes(size = n, group = type_1, color = color_1)
#'  ) %>%
#'  po_title("Share of Pokemon by Type 1")
#' 
#' @export 
#' @return an 'htmlwidgets' object with the desired interactive plot
po_treemap <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_treemap")

#' @export
#' @method po_treemap d3po
po_treemap.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE){
  
  # defaults
  d3po$x$type <- "treemap"
  
  data <- .get_data(d3po$x$tempdata, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  
  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")

  return(d3po)
}

# Pie ----

#' Pie
#' 
#' Plot a pie
#' 
#' @inheritParams po_box
#' 
#' @examples 
#' library(dplyr)
#' 
#' pokemon_count <- pokemon %>% 
#'  group_by(type_1, color_1) %>% 
#'  count()
#'  
#' d3po(pokemon_count) %>%
#'  po_pie(
#'   daes(size = n, group = type_1, color = color_1)
#'  ) %>%
#'  po_title("Share of Pokemon by Type 1")
#' 
#' @export 
#' @return an 'htmlwidgets' object with the desired interactive plot
po_pie <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_pie")

#' @export
#' @method po_pie d3po
po_pie.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE){
  
  # defaults
  d3po$x$type <- "pie"
  
  data <- .get_data(d3po$x$tempdata, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  
  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  
  return(d3po)
}

# Area ----

#' Area
#' 
#' Plot an area chart.
#' 
#' @inheritParams po_box
#' @param stack Whether to stack the series.
#' 
#' @examples
#' library(dplyr)
#' 
#' pokemon_density <- density(pokemon$weight, n = 30)
#' 
#' pokemon_density <- tibble(
#'  x = pokemon_density$x,
#'  y = pokemon_density$y,
#'  variable = "weight",
#'  color = "#5377e3"
#' )
#' 
#' d3po(pokemon_density) %>%
#'  po_area(
#'   daes(x = x, y = y, group = variable, color = color)
#'  ) %>%
#'  po_title("Approximated Density of Pokemon Weight")
#' 
#' @export 
#' @return an 'htmlwidgets' object with the desired interactive plot
po_area <- function(d3po, ..., data = NULL, inherit_daes = TRUE, stack = FALSE) UseMethod("po_area")

#' @export
#' @method po_area d3po
po_area.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE, stack = FALSE){
  
  # defaults
  d3po$x$type <- ifelse(stack, "stacked", "area")
  
  data <- .get_data(d3po$x$tempdata, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  
  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  
  return(d3po)
}

# Bar ----

#' Bar
#' 
#' Draw a bar chart.
#' 
#' @inheritParams po_box
#' 
#' @examples
#' library(dplyr)
#' 
#' pokemon_count <- pokemon %>% 
#'  group_by(type_1, color_1) %>% 
#'  count()
#'  
#' d3po(pokemon_count) %>%
#'  po_bar(
#'   daes(x = type_1, y = n, group = type_1, color = color_1)
#'  ) %>%
#'  po_title("Count of Pokemon by Type 1")
#' 
#' @export 
#' @return an 'htmlwidgets' object with the desired interactive plot
po_bar <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_bar")

#' @export
#' @method po_bar d3po
po_bar.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE){
  
  # defaults
  d3po$x$type <- "bar"
  
  data <- .get_data(d3po$x$tempdata, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  
  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  
  return(d3po)
}

# Line ----

#' Line
#' 
#' Plot an line chart.
#' 
#' @inheritParams po_box
#' 
#' @examples
#' library(dplyr)
#' 
#' pokemon_decile <- pokemon %>% 
#'  filter(type_1 %in% c("grass", "fire", "water")) %>% 
#'  group_by(type_1 ,color_1) %>% 
#'  summarise(
#'   decile = 0:10,
#'   weight = quantile(weight, probs = seq(0, 1, by = .1))
#'  )
#'  
#' d3po(pokemon_decile) %>%
#'  po_line(
#'   daes(x = decile, y = weight, group = type_1, color = color_1)
#'  ) %>%
#'  po_title("Decile of Pokemon Weight by Type 1")
#' 
#' @export 
#' @return an 'htmlwidgets' object with the desired interactive plot
po_line <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_line")

#' @export
#' @method po_line d3po
po_line.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE){
  
  # defaults
  d3po$x$type <- "line"
  
  data <- .get_data(d3po$x$tempdata, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  
  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  
  return(d3po)
}

# Scatter ----

#' scatter
#' 
#' Plot an scatter chart.
#' 
#' @inheritParams po_box
#' 
#' @examples
#' library(dplyr)
#' 
#' pokemon_decile <- pokemon %>% 
#'  filter(type_1 %in% c("grass", "fire", "water")) %>% 
#'  group_by(type_1 ,color_1) %>% 
#'  summarise(
#'   decile = 0:10,
#'   weight = quantile(weight, probs = seq(0, 1, by = .1))
#'  )
#'  
#' d3po(pokemon_decile) %>%
#'  po_scatter(
#'   daes(x = decile, y = weight, group = type_1, color = color_1)
#'  ) %>%
#'  po_title("Decile of Pokemon Weight by Type 1")
#' 
#' @export 
#' @return an 'htmlwidgets' object with the desired interactive plot
po_scatter <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_scatter")

#' @export
#' @method po_scatter d3po
po_scatter.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE){
  
  # defaults
  d3po$x$type <- "scatter"
  
  data <- .get_data(d3po$x$tempdata, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  
  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  
  return(d3po)
}

# Title ----

#' Title
#' 
#' Add a title to a chart.
#' 
#' @inheritParams po_box
#' @param title Title to add.
#' 
#' @export 
#' @return Appends a title to an 'htmlwidgets' object
po_title <- function(d3po, title) UseMethod("po_title")

#' @export 
#' @method po_title d3po
po_title.d3po <- function(d3po, title){
  assertthat::assert_that(!missing(title), msg = "Missing `title`")

  d3po$x$title <- title
  return(d3po)
}

#' @export 
#' @method po_title d3proxy
po_title.d3proxy <- function(d3po, title){
  assertthat::assert_that(!missing(title), msg = "Missing `title`")

  msg <- list(id = d3po$id, msg = list(title = title))

  d3po$session$sendCustomMessage("d3po-title", msg)

  return(d3po)
}


# Labels ----

#' Labels
#' 
#' Edit labels positioning in a chart.
#' 
#' @inheritParams po_box
#' @param align horizontal alignment ("left", "center", "right", "start", "middle", "end").
#' @param valign vertical alignment ("top", "middle", "botton").
#' @param resize resize labels text (TRUE or FALSE).
#' @param family family font to use ("Roboto", "Merriweather", etc.).
#' @param size size to use (10, 11, 12, etc. overrides auto-sizing).
#' @param transform transform to use ("lowercase", "uppercase", "capitalize", "none").
#' 
#' @export 
#' @return Appends custom labels to an 'htmlwidgets' object
po_labels <- function(d3po, align = "center",
                            valign = "middle",
                            resize = TRUE,
                            family = "Fira Sans", 
                            size = 16,
                            transform = "capitalize") UseMethod("po_labels")

#' @export 
#' @method po_labels d3po
po_labels.d3po <- function(d3po, align, valign, resize, family, size, transform){
  assertthat::assert_that(!missing(align), msg = "Missing `align`")
  assertthat::assert_that(!missing(valign), msg = "Missing `valign`")
  assertthat::assert_that(!missing(resize), msg = "Missing `resize`")
  
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")
  
  d3po$x$labels <- NULL
  d3po$x$labels$align <- align
  d3po$x$labels$valign <- valign
  d3po$x$labels$resize <- resize
  
  d3po$x$labels$font <- NULL
  d3po$x$labels$font$family <- family
  d3po$x$labels$font$size <- size
  d3po$x$labels$font$transform <- transform
  
  return(d3po)
}

# Legend ----

#' Legend
#' 
#' Add a legend to a chart.
#' 
#' @inheritParams po_box
#' @param legend legend to add.
#' 
#' @export 
#' @return Appends custom legend to an 'htmlwidgets' object
po_legend <- function(d3po, legend) UseMethod("po_legend")

#' @export 
#' @method po_legend d3po
po_legend.d3po <- function(d3po, legend){
  assertthat::assert_that(!missing(legend), msg = "Missing `legend`")
  
  d3po$x$legend <- legend
  return(d3po)
}

#' @export 
#' @method po_legend d3proxy
po_legend.d3proxy <- function(d3po, legend){
  assertthat::assert_that(!missing(legend), msg = "Missing `legend`")
  
  msg <- list(id = d3po$id, msg = list(legend = legend))
  
  d3po$session$sendCustomMessage("d3po-legend", msg)
  
  return(d3po)
}

# Font ----

#' Font
#' 
#' Edit the font used in a chart.
#' 
#' @inheritParams po_box
#' @param family family font to use ("Roboto", "Merriweather", etc.).
#' @param size size to use (10, 11, 12, etc. overrides auto-sizing).
#' @param transform transform to use ("lowercase", "uppercase", "capitalize", "none").
#' 
#' @export 
#' @return Appends custom font to an 'htmlwidgets' object
po_font <- function(d3po, family = "Fira Sans",
                          size = 16,
                          transform = "none") UseMethod("po_font")

#' @export 
#' @method po_font d3po
po_font.d3po <- function(d3po, family, size, transform){
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")
  
  d3po$x$font <- NULL
  d3po$x$font$family <- family
  d3po$x$font$size <- size
  d3po$x$font$transform <- transform
  return(d3po)
}

#' @export 
#' @method po_font d3proxy
po_font.d3proxy <- function(d3po, family, size, transform){
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")
  
  msg <- list(id = d3po$id, msg = list(family = family, size = size, transform = transform))
  
  d3po$session$sendCustomMessage("d3po-font", msg)
  
  return(d3po)
}

# Background ----

#' Background
#' 
#' Add a background to a chart.
#' 
#' @inheritParams po_box
#' @param background background to add (hex code).
#' 
#' @export 
#' @return Appends custom background to an 'htmlwidgets' object
po_background <- function(d3po, background = "#fff") UseMethod("po_background")

#' @export 
#' @method po_background d3po
po_background.d3po <- function(d3po, background){
  assertthat::assert_that(!missing(background), msg = "Missing `background`")
  
  d3po$x$background <- background
  return(d3po)
}

#' @export 
#' @method po_background d3proxy
po_background.d3proxy <- function(d3po, background){
  assertthat::assert_that(!missing(background), msg = "Missing `background`")
  
  msg <- list(id = d3po$id, msg = list(background = background))
  
  d3po$session$sendCustomMessage("d3po-background", msg)
  
  return(d3po)
}
