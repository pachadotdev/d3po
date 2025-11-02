#' @title Subnational Boundaries Map
#' @description Subnational boundaries for the available countries in the 'Natural Earth' repository.
#'  The topology has been simplified for better performance in web visualizations and reduced file size.
#'  Subnational regions include states, provinces, and equivalent administrative divisions.
#' @docType data
#' @name subnational
#' @usage subnational
#' @format An `sf` object with 4,596 observations and 6 variables.
#' @section Variables:
#' \itemize{
#'  \item \code{continent}: Continent name.
#'  \item \code{country}: Country name.
#'  \item \code{region}: Subnational region name.
#'  \item \code{country_iso}: ISO 3166-1 alpha-3 country code.
#'  \item \code{region_iso}: ISO 3166-2 subnational region code.
#'  \item \code{geometry}: Simple feature geometry column.
#' }
#' @source Derived from \url{https://www.naturalearthdata.com/}.
#' @examples
#' subnational[subnational$country_iso == "GBR", ]
"subnational"

#' @title National Boundaries Map
#' @description National boundaries for all countries in the 'Natural Earth' repository.
#'  The topology has been simplified for better performance in web visualizations and reduced file size.
#' @docType data
#' @name national
#' @usage national
#' @format An `sf` object with 202 observations and 4 variables.
#' @section Variables:
#' \itemize{
#'  \item \code{continent}: Continent name.
#'  \item \code{country}: Country name.
#'  \item \code{country_iso}: ISO 3166-1 alpha-3 country code.
#'  \item \code{geometry}: Simple feature geometry column.
#' }
#' @source Derived from \url{https://www.naturalearthdata.com/}.
#' @examples
#' national[national$country_iso == "GBR", ]
"national"
