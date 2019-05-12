#' @export
d3p_type <- function(d3p, type = NULL) {
  d3p$x[["type"]] <- type
  d3p
}

#' @export
d3p_data <- function(d3p, data, size = NULL, nodes = NULL, edges = NULL, topojson = NULL) {
  stopifnot(is.data.frame(data))
  d3p$x[["data"]] <- data
  d3p$x[["size"]] <- size
  d3p$x[["edges"]] <- edges
  d3p$x[["nodes"]] <- nodes
  d3p$x[["topojson"]] <- topojson
  d3p
}

#' @export
d3p_id <- function(d3p, vars = NULL) {
  d3p$x[["id"]] <- vars
  d3p
}

#' @export
d3p_color <- function(d3p, vars = NULL) {
  d3p$x[["color"]] <- vars
  d3p
}

#' @export
d3p_labels <- function(d3p, ...) {
  d3p$x$labels <- list(...)
  d3p
}

#' @export
d3p_icon <- function(d3p, ...) {
  d3p$x$icon <- list(...)
  d3p
}

#' @export
d3p_legend <- function(d3p, ...) {
  d3p$x$legend <- list(...)
  d3p
}

#' @export
d3p_axis <- function(d3p, x = NULL, y = NULL) {
  d3p$x[["xaxis"]] <- x
  d3p$x[["yaxis"]] <- y
  d3p
}

#' @export
d3p_depth <- function(d3p, depth = 0) {
  d3p$x[["depth"]] <- depth
  d3p
}
