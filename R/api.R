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
#'   po_box(daes(x = type_1, y = speed, color = color_1)) %>%
#'   po_title("Distribution of Pokemon speed by main type")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_box <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_box")

#' @export
#' @method po_box d3po
po_box.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
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

#' @export
#' @method po_box d3proxy
po_box.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-box", msg)

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
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  group_by(type_1, color_1) %>%
#' #  count()
#'
#' dout <- data.frame(
#'   type_1 = c(
#'     "bug", "dragon", "electric", "fairy", "fighting",
#'     "fire", "ghost", "grass", "ground", "ice",
#'     "normal", "poison", "psychic", "rock", "water"
#'   ),
#'   color_1 = c(
#'     "#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
#'     "#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
#'     "#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
#'   ),
#'   n = c(
#'     12, 3, 9, 2, 7,
#'     12, 3, 12, 8, 2,
#'     22, 14, 8, 9, 28
#'   )
#' )
#'
#' d3po(dout) %>%
#'   po_treemap(daes(size = n, group = type_1, color = color_1)) %>%
#'   po_title("Share of Pokemon by main type")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_treemap <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_treemap")

#' @export
#' @method po_treemap d3po
po_treemap.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
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

#' @export
#' @method po_treemap d3proxy
po_treemap.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-treemap", msg)

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
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  group_by(type_1, color_1) %>%
#' #  count()
#'
#' dout <- data.frame(
#'   type_1 = c(
#'     "bug", "dragon", "electric", "fairy", "fighting",
#'     "fire", "ghost", "grass", "ground", "ice",
#'     "normal", "poison", "psychic", "rock", "water"
#'   ),
#'   color_1 = c(
#'     "#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
#'     "#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
#'     "#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
#'   ),
#'   n = c(
#'     12, 3, 9, 2, 7,
#'     12, 3, 12, 8, 2,
#'     22, 14, 8, 9, 28
#'   )
#' )
#'
#' d3po(dout) %>%
#'   po_pie(daes(size = n, group = type_1, color = color_1)) %>%
#'   po_title("Share of Pokemon by main type")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_pie <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_pie")

#' @export
#' @method po_pie d3po
po_pie.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
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

#' @export
#' @method po_pie d3proxy
po_pie.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-pie", msg)

  return(d3po)
}

# Donut ----

#' Donut
#'
#' Plot a donut
#'
#' @inheritParams po_box
#'
#' @examples
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  group_by(type_1, color_1) %>%
#' #  count()
#'
#' dout <- data.frame(
#'   type_1 = c(
#'     "bug", "dragon", "electric", "fairy", "fighting",
#'     "fire", "ghost", "grass", "ground", "ice",
#'     "normal", "poison", "psychic", "rock", "water"
#'   ),
#'   color_1 = c(
#'     "#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
#'     "#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
#'     "#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
#'   ),
#'   n = c(
#'     12, 3, 9, 2, 7,
#'     12, 3, 12, 8, 2,
#'     22, 14, 8, 9, 28
#'   )
#' )
#'
#' d3po(dout) %>%
#'   po_donut(daes(size = n, group = type_1, color = color_1)) %>%
#'   po_title("Share of Pokemon by main type")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_donut <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_donut")

#' @export
#' @method po_donut d3po
po_donut.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "donut"

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

