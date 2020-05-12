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
#'
#' @examples
#' dta <- data.frame(
#'   id = c("alpha", "alpha", "alpha", "beta", "beta", "beta"),
#'   x = c(4, 5, 6, 4, 5, 6),
#'   y = c(7, 25, 13, 7, 8, 13)
#' )
#'
#' d3po() %>%
#'   d3po_data(dta) %>%
#'   d3po_type("bar")
#' d3po() %>%
#'   d3po_data(dta) %>%
#'   d3po_type("hbar")
#' d3po() %>%
#'   d3po_data(dta) %>%
#'   d3po_type("area")
#' @export
d3po <- function(data = NULL, width = "100%", height = "100%", elementId = NULL) {
  x <- list(tempdata = data)

  # create widget
  htmlwidgets::createWidget(
    name = "d3po",
    x,
    preRenderHook = .render_d3po, # add pre render hook (below) to remove data
    width = width,
    height = height,
    package = "d3po",
    elementId = elementId
  )
}

# remove tempdata
# this is important to make sure we don't share
# sensitive data points => only serialize what the user explicitely wants
.render_d3po <- function(d3po) {
  d3po$x$tempdata <- NULL
  d3po$x$data <- purrr::transpose(d3po$x$data)
  return(d3po)
}

#' Shiny bindings for 'd3po'
#'
#' Output and render functions for using d3po within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a d3po object
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#' @param id Id of
#
#' @name d3po-shiny
#'
#' @export
d3po_output <- function(output_id, width = "100%", height = "100%") {
  htmlwidgets::shinyWidgetOutput(output_id, "d3po", width, height, package = "d3po")
}

#' @rdname d3po-shiny
#' @export
render_d3po <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3po_output, env, quoted = TRUE)
}

#' @rdname d3po-shiny
#' @export
d3po_proxy <- function(id, session = shiny::getDefaultReactiveDomain()) {
  proxy <- list(id = id, session = session)
  class(proxy) <- "d3proxy"

  return(proxy)
}
