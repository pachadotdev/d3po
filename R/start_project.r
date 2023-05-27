# The function itself just echos its inputs and outputs to a file called INDEX,
# which is then opened by RStudio when the new project is opened.
start_project <- function(path, ...) {
  # ensure path exists
  dir.create(path, recursive = TRUE, showWarnings = FALSE)

  # copy files
  file.copy(
    list.files(
      system.file("extdata", "", package = "d3po"), full.names = TRUE),
    path,
    recursive = TRUE
  )

  # add a basic .gitignore
  writeLines(".Rproj.user", file.path(path, ".gitignore"))

  # add a basid .Rbuildignore
  writeLines("^\\.gitignore$\n^.*\\.Rproj$\n^\\.Rproj\\.user$\n^\\.Rhistory$\n^dev$\n^LICENSE\\.md$", file.path(path, ".Rbuildignore"))

  return(invisible())
}
