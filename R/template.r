# The function itself just echoes its inputs and outputs to a file called INDEX,
# which is then opened by RStudio when the new project is opened.

#' Create a new d3po templated project
#' @param path The path to create the new project in
#' @export
d3po_template <- function(path = ".") {
  # ensure path exists
  dir.create(path, recursive = TRUE, showWarnings = FALSE)

  # copy files
  file.copy(
    list.files(
      system.file("skeleton", "", package = "d3po"), full.names = TRUE),
    path,
    recursive = TRUE
  )

  # add a basic .gitignore
  writeLines(".Rproj.user", file.path(path, ".gitignore"))

  # add a basid .Rbuildignore
  writeLines("^\\.gitignore$\n^.*\\.Rproj$\n^\\.Rproj\\.user$\n^\\.Rhistory$\n^dev$\n^LICENSE\\.md$", file.path(path, ".Rbuildignore"))

  return(invisible())
}
