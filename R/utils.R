#' Get Data
#'
#' Returns the appropriate data.
#'
#' @param x,y Dataframes to choose from.
#'
#' @return Either `x` or `y` is not `NULL`.
#'
#' @noRd
#' @keywords internal
.get_data <- function(x, y) {
  if (!is.null(y)) {
    return(y)
  }
  return(x)
}

#' Build Widget
#'
#' Builds the widget.
#'
#' @inheritParams d3po
#'
#' @noRd
#' @keywords internal
widget_this <- function(x, width = NULL, height = NULL, elementId = NULL) {
  htmlwidgets::createWidget(
    name = "d3po",
    x,
    preRenderHook = .render_d3po,
    width = width,
    height = height,
    package = "d3po",
    sizingPolicy = htmlwidgets::sizingPolicy(
      padding = 5,
      defaultWidth = "100%",
      defaultHeight = 400L
    ),
    elementId = elementId
  )
}

# remove tempdata
# this is important to make sure we don't share
# sensitive data points => only serialize what the user explicitely wants
.render_d3po <- function(d3po) {
  # add key to data
  d3po <- .add_key(d3po)

  # Copy axis labels into the top-level option names expected by the
  # JavaScript renderer. JS looks for `options.xLabel` and `options.yLabel`.
  if (!is.null(d3po$x$axis_labels) && is.list(d3po$x$axis_labels)) {
    if (!is.null(d3po$x$axis_labels$x)) d3po$x$xLabel <- d3po$x$axis_labels$x
    if (!is.null(d3po$x$axis_labels$y)) d3po$x$yLabel <- d3po$x$axis_labels$y
  }

  d3po$x$daes <- NULL
  d3po$x$is_sf <- NULL  # Remove sf flag, not needed in JavaScript
  # Note: we intentionally keep d3po$x$graph (if present) and d3po$x$data.

  return(d3po)
}

.add_key <- function(d3po) {
  if (is.null(d3po$x$data)) {
    return(d3po)
  }

  # group aesthetic already defined
  if (!is.null(d3po$x$group)) {
    return(d3po)
  }

  # add mandatory key
  d3po$x$group <- "d3poKey"
  d3po$x$data[["d3poKey"]] <- row.names(d3po$x$data)

  if (d3po$x$type == "network") {
    d3po$x$nodes[["d3poKey"]] <- row.names(d3po$x$data)
  }

  return(d3po)
}

# checks that a package is installed
check_installed <- function(pkg) {
  has_it <- base::requireNamespace(pkg, quietly = TRUE)

  if (!has_it) {
    stop(sprintf("This function requires the package {%s}", pkg), call. = FALSE)
  }
}

# igraph may return vertices with rows but 0 column
# here we generate proper vertices if that is the case.
get_vertices <- function(vertices) {
  if (ncol(vertices) > 0) {
    return(vertices)
  }

  data.frame(name = 1:nrow(vertices))
}

get_edges <- function(edges) {
  names(edges)[1:2] <- c("source", "target")
  return(edges)
}

#' Fix GeoJSON Coordinate Structure
#'
#' Recursively fixes coordinate arrays from jsonlite nested list format
#' to proper numeric vectors. This handles MultiPolygon structures where
#' coordinates are nested multiple levels deep.
#'
#' @param coords Coordinate structure from jsonlite::fromJSON with simplifyVector=FALSE
#' @return Fixed coordinate structure with proper numeric vector pairs
#'
#' @noRd
#' @keywords internal
fix_coordinates <- function(coords) {
  # Base case: if this is a coordinate point (list with 2 elements that are numeric)
  if (is.list(coords) && length(coords) == 2) {
    # Check if both elements are single numeric values
    if (is.numeric(coords[[1]]) && length(coords[[1]]) == 1 &&
        is.numeric(coords[[2]]) && length(coords[[2]]) == 1) {
      # This is a [x, y] point - convert from [[x], [y]] to c(x, y)
      return(c(coords[[1]], coords[[2]]))
    }
  }
  
  # Recursive case: if this is a list of coordinates, fix each one
  if (is.list(coords)) {
    return(lapply(coords, fix_coordinates))
  }
  
  # If it's already a numeric vector, return as-is
  return(coords)
}
