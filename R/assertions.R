#' Checks that aesthetics exist
#' 
#' @param x Object to check for aesthetics.
#' 
#' @noRd 
#' @keywords internal
has_daes <- function(x){
  if(is.null(x))
    return(FALSE)
  if(!length(x))
    return(FALSE)
  return(TRUE)
}

#' @noRd 
#' @keywords internal
assertthat::on_failure(has_daes) <- function(call, env) {
  "No coordinates found, see `coords`."
}