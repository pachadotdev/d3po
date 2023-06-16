# D3po

<!-- badges: start -->

[![R-CMD-check](https://github.com/pachadotdev/d3po/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/pachadotdev/d3po/actions/workflows/R-CMD-check.yaml)
<!-- badges: end -->

## Methods and features

D3po’s goal is to provide out-of-the-box beautiful visualizations with
minimum time and coding effort from the final user. It acts as
intermediate layer between the user and Shiny and D3 by providing
“templates”, enabling high quality interactive visualizations.

D3po methods:

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

D3po features:

- [x] Automatic content resizing, sensitive to internet browser window
  maximization/minimization
- [x] Downloading the charts in SVG format
- [x] Downloading the charts in PNG format
- [x] Downloading the charts in JPEG format
- [ ] Providing internatilization options (i.e., numbers as 1.234.567,89
  instead of 1,234,567.89 in Spanish or French).
- [x] Producing high quality results with a minimal number of lines of
  code

## Installation

You can install the stable version from
[CRAN](https://cran.r-project.org/) with:

``` r
install.packages("d3po")
```

You can install the development version of d3po from
[GitHub](https://github.com/) with:

``` r
# install.packages("devtools")
devtools::install_github("pachadotdev/d3po")
```

## Examples

This is an example consisting in the creation of a box and whiskers
plot:

``` r
d3po(pokemon) %>%
  po_box(daes(x = type_1, y = speed, color = color_1)) %>%
  po_title("Distribution of Pokemon speed by main type")
```

To access a templated project, in RStudio's top bar click *File -> New Project -> New Directory -> Shiny app with Golem+D3po*. Otherwise, start with a blank project and run `d3po::d3po_template()` to copy the same templates.

You can install the templated projects as any other R package. The templates have their own readme files, so please read them.

## Vignette

Please (*please!*) read the vignette (<https://github.com/pachadotdev/d3po/blob/main/vignettes/d3po.Rmd>).
