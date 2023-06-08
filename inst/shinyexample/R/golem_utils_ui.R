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

#' List all the countries in the dataset
#' @noRd
#' @importFrom rlang sym
#' @importFrom dplyr distinct mutate_if
list_countries <- function() {
  out <- list()

  daux <- freedom::category_scores %>%
    distinct(
      !!sym("continent"), 
      !!sym("country_territory")
    ) %>%
    mutate_if(is.factor, as.character)

  continents <- unique(daux$continent)

  for (i in seq_along(continents)) {
    out[[i]] <- daux %>%
      filter(!!sym("continent") == continents[i]) %>%
      pull(!!sym("country_territory"))
  }

  names(out) <- continents

  return(out)
}

#' List all the questions in the dataset
#' @noRd
#' @importFrom rlang sym
#' @importFrom dplyr pull
list_questions <- function() {
  out <- list()

  categories <- unique(freedom::category_scores_items$item_description)

  for (i in seq_along(categories)) {
    daux <- freedom::category_scores_items %>%
      filter(!!sym("item_description") == categories[i]) %>%
      pull(!!sym("sub_item"))

    names(daux) <- freedom::category_scores_items %>%
      filter(!!sym("item_description") == categories[i]) %>%
      pull(!!sym("sub_item_description"))

    out[[i]] <- daux
  }

  names(out) <- categories

  return(out)
}
