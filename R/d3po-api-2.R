#' Aesthetics
#' 
#' Aesthetics of the chart.
#' 
#' @param x,y,... List of name value pairs giving aesthetics to map to
#'  variables. The names for x and y aesthetics are typically omitted because
#'  they are so common; all other aspects must be named.
#' 
#' @export
daes <- function(lat, lon, ...) {
  exprs <- rlang::enquos(lat = lat, lon = lon, ..., .ignore_empty = "all")
  aes <- new_aes(exprs, env = parent.frame())
  .construct_aesthetics(aes)
}

# construct aesthetics for re-use
.construct_aesthetics <- function(aes, cl = NULL){
  class <- "daes"
  if(!is.null(cl))
    class <- append(class, cl)
  structure(aes, class = c(class, class(aes)))
}

# Wrap symbolic objects in quosures but pull out constants out of
# quosures for backward-compatibility
new_aesthetic <- function(x, env = globalenv()) {
  if (rlang::is_quosure(x)) {
    if (!rlang::quo_is_symbolic(x)) {
      x <- rlang::quo_get_expr(x)
    }
    return(x)
  }

  if (rlang::is_symbolic(x)) {
    x <- rlang::new_quosure(x, env = env)
    return(x)
  }

  x
}

new_aes <- function(x, env = globalenv()) {
  stopifnot(is.list(x))
  x <- lapply(x, new_aesthetic, env = env)
  structure(x, class = c("uneval"))
}

#' @export
print.uneval <- function(x, ...) {
  cat("Aesthetics: \n")

  if (length(x) == 0) {
    cat("<empty>\n")
  } else {
    values <- vapply(x, rlang::quo_label, character(1))
    bullets <- paste0("* ", format(paste0("`", names(x), "`")), " -> ", values, "\n")

    cat(bullets, sep = "")
  }

  invisible(x)
}

#' @export
"[.uneval" <- function(x, i, ...) {
  new_aes(NextMethod())
}

# If necessary coerce replacements to quosures for compatibility
#' @export
"[[<-.uneval" <- function(x, i, value) {
  new_aes(NextMethod())
}
#' @export
"$<-.uneval" <- function(x, i, value) {
  # Can't use NextMethod() because of a bug in R 3.1
  x <- unclass(x)
  x[[i]] <- value
  new_aes(x)
}
#' @export
"[<-.uneval" <- function(x, i, value) {
  new_aes(NextMethod())
}

# is aesthetic?
is_daes <- function(x, cl = "daes"){
  aes <- FALSE
  if(inherits(x, cl))
    aes <- TRUE
  return(aes)
}

# retrieve aesthetics
get_daes <- function(...){
  aes <- list(...) %>% 
    purrr::keep(is_daes) 

  if(length(aes))
    aes[[1]]
  else
    list()
}

# mutate aesthetics
mutate_aes <- function(main_aes = NULL, aes = NULL, inherit = TRUE){

  if(is.null(aes) && isTRUE(inherit))
    return(main_aes)

  if(isTRUE(inherit)){
    # aes overrides main_aes
    main_aes <- main_aes[!names(main_aes) %in% names(aes)]
    combined <- append(aes, main_aes)
    return(combined)
  }

  return(aes)
}

# combine mappings into main
combine_daes <- function(main_daes, daes, inherit_daes = TRUE){
  if(inherit_daes){
    for(i in 1:length(daes)){
      c <- names(daes)[[i]]
      main_daes[[c]] <- daes[[i]]
    }
  } else {
    main_daes <- daes
  }
  return(main_daes)
}

# conver to name for selection
daes_to_columns <- function(daes){
  purrr::keep(daes, function(x){
    !rlang::is_bare_atomic(x)
  }) %>% 
    purrr::map(rlang::as_label) %>% 
    unname() %>% 
    unlist()
}

# coordinate to JSON options
daes_to_opts <- function(daes, var){
  if(rlang::is_null(daes[[var]]))
    return(NULL)
  if(rlang::is_bare_atomic(daes[[var]]))
    return(daes[[var]])
  rlang::as_label(daes[[var]])
}

# internal function
.get_data <- function(x, y){
  if(!is.null(y))
    return(y)
  return(x)
}

# internal check with assertthat
has_daes <- function(x){
  if(is.null(x))
    return(FALSE)
  if(!length(x))
    return(FALSE)
  return(TRUE)
}

assertthat::on_failure(has_daes) <- function(call, env) {
  "No coordinates found, see `coords`."
}

#' Boxplot
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
  d3po$x$xaxis <- daes_to_opts(daes, "x")
  d3po$x$yaxis <- daes_to_opts(daes, "y")
  d3po$x$id <- daes_to_opts(daes, "group")

  # see js file to understand
  d3po$x$d3convert <- FALSE 

  return(d3po)
}

#' Treemap plot
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
  d3po$x$sum <- daes_to_opts(daes, "sum")
  d3po$x$group_by <- daes_to_opts(daes, "groupBy")
  d3po$x$color <- daes_to_opts(daes, "color")
  
  # see js file to understand
  d3po$x$d3convert <- FALSE 
  
  return(d3po)
}

#' Bar plot
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
  
  # see js file to understand
  d3po$x$d3convert <- FALSE 
  
  return(d3po)
}

#' Box and Whisker plot
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
  
  # see js file to understand
  d3po$x$d3convert <- FALSE 
  
  return(d3po)
}

#' Title
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
