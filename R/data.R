#' pokemon
#'
#' Statistical information about 718 Pokemon from Nintendo RPG series.
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
#' @format A \code{data frame} with 718 observations and 15 variables.
#' @source Adapted from \code{highcharter} package.
"pokemon"