# D3po

<!-- badges: start -->

[![R-CMD-check](https://github.com/pachadotdev/d3po/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/pachadotdev/d3po/actions/workflows/R-CMD-check.yaml)
[![BuyMeACoffee](https://raw.githubusercontent.com/pachadotdev/buymeacoffee-badges/main/bmc-yellow.svg)](https://buymeacoffee.com/pacha)

<!-- badges: end -->

## About

D3po’s goal is to provide out-of-the-box beautiful visualizations with minimum time and coding effort from the final user. It acts as
intermediate layer between the user and Shiny and D3 by providing “templates”, enabling high quality interactive visualizations.

D3po is essentially a set of templates for D3 version 7.0+ with a permissive licence (Apache 2.0) that can be used in R and Shiny applications via htmlwidgets.

While this package does not have all the features of highcharter, it aims to be a cost free alternative for it without imposing a
commercial license for NGOs and government use.

If this project is useful for you, please consider supporting its development by buying me a coffee at <https://buymeacoffee.com/pacha>.

## Features

Visualization methods:

- [x] Area (or distribution) chart
- [x] Box and whiskers
- [x] Column charts (horizontal and vertical)
- [x] Donut chart
- [x] Geographical maps
- [x] Line charts
- [x] Networks
- [x] Pie chart
- [x] Scatterplots
- [x] Treemaps

Enhancements:

- [x] Automatic content resizing
- [x] Downloading the charts in SVG format
- [x] Downloading the charts in PNG format

## Installation

You can install the most recent version from the R-Universe:

``` r
install.packages("d3po", repos = "https://pachadotdev.r-universe.dev")
```

Or from GitHub using remotes:

``` r
remotes::install_github("pachadotdev/d3po")
```

## Examples

Here is a video of all the current features of D3po:

<iframe width="560" height="315" src="https://www.youtube.com/embed/6pIq2rJONFQ?si=Ai6NUk-BSyG0MTFv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

This is an example consisting in the creation of a box and whiskers plot:

``` r
d3po(pokemon) %>%
  po_box(daes(x = type_1, y = speed, color = color_1)) %>%
  po_title("Distribution of Pokemon speed by main type")
```

Please check the vignettes and this comprehensive example Shiny app using Golem: <https://github.com/pachadotdev/d3po/tree/main/d3podemo>.
