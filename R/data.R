#' Freedom House Country and Territory Ratings and Statuses, 1973-2023
#'
#' For each country and territory, Freedom in the World analyzes the electoral process,
#' political pluralism and participation, the functioning of the government, freedom of
#' expression and of belief, associational and organizational rights, the rule of law, 
#' and personal autonomy and individual rights.
#'
#' @section Variables:
#'
#' \itemize{
#'  \item \code{year}: Year of observation (1973-2023).
#'  \item \code{country}: Country name.
#'  \item \code{iso2c}: ISO 2-character country code. Czechoslovakia, Kosovo, Micronesia,
#'   Serbia and Montenegro, and Yugoslavia do not have unambiguous matches and appear as 'NA'.
#'  \item \code{iso3c}: ISO 3-character country code. Czechoslovakia, Kosovo, Micronesia,
#'   Serbia and Montenegro, and Yugoslavia do not have unambiguous matches and appear as 'NA'.
#'  \item \code{continent}: Continent name.
#'  \item \code{year}: Year of observation (1973-2023).
#'  \item \code{political_rights}: Political rights score (1-7 scale, with one representing the 
#'   highest degree of Freedom and seven the lowest).
#'  \item \code{civil_liberties}: Civil liberties score (1-7 scale, with one representing the 
#'   highest degree of Freedom and seven the lowest).
#'  \item \code{status}: Status of the country (Free, Partly Free, Not Free).
#'  \item \code{color}: Color associated with the status of the country.
#' }
#'
#' @docType data
#' @name freedom_house
#' @usage freedom_house
#' @format A \code{data frame} with 9,044 observations and 5 variables.
#' @source Adapted from Freedom House.
"freedom_house"

#' Trade Network Coloured by Freedom House Status
#'
#' Connections between countries correspond to the strongest arcs based on the products they export.
#' The network was trimmed until obtaining an average of four arcs per node.
#'
#' @docType data
#' @name freedom_house_network
#' @usage freedom_house_network
#' @format A \code{igraph} object with 190 vertices (nodes) and 316 edges (arcs).
#' @source Adapted from the United Nations (trade volumes) and Freedom House (freedom information).
"freedom_house_network"
