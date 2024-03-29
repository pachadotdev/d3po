% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/api.R
\name{po_geomap}
\alias{po_geomap}
\title{Geomap}
\usage{
po_geomap(d3po, ..., data = NULL, map = NULL, inherit_daes = TRUE)
}
\arguments{
\item{d3po}{Either the output of \code{\link[=d3po]{d3po()}} or \code{\link[=d3po_proxy]{d3po_proxy()}}.}

\item{...}{Aesthetics, see \code{\link[=daes]{daes()}}.}

\item{data}{Any dataset to use for plot, overrides data passed
to \code{\link[=d3po]{d3po()}}.}

\item{map}{map to use (i.e., any valid list or topojson file such as \code{maps$south_america} or \code{jsonlite::fromJSON("south_america.topojson", simplifyVector = F)})}

\item{inherit_daes}{Whether to inherit aesthetics previous specified.}
}
\value{
an 'htmlwidgets' object with the desired interactive plot
}
\description{
Plot a geomap
}
\examples{
dout <- map_ids(d3po::maps$asia$japan)
dout$value <- ifelse(dout$id == "TK", 1L, NA)
dout$color <- ifelse(dout$id == "TK", "#bd0029", NA)

d3po(dout) \%>\%
  po_geomap(
    daes(
      group = id, color = color, size = value,
      tooltip = name
    ),
    map = d3po::maps$asia$japan
  ) \%>\%
  po_title("Pokemon was created in the Japanese city of Tokyo")
}
