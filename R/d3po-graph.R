#' Graph
#' 
#' Customise edges and nodes.
#' 
#' @inheritParams po_box
#' @param method The igraph function to compute node positions.
#' 
#' @examples 
#' tr <- igraph::make_tree(40, children = 3, mode = "undirected")
#' 
#' d3po(tr) %>% 
#'  po_layout()
#' 
#' edges <- igraph::as_data_frame(tr, "edges")
#' 
#' d3po(daes(group = "name")) %>% 
#'  po_edges(data = edges)
#' 
#' @name d3po_graph
#' @export
po_nodes <- function(d3po, ..., data = NULL, inherit_daes = TRUE){

  d3po$x$type <- "network"
  d3po$x$group <- "name"

  data <- .get_data(d3po$x$data, data)
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  columns <- daes_to_columns(daes)

  d3po$x$data <- data
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")

  return(d3po) 
}

#' @rdname d3po_graph
#' @export
po_edges <- function(d3po, ..., data = NULL, inherit_daes = TRUE){

  assertthat::assert_that(!is.null(data), msg = "Must pass data to this geom")
  data <- get_edges(data)

  d3po$x$type <- "network"
  
  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  columns <- daes_to_columns(daes)
  d3po$x$edges <- data
  
  return(d3po) 
}

#' @rdname d3po_graph
#' @export
po_layout <- function(d3po, method = igraph::layout_nicely){

  check_installed("igraph")

  layout <- method(d3po$x$tempdata) %>% 
    as.data.frame()

  names(layout) <- c("x", "y")
    
  d3po$x$nodes <- dplyr::bind_cols(d3po$x$data, layout)
  
  return(d3po) 
}