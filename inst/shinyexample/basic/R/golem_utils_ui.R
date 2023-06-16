#' Columns wrappers
#'
#' Wrapper around `column(12, ...)`.
#' `golem::use_utils_ui()` provides more wrappers.
#'
#' @noRd
#'
#' @importFrom shiny column
col_12 <- function(...) {
  column(12, ...)
}

#' List all the Pokemon types in the dataset
#' @noRd
#' @importFrom rlang sym
#' @importFrom dplyr distinct mutate_if pull
#' @importFrom stringr str_to_title
list_types <- function() {
  inp <- d3po::pokemon %>%
    distinct(
      !!sym("type_1")
    ) %>%
    mutate_if(is.factor, as.character) %>%
    pull() %>%
    sort()

  out <- list()

  for (i in seq_along(inp)) {
    out[[i]] <- inp[i]
  }

  names(out) <- str_to_title(inp)

  return(out)
}
