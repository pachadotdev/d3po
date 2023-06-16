#' d3po
#'
#' This function provides 'd3po' methods from R console
#'
#' @param data d3po need explicit specified data objects formatted as JSON, and this parameter passed it from R.
#' @param elementId Dummy string parameter. Useful when you have two or more charts on the same page.
#' @param width Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param height Same as width parameter.
#' @param ... Aesthetics to pass, see [daes()]
#'
#' @export
#' @return Creates a basic 'htmlwidget' object for simple visualization
d3po <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) UseMethod("d3po")

#' @export
d3po.default <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) {
  x <- list(tempdata = data)

  x$daes <- get_daes(...)

  # serialise rowwise
  attr(x, "TOJSON_ARGS") <- list(dataframe = "rows")

  # create widget
  widget_this(x, width, height, elementId)
}

#' @method d3po igraph
#' @export
d3po.igraph <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) {
  # extract data from igraph object
  graph_df <- igraph::as_data_frame(data, "both")

  x <- list(tempdata = data)

  # group defaults to name as in igraph
  x$group <- "name"

  # default to network
  x$type <- "network"

  # add edges
  # rename source target as expected by d3po
  x$edges <- get_edges(graph_df$edges)

  # nodes are optional in igraph & d3po
  x$data <- get_vertices(graph_df$vertices)

  # get aes as group may be overriden
  x$daes <- get_daes(...)
  if (!is.null(x$daes$group)) {
    x$group <- daes_to_opts(x$daes, "group")
  }

  # serialise rowwise
  attr(x, "TOJSON_ARGS") <- list(dataframe = "rows")

  # create widget
  widget_this(x, width, height, elementId)
}
