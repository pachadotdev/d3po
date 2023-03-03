
<!-- README.md is generated from README.Rmd. Please edit that file -->

# D3po

<!-- badges: start -->
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
- [ ] Donut chart
- [ ] Geographical maps
- [ ] Half-pie chart
- [ ] Half-donut chart
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
- [ ] Downloading the data in XLSX format
- [ ] Downloading the data in CSV/TSV format
- [ ] Providing internatilization options (i.e., numbers as 1.234.567,89
  instead of 1,234,567.89 in Spanish or French).
- [x] Producing high quality results with a minimal number of lines of
  code

## Installation

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
  po_box(daes(x = type_1, y = speed, group = name, color = color_1)) %>%
  po_title("Distribution of Pokemon Speed by Type")
```

In the `shinydemo` directory
(<https://github.com/pachadotdev/d3po/tree/master/shinydemo>) there is a
fully worked example with Shiny for all the available visualization
types in the package.
