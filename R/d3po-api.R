#' @export
d3po_type <- function(d3p, type = NULL) {
  d3p$x[["type"]] <- type
  d3p
}

#' @export
d3po_data <- function(d3p, data = NULL, sum = NULL, nodes = NULL, edges = NULL, coords = NULL, text = NULL) {
  stopifnot(
    is.null(data) | is.data.frame(data),
    is.null(nodes) | is.data.frame(nodes),
    is.null(edges) | is.data.frame(edges)
  )

  d3p$x[["coords"]] <- coords
  d3p$x[["data"]] <- data
  d3p$x[["edges"]] <- edges
  d3p$x[["nodes"]] <- nodes
  d3p$x[["sum"]] <- sum
  d3p$x[["text"]] <- text
  d3p
}

#' @export
d3po_group_by <- function(d3p, group_by = NULL) {
  d3p$x[["group_by"]] <- group_by
  d3p
}

#' @export
d3po_color <- function(d3p, color = NULL) {
  d3p$x[["color"]] <- color
  d3p
}

#' @export
d3po_labels <- function(d3p, ...) {
  d3p$x$labels <- list(...)
  d3p
}

#' @export
d3po_icon <- function(d3p, ...) {
  d3p$x$icon <- list(...)
  d3p
}

#' @export
d3po_legend <- function(d3p, ...) {
  d3p$x$legend <- list(...)
  d3p
}

#' @export
d3po_axis <- function(d3p, x = NULL, y = NULL) {
  d3p$x[["xaxis"]] <- x
  d3p$x[["yaxis"]] <- y
  d3p
}

#' @export
d3po_depth <- function(d3p, depth = 0) {
  d3p$x[["depth"]] <- depth
  d3p
}

#' @export
d3po_focus <- function(d3p, focus = NULL) {
  d3p$x[["focus"]] <- focus
  d3p
}

#' @export
d3po_font <- function(d3p, ...) {
  d3p$x$font <- list(...)
  d3p
}

#' @export
d3po_title <- function(d3p, title = NULL) {
  d3p$x[["title"]] <- title
  d3p
}

#' @export
d3po_footer <- function(d3p, footer = NULL) {
  d3p$x[["footer"]] <- footer
  d3p
}

#' @export
d3po_background <- function(d3p, background = NULL) {
  d3p$x[["background"]] <- background
  d3p
}
