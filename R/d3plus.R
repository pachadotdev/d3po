#' d3plus
#'
#' This function provides 'D3Plus' methods from R console
#'
#' @param data D3Plus need explicit specified data objects formatted as JSON, and this parameter passed it from R.
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
#' d3plus() %>% d3p_data(dta) %>% d3p_type("bar")
#' d3plus() %>% d3p_data(dta) %>% d3p_type("hbar")
#' d3plus() %>% d3p_data(dta) %>% d3p_type("area")
#' @export
d3plus <- function(data, width = "100%", height = "100%", elementId = NULL) {
  x <- list()

  # create widget
  htmlwidgets::createWidget(
    name = "d3plus",
    x,
    width = width,
    height = height,
    package = "d3plus",
    elementId = elementId
  )
}

#' Shiny bindings for 'D3Plus'
#'
#' Output and render functions for using D3Plus within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3Plus object
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#
#' @name d3plus-shiny
#'
#' @export
d3plusOutput <- function(outputId, width = "100%", height = "400px") {
  htmlwidgets::shinyWidgetOutput(outputId, "d3plus", width, height, package = "d3plus")
}

#' @rdname d3plus-shiny
#' @export
renderD3plus <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3plusOutput, env, quoted = TRUE)
}
