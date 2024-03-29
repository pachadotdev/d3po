% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/api.R
\name{po_line}
\alias{po_line}
\title{Line}
\usage{
po_line(d3po, ..., data = NULL, inherit_daes = TRUE)
}
\arguments{
\item{d3po}{Either the output of \code{\link[=d3po]{d3po()}} or \code{\link[=d3po_proxy]{d3po_proxy()}}.}

\item{...}{Aesthetics, see \code{\link[=daes]{daes()}}.}

\item{data}{Any dataset to use for plot, overrides data passed
to \code{\link[=d3po]{d3po()}}.}

\item{inherit_daes}{Whether to inherit aesthetics previous specified.}
}
\value{
an 'htmlwidgets' object with the desired interactive plot
}
\description{
Plot an line chart.
}
\examples{
# library(dplyr)
# dout <- pokemon \%>\%
#  filter(
#   type_1 == "water"
#  ) \%>\%
#  group_by(type_1, color_1) \%>\%
#  reframe(
#   probability = c(0, 0.25, 0.5, 0.75, 1),
#   quantile = quantile(speed, probability)
#  )

dout <- data.frame(
  type_1 = rep("water", 5),
  color_1 = rep("#6890F0", 5),
  probability = c(0, 0.25, 0.5, 0.75, 1),
  quantile = c(15, 57.25, 70, 82, 115)
)

d3po(dout) \%>\%
  po_line(daes(
    x = probability, y = quantile, group = type_1,
    color = color_1
  )) \%>\%
  po_title("Sample Quantiles for Water Pokemon Speed")
}
