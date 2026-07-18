#' @title Aesthetics
#'
#' @description Aesthetics of the chart.
#'
#' @param x x-axis mapping.
#' @param y y-axis mapping.
#' @param ... Other aesthetic mappings. See the 'Aesthetics' section.
#'
#' @section Aesthetics:
#' Valid aesthetics (depending on the geom)
#'
#' - `x`, `y`: cartesian coordinates.
#' - `group`: grouping data.
#' - `subgroup`: subgrouping data (for treemaps).
#' - `name`: name data.
#' - `color`: color of geom.
#' - `size`: size of geom.
#' - `stack`: `TRUE` or `FALSE` to indicate if the geom should be stacked (for bar charts).
#' - `tiling`: "squarify" (default), "dice", "slice", "slice-dice" (for treemaps).
#' - `layout`: "fr", "kk", or any other supported in igraph to set the geom layout (for network charts).
#' - `gradient`: `TRUE` or `FALSE` to indicate if color should be treated as a gradient palette (for geomaps).
#' - `sort`: ordering hint for discrete categories. Accepts one of
#'   `"asc-x"`, `"desc-x"` (sort by the numeric x/value), or
#'   `"asc-y"`, `"desc-y"` (sort by the category/label). Use `"none"` to
#'   keep input order.
#'
#' @export
#' @return Aesthetics for the plots such as axis (x,y), group, color and/or size
daes <- function(x, y, ...) {
  env <- parent.frame()
  exprs <- as.list(match.call())[-1]
  exprs <- lapply(exprs, .new_quosure, env = env)
  aes <- new_aes(exprs, env = env)
  .construct_aesthetics(aes)
}

#' @title Construct aesthetics for re-use
#'
#' @param aes Aesthetic object
#' @param cl Class to assign to output
#'
#' @noRd
#' @keywords internal
.construct_aesthetics <- function(aes, cl = NULL) {
  class <- "daes"
  if (!is.null(cl)) {
    class <- append(class, cl)
  }
  structure(aes, class = c(class, class(aes)))
}

# Minimal base R emulation of rlang quosures: a one-sided formula already
# stores an unevaluated expression together with the environment it should
# be evaluated in (`x[[2]]` and `environment(x)`), so no external package is
# needed to capture and later evaluate user-supplied aesthetic expressions.
.new_quosure <- function(expr, env = parent.frame()) {
  q <- call("~", expr)
  class(q) <- "formula"
  environment(q) <- env
  q
}

.is_quosure <- function(x) {
  inherits(x, "formula") && length(x) == 2
}

.quo_get_expr <- function(x) {
  x[[2]]
}

.is_symbolic <- function(x) {
  is.symbol(x) || is.call(x)
}

.quo_is_symbolic <- function(x) {
  .is_symbolic(.quo_get_expr(x))
}

.eval_quo <- function(x) {
  eval(.quo_get_expr(x), envir = environment(x))
}

.is_bare_atomic <- function(x) {
  !is.null(x) && is.atomic(x) && !is.object(x)
}

.as_label <- function(x) {
  if (.is_quosure(x)) {
    x <- .quo_get_expr(x)
  }
  deparse1(x)
}

# Wrap symbolic objects in quosures but pull out constants out of
# quosures for backward-compatibility
new_aesthetic <- function(x, env = globalenv()) {
  if (.is_quosure(x)) {
    if (!.quo_is_symbolic(x)) {
      x <- .quo_get_expr(x)
    }
    return(x)
  }

  if (.is_symbolic(x)) {
    x <- .new_quosure(x, env = env)
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
    values <- vapply(x, .as_label, character(1))
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
is_daes <- function(x, cl = "daes") {
  aes <- FALSE
  if (inherits(x, cl)) {
    aes <- TRUE
  }
  return(aes)
}

# retrieve aesthetics
get_daes <- function(...) {
  aes <- Filter(is_daes, list(...))

  if (length(aes)) {
    aes[[1]]
  } else {
    list()
  }
}

# mutate aesthetics
mutate_aes <- function(main_aes = NULL, aes = NULL, inherit = TRUE) {
  if (is.null(aes) && isTRUE(inherit)) {
    return(main_aes)
  }

  if (isTRUE(inherit)) {
    # aes overrides main_aes
    main_aes <- main_aes[!names(main_aes) %in% names(aes)]
    combined <- append(aes, main_aes)
    return(combined)
  }

  return(aes)
}

# combine mappings into main
combine_daes <- function(main_daes, daes, inherit_daes = TRUE) {
  if (length(daes) == 0) {
    return(main_daes)
  }

  if (inherit_daes) {
    for (i in 1:length(daes)) {
      c <- names(daes)[[i]]
      main_daes[[c]] <- daes[[i]]
    }
  }

  return(main_daes)
}

#' @title Convert daes to names
#'
#' @param daes Output of [daes()].
#'
#' @noRd
#' @keywords internal
daes_to_columns <- function(daes) {
  Filter(function(x) {
    # Check if it's a bare atomic (scalar value)
    if (.is_bare_atomic(x)) {
      return(FALSE)
    }
    # Check if it's a quosure that evaluates to a scalar
    if (.is_quosure(x)) {
      tryCatch(
        {
          val <- .eval_quo(x)
          return(!.is_bare_atomic(val))
        },
        error = function(e) {
          # If evaluation fails, assume it's a column reference
          return(TRUE)
        }
      )
    }
    return(TRUE)
  }, daes) |>
    lapply(function(x) {
      label <- .as_label(x)
      # Handle .data$column_name syntax
      if (grepl("^\\.data\\$", label)) {
        return(sub("^\\.data\\$", "", label))
      }
      return(label)
    }) |>
    unname() |>
    unlist()
}

#' @title Coordinate to JSON options
#'
#' @param daes Output of [daes()].
#' @param var Variable to retrieve.
#'
#' @noRd
#' @keywords internal
daes_to_opts <- function(daes, var) {
  if (is.null(daes[[var]])) {
    return(NULL)
  }
  if (.is_bare_atomic(daes[[var]])) {
    return(daes[[var]])
  }
  label <- .as_label(daes[[var]])
  # Handle .data$column_name syntax
  if (grepl("^\\.data\\$", label)) {
    return(sub("^\\.data\\$", "", label))
  }
  # Try to evaluate as an expression (for numeric values like -pi/2, or logical like TRUE/FALSE)
  # If it succeeds and returns a scalar, use that; otherwise return the label
  # If the original aesthetic was provided as a quosure (captured expression),
  # evaluate it in its captured environment using .eval_quo(). This
  # ensures that user variables like `my_pal` defined in the calling frame
  # are resolved and returned as atomic vectors (so they can be serialized
  # to JavaScript as palettes).
  if (.is_quosure(daes[[var]])) {
    tryCatch(
      {
        result <- .eval_quo(daes[[var]])
        if (is.atomic(result)) {
          # Convert named vectors to named lists to avoid jsonlite warning
          if (!is.null(names(result))) {
            return(as.list(result))
          }
          return(result)
        }
        return(label)
      },
      error = function(e) {
        return(label)
      }
    )
  }

  # Fallback: try evaluating the label as an expression in the current
  # environment. This mirrors the previous behaviour for simple literal
  # expressions like -pi/2 or TRUE.
  tryCatch(
    {
      result <- eval(parse(text = label))
      if (is.atomic(result)) {
        # Convert named vectors to named lists to avoid jsonlite warning
        if (!is.null(names(result))) {
          return(as.list(result))
        }
        return(result)
      }
      return(label)
    },
    error = function(e) {
      return(label)
    }
  )
}
