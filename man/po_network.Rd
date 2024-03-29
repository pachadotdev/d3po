% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/api.R
\name{po_network}
\alias{po_network}
\title{Network}
\usage{
po_network(d3po, ..., data = NULL, inherit_daes = TRUE)
}
\arguments{
\item{d3po}{Either the output of \code{\link[=d3po]{d3po()}} or \code{\link[=d3po_proxy]{d3po_proxy()}}.}

\item{...}{Aesthetics, see \code{\link[=daes]{daes()}}.}

\item{data}{Any dataset to use for plot, overrides data passed
to \code{\link[=d3po]{d3po()}}.}

\item{inherit_daes}{Whether to inherit aesthetics previous specified.}
}
\value{
Appends nodes arguments to a network-specific 'htmlwidgets' object
}
\description{
Draw a network.
}
\examples{
d3po(pokemon_network) \%>\%
  po_network(daes(size = size, color = color, layout = "kk")) \%>\%
  po_title("Connections Between Pokemon Types")
}
