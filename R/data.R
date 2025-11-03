#' @title World Trade 2019 and 2023
#' @description Bilateral trade flows between countries for the years 2019 and 2023.
#'  Trade values are expressed in USD billion dollars.
#' @docType data
#' @name trade
#' @usage trade
#' @format A data frame with 5,223 observations and 8 variables.
#' @section Variables:
#' \itemize{
#'  \item \code{year}: Year of the trade data (2019 or 2023).
#'  \item \code{reporter_continent}: Continent of the reporting country.
#'  \item \code{partner_continent}: Continent of the partner country.
#'  \item \code{reporter}: Name of the reporting country.
#'  \item \code{partner}: Name of the partner country.
#'  \item \code{reporter_iso}: ISO 3166-1 alpha-3 code of the reporting country.
#'  \item \code{partner_iso}: ISO 3166-1 alpha-3 code of the partner country.
#'  \item \code{trade}: Trade value in USD billion dollars. Reporter (importer-side) figures are used.
#' }
#' @source Derived from the UN Comtrade database (\url{https://comtrade.un.org/}).
#' @examples
#' head(trade[trade$year == 2023L & trade$reporter_iso == "gbr", ])
"trade"

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
