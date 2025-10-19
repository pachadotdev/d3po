#' pokemon
#'
#' Statistical information about 151 Pokemon from Nintendo RPG series.
#'
#' @section Variables:
#'
#' \itemize{
#'  \item \code{id}: Pokedex number.
#'  \item \code{name}: Pokedex name.
#'  \item \code{height}: Height in meters.
#'  \item \code{weight}: Weight in kilograms.
#'  \item \code{base_experience}: How much the Pokemon has battled.
#'  \item \code{type_1}: Primary Pokemon type (i.e. Grass, Fire and Water)
#'  \item \code{type_2}: Secondary Pokemon type (i.e. Poison, Dragon and Ice)
#'  \item \code{attack}: How much damage a Pokemon deals when using a technique.
#'  \item \code{defense}: How much damage a Pokemon receives when it is hit by a technique.
#'  \item \code{hp}: How much damage a Pokemon can receive before fainting.
#'  \item \code{special_attack}: How much damage a Pokemon deals when using a special technique.
#'  \item \code{special_defense}: How much damage a Pokemon receives when it is hit by a special technique.
#'  \item \code{speed}: Determines the order of Pokemon that can act in battle, if the speed is tied then the 1st move is assigned at random.
#'  \item \code{color_1}: Hex color code for Type 1.
#'  \item \code{color_2}: Hex color code for Type 2.
#' }
#'
#' @docType data
#' @name pokemon
#' @usage pokemon
#' @format A \code{data frame} with 151 observations and 15 variables.
#' @source Adapted from \code{highcharter} package.
"pokemon"

#' pokemon_network
#'
#' Connections between Pokemon types based on Type 1 and 2.
#'
#' @docType data
#' @name pokemon_network
#' @usage pokemon_network
#' @format A \code{igraph} object with 17 vertices (nodes) and 26 edges (arcs).
#' @source Adapted from the \code{highcharter} package.
"pokemon_network"

#' maps
#'
#' World, continent and country maps. These maps are provided as R lists
#' structured by following the 'topojson' standard. The maps are organized in
#' sub-lists by continent and here I provide maps for both the continents and
#' the countries. There are missing states or regions because those could not be
#' found in the original maps.
#'
#' Missing in Asia: 'Siachen Glacier (JK)', 'Scarborough Reef (SH)', and
#' 'Spratly Islands (SP)'. Missing in Europe: 'Vatican City (VA)'.
#'
#' Missing in North America: 'Bajo Nuevo Bank (BU)', 'Serranilla Bank (SW)', and
#' 'United States Minor Outlying Islands (UM)'.
#'
#' Missing in Oceania: 'Federated States of Micronesia (FM)',
#' 'Marshall Islands (MH)', and 'Tuvalu (TV)'.
#'
#' Consider all these maps as referential and unofficial.
#'
#' @docType data
#' @name maps
#' @usage maps
#' @format A \code{list} object with 6 elements (one per continent). The Americas are separated in North America and South America.
#' @source Adapted from Natural Earth.
"maps"
