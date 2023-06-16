# The function itself just echoes its inputs and outputs to a file called INDEX,
# which is then opened by RStudio when the new project is opened.

#' Create a new d3po templated project
#' @param path The path to create the new project in
#' @export
d3po_template <- function(path) {
  stopifnot(!is.null(path))

  # ensure path exists
  dir.create(path, recursive = TRUE, showWarnings = FALSE)

  # copy files
  file.copy(
    list.files(
      system.file("shinyexample", "", package = "d3po"),
      full.names = TRUE
    ),
    path,
    recursive = TRUE
  )

  # .gitignore
  gitignore <- ".Rproj.user"
  writeLines(gitignore, file.path(path, "basic/.gitignore"))
  writeLines(gitignore, file.path(path, "advanced/.gitignore"))

  # .Rbuildignore
  rbuildignore <- "^\\.gitignore$\n^.*\\.Rproj$\n^\\.Rproj\\.user$\n^\\.Rhistory$\n^dev$\n^LICENSE\\.md$"
  writeLines(rbuildignore, file.path(path, "basic/.Rbuildignore"))
  writeLines(rbuildignore, file.path(path, "advanced/.Rbuildignore"))

  # .Rproj
  rproj <- "Version: 1.0\n\nRestoreWorkspace: Default\nSaveWorkspace: Default\nAlwaysSaveHistory: Default\n\nEnableCodeIndexing: Yes\nUseSpacesForTab: Yes\nNumSpacesForTab: 2\nEncoding: UTF-8\n\nRnwWeave: Sweave\nLaTeX: pdfLaTeX\n\nBuildType: Package\nPackageUseDevtools: Yes\nPackageInstallArgs: --no-multiarch --with-keep.source\nPackageRoxygenize: rd,collate,namespace,vignette"
  writeLines(rproj, file.path(path, "basic/d3pobasicdemo.Rproj"))
  writeLines(rproj, file.path(path, "advanced/d3poadvanceddemo.Rproj"))

  return(invisible())
}