#' @export
#' @method po_donut d3proxy
po_donut.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-donut", msg)

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
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  filter(
#' #   type_1 == "water"
#' #  ) %>%
#' #  group_by(type_1, color_1) %>%
#' #  reframe(
#' #   probability = c(0, 0.25, 0.5, 0.75, 1),
#' #   quantile = quantile(speed, probability)
#' #  )
#'
#' dout <- data.frame(
#'   type_1 = rep("water", 5),
#'   color_1 = rep("#6890F0", 5),
#'   probability = c(0, 0.25, 0.5, 0.75, 1),
#'   quantile = c(15, 57.25, 70, 82, 115)
#' )
#'
#' d3po(dout) %>%
#'   po_area(daes(
#'     x = probability, y = quantile, group = type_1,
#'     color = color_1
#'   )) %>%
#'   po_title("Sample Quantiles for Water Pokemon Speed")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_area <- function(d3po, ..., data = NULL, inherit_daes = TRUE, stack = FALSE) UseMethod("po_area")

#' @export
#' @method po_area d3po
po_area.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE, stack = FALSE) {
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

#' @export
#' @method po_area d3proxy
po_area.d3proxy <- function(d3po, ..., data, inherit_daes, stack) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")
  assertthat::assert_that(!missing(stack), msg = "Missing `stack`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes, stack = stack))

  d3po$session$sendCustomMessage("d3po-area", msg)

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
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  group_by(type_1, color_1) %>%
#' #  count()
#'
#' dout <- data.frame(
#'   type_1 = c(
#'     "bug", "dragon", "electric", "fairy", "fighting",
#'     "fire", "ghost", "grass", "ground", "ice",
#'     "normal", "poison", "psychic", "rock", "water"
#'   ),
#'   color_1 = c(
#'     "#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
#'     "#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
#'     "#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
#'   ),
#'   n = c(
#'     12, 3, 9, 2, 7,
#'     12, 3, 12, 8, 2,
#'     22, 14, 8, 9, 28
#'   )
#' )
#'
#' d3po(dout) %>%
#'   po_bar(daes(x = type_1, y = n, color = color_1)) %>%
#'   po_title("Share of Pokemon by main type")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_bar <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_bar")

#' @export
#' @method po_bar d3po
po_bar.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
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

#' @export
#' @method po_bar d3proxy
po_bar.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-bar", msg)

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
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  filter(
#' #   type_1 == "water"
#' #  ) %>%
#' #  group_by(type_1, color_1) %>%
#' #  reframe(
#' #   probability = c(0, 0.25, 0.5, 0.75, 1),
#' #   quantile = quantile(speed, probability)
#' #  )
#'
#' dout <- data.frame(
#'   type_1 = rep("water", 5),
#'   color_1 = rep("#6890F0", 5),
#'   probability = c(0, 0.25, 0.5, 0.75, 1),
#'   quantile = c(15, 57.25, 70, 82, 115)
#' )
#'
#' d3po(dout) %>%
#'   po_line(daes(
#'     x = probability, y = quantile, group = type_1,
#'     color = color_1
#'   )) %>%
#'   po_title("Sample Quantiles for Water Pokemon Speed")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_line <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_line")

#' @export
#' @method po_line d3po
po_line.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
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

#' @export
#' @method po_line d3proxy
po_line.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-line", msg)

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
#' # library(dplyr)
#' # dout <- pokemon %>%
#' #  group_by(type_1, color_1) %>%
#' #  summarise(
#' #   attack = mean(attack),
#' #   defense = mean(defense)
#' #  ) %>%
#' #  mutate(log_attack_x_defense = log(attack * defense))
#'
#' dout <- data.frame(
#'   type_1 = c(
#'     "bug", "dragon", "electric", "fairy", "fighting",
#'     "fire", "ghost", "grass", "ground", "ice",
#'     "normal", "poison", "psychic", "rock", "water"
#'   ),
#'   color_1 = c(
#'     "#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028",
#'     "#F08030", "#705898", "#78C850", "#E0C068", "#98D8D8",
#'     "#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0"
#'   ),
#'   attack = c(
#'     63.7, 94, 62, 57.5, 102.8,
#'     83.9, 50, 70.6, 81.8, 67.5,
#'     67.7, 74.4, 60.1, 82.2, 70.2
#'   ),
#'   defense = c(
#'     57, 68.3, 64.6, 60.5, 61,
#'     62.5, 45, 69.5, 86.2, 67.5,
#'     53.5, 67, 57.5, 110, 77.5
#'   ),
#'   log_attack_x_defense = c(
#'     8.1, 8.7, 8.2, 8.1, 8.7,
#'     8.5, 7.7, 8.5, 8.8, 8.4,
#'     8.1, 8.5, 8.1, 9.1, 8.6
#'   )
#' )
#'
#' d3po(dout) %>%
#'   po_scatter(daes(
#'     x = defense, y = attack,
#'     size = log_attack_x_defense, group = type_1, color = color_1
#'   )) %>%
#'   po_title("Pokemon Mean Attack vs Mean Defense by Main Type")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_scatter <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_scatter")

#' @export
#' @method po_scatter d3po
po_scatter.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
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

#' @export
#' @method po_scatter d3proxy
po_scatter.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-scatter", msg)

  return(d3po)
}

# Title ----

#' Title
#'
#' Add a title to a chart.
#'
#' @inheritParams po_box
#' @param title Title to add.
#' @export
#' @return Appends a title to an 'htmlwidgets' object
po_title <- function(d3po, title) UseMethod("po_title")

#' @export
#' @method po_title d3po
po_title.d3po <- function(d3po, title) {
  assertthat::assert_that(!missing(title), msg = "Missing `title`")

  d3po$x$title <- title
  return(d3po)
}

#' @export
#' @method po_title d3proxy
po_title.d3proxy <- function(d3po, title) {
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
#' @export
#' @return Appends custom labels to an 'htmlwidgets' object
po_labels <- function(d3po, align = "center",
                      valign = "middle",
                      resize = TRUE) {
  UseMethod("po_labels")
}

#' @export
#' @method po_labels d3po
po_labels.d3po <- function(d3po, align, valign, resize) {
  assertthat::assert_that(!missing(align), msg = "Missing `align`")
  assertthat::assert_that(!missing(valign), msg = "Missing `valign`")
  assertthat::assert_that(!missing(resize), msg = "Missing `resize`")

  d3po$x$labels <- NULL
  d3po$x$labels$align <- align
  d3po$x$labels$valign <- valign
  d3po$x$labels$resize <- resize

  return(d3po)
}

#' @export
#' @method po_labels d3proxy
po_labels.d3proxy <- function(d3po, align, valign, resize) {
  assertthat::assert_that(!missing(align), msg = "Missing `align`")
  assertthat::assert_that(!missing(valign), msg = "Missing `valign`")
  assertthat::assert_that(!missing(resize), msg = "Missing `resize`")

  msg <- list(id = d3po$id, msg = list(align = align, valign = valign, resize = resize))

  d3po$session$sendCustomMessage("d3po-labels", msg)

  return(d3po)
}

# Legend ----

#' Legend
#'
#' Add a legend to a chart.
#'
#' @inheritParams po_box
#' @param legend legend to add.
#' @export
#' @return Appends custom legend to an 'htmlwidgets' object
po_legend <- function(d3po, legend) UseMethod("po_legend")

#' @export
#' @method po_legend d3po
po_legend.d3po <- function(d3po, legend) {
  assertthat::assert_that(!missing(legend), msg = "Missing `legend`")

  d3po$x$legend <- legend
  return(d3po)
}

#' @export
#' @method po_legend d3proxy
po_legend.d3proxy <- function(d3po, legend) {
  assertthat::assert_that(!missing(legend), msg = "Missing `legend`")

  msg <- list(id = d3po$id, msg = list(legend = legend))

  d3po$session$sendCustomMessage("d3po-legend", msg)

  return(d3po)
}

#' @export
#' @method po_legend d3proxy
po_legend.d3proxy <- function(d3po, legend) {
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
#' @param transform transformation to use for the title ("lowercase", "uppercase", "capitalize", "none").
#' @export
#' @return Appends custom font to an 'htmlwidgets' object
po_font <- function(d3po, family = "Fira Sans",
                    size = 16,
                    transform = "none") {
  UseMethod("po_font")
}

#' @export
#' @method po_font d3po
po_font.d3po <- function(d3po, family, size, transform) {
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
po_font.d3proxy <- function(d3po, family, size, transform) {
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")

  msg <- list(id = d3po$id, msg = list(family = family, size = size, transform = transform))

  d3po$session$sendCustomMessage("d3po-font", msg)

  return(d3po)
}

#' @export
#' @method po_font d3proxy
po_font.d3proxy <- function(d3po, family, size, transform) {
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
#' @export
#' @return Appends custom background to an 'htmlwidgets' object
po_background <- function(d3po, background = "#fff") UseMethod("po_background")

#' @export
#' @method po_background d3po
po_background.d3po <- function(d3po, background) {
  assertthat::assert_that(!missing(background), msg = "Missing `background`")

  d3po$x$background <- background
  return(d3po)
}

#' @export
#' @method po_background d3proxy
po_background.d3proxy <- function(d3po, background) {
  assertthat::assert_that(!missing(background), msg = "Missing `background`")

  msg <- list(id = d3po$id, msg = list(background = background))

  d3po$session$sendCustomMessage("d3po-background", msg)

  return(d3po)
}

# Network ----

#' Network
#'
#' Draw a network.
#'
#' @inheritParams po_box
#' @examples
#' d3po(pokemon_network) %>%
#'   po_network(daes(size = size, color = color, layout = "kk")) %>%
#'   po_title("Connections Between Pokemon Types")
#' @export
#' @return Appends nodes arguments to a network-specific 'htmlwidgets' object
po_network <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_network")

#' @export
#' @method po_network d3po
po_network.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  check_installed("igraph")

  d3po$x$type <- "network"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  columns <- daes_to_columns(daes)

  d3po$x$data <- data
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$tooltip <- daes_to_opts(daes, "tooltip")

  layout <- daes_to_opts(daes, "layout")

  if (is.null(layout)) {
    warning("No layout specified, using 'nicely'.")
    layout <- "nicely"
  }

  layout <- switch(layout,
    "nicely" = igraph::layout_nicely,
    "fr" = igraph::layout_with_fr,
    "kk" = igraph::layout_with_kk,
    "graphopt" = igraph::layout_with_graphopt,
    "drl" = igraph::layout_with_drl,
    "lgl" = igraph::layout_with_lgl,
    "mds" = igraph::layout_with_mds,
    "sugiyama" = igraph::layout_with_sugiyama
  )

  layout <- round(as.data.frame(layout(d3po$x$tempdata)), 3)
  names(layout) <- c("x", "y")
  layout <- dplyr::bind_cols(data, layout)

  d3po$x$nodes <- layout

  return(d3po)
}

#' @export
#' @method po_network d3proxy
po_network.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-graph", msg)

  return(d3po)
}

# Geomap ----

#' Geomap
#'
#' Plot a geomap
#'
#' @inheritParams po_box
#' @param map map to use (i.e., any valid list or topojson file such as `maps$south_america` or `jsonlite::fromJSON("south_america.topojson", simplifyVector = F)`)
#'
#' @examples
#' dout <- map_ids(d3po::maps$asia$japan)
#' dout$value <- ifelse(dout$id == "TK", 1L, NA)
#' dout$color <- ifelse(dout$id == "TK", "#bd0029", NA)
#'
#' d3po(dout) %>%
#'   po_geomap(
#'     daes(
#'       group = id, color = color, size = value,
#'       tooltip = name
#'     ),
#'     map = d3po::maps$asia$japan
#'   ) %>%
#'   po_title("Pokemon was created in the Japanese city of Tokyo")
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_geomap <- function(d3po, ..., data = NULL, map = NULL, inherit_daes = TRUE) UseMethod("po_geomap")

#' @export
#' @method po_geomap d3po
po_geomap.d3po <- function(d3po, ..., data = NULL, map = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "geomap"

  data <- .get_data(d3po$x$tempdata, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$coords <- map

  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$text <- daes_to_opts(daes, "text")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$tooltip <- daes_to_opts(daes, "tooltip")

  return(d3po)
}

#' @export
#' @method po_geomap d3proxy
po_geomap.d3proxy <- function(d3po, ..., data, map, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(map), msg = "Missing `map`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, map = map, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-geomap", msg)

  return(d3po)
}
