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
.get_data <- function(x, y){
  if(!is.null(y))
    return(y)
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
widget_this <- function(x, width = NULL, height = NULL, elementId = NULL){
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
  d3po$x$data <- .add_key(d3po$x$data)

  d3po$x$tempdata <- NULL
  d3po$x$daes <- NULL
  return(d3po)
}

.add_key <- function(data){

  if(is.null(data))
    return()

  if(!"d3poKey" %in% names(data))
    data[["d3poKey"]] <- row.names(data)
  
  return(data)
}
