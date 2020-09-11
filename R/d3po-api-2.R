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
#' d3po(mtcars) %>%
#'  po_box(daes(x = cyl, y = qsec))
#' 
#' @export 
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
  d3po$x$group_by <- daes_to_opts(daes, "group_by")

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
#' treemap_data <- data.frame(
#'  parent = c(rep("Group 1", 3), rep("Group 2", 2)),
#'  id = c("alpha", "beta", "gamma", "delta", "eta"),
#'  value = c(29, 10, 2, 29, 25)
#' )
#' 
#' d3po(treemap_data) %>%
#'  po_treemap(daes(size = value, group_by = id)) %>%
#'  po_title("wrongly aligned title")
#' 
#' @export 
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
  d3po$x$group_by <- daes_to_opts(daes, "group_by")
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
#' d3po(cars) %>% 
#'  po_area(daes(speed, dist)) 
#' 
#' @export 
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
  d3po$x$group_by <- daes_to_opts(daes, "group_by")
  
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
#' df <- data.frame(
#'  x = 1:10,
#'  y = runif(10)
#' )
#' 
#' d3po(df) %>%
#'  po_bar(daes(x, y)) 
#' 
#' @export 
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
  d3po$x$id <- daes_to_opts(daes, "id")
  d3po$x$group_by <- daes_to_opts(daes, "group_by")
  
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

# Legend ----

#' Legend
#' 
#' Add a legend to a chart.
#' 
#' @inheritParams po_box
#' @param legend legend to add.
#' 
#' @export 
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
