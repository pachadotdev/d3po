#' Extract the IDs from a Map
#' @param map A map object
#' @return A tibble containing IDs and names
#' @export
#' @examples
#' map <- map_ids(maps$south_america$continent)
map_ids <- function(map) {
  ids <- c()
  names <- c()
  i <- length(ids)
  for (i in seq_along(map$objects$default$geometries)) {
    ids[i] <- map$objects$default$geometries[[i]]$id
    names[i] <- map$objects$default$geometries[[i]]$name
    i <- i + 1
  }
  out <- data.frame(id = ids, name = names)
  out <- out[order(out$id), ]
  class(out) <- c("tbl_df", "tbl", "data.frame")
  return(out)
}
