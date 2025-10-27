# D3po

<!-- badges: start -->
[![R-CMD-check](https://github.com/pachadotdev/d3po/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/pachadotdev/d3po/actions/workflows/R-CMD-check.yaml)
[![BuyMeACoffee](https://raw.githubusercontent.com/pachadotdev/buymeacoffee-badges/main/bmc-blue.svg)](https://buymeacoffee.com/pacha)
<!-- badges: end -->

## About

D3po’s goal is to provide out-of-the-box beautiful visualizations with minimum time and coding effort from the final
user. It acts as intermediate layer between the user and Shiny and D3 by providing “templates”, enabling high quality
interactive visualizations.

D3po is essentially a set of templates for D3 version 7.0+ with a permissive licence (Apache 2.0) that can be used in R
and Shiny applications via htmlwidgets.

While this package does not have all the features of highcharter, it aims to be a cost free alternative for it without
imposing a commercial license for NGOs and government use.

If this project is useful for you, please consider supporting its development by buying me a coffee at
<https://buymeacoffee.com/pacha>.

## Installation

You can install the most recent version from the R-Universe:

``` r
install.packages("d3po", repos = "https://pachadotdev.r-universe.dev")
```

Or from GitHub using remotes:

``` r
remotes::install_github("pachadotdev/d3po")
```

## Features

Visualization methods:

- Area
- Box and whiskers (or Boxplot)
- Column
- Donut
- Geographical maps
- Line
- Networks
- Pie / Donut
- Scatterplots
- Treemaps

Enhancements:

- Automatic content resizing
- Downloading the charts in SVG format
- Downloading the charts in PNG format

## Examples

Here is a video showcasing D3po:

<iframe width="560" height="315" src="https://www.youtube.com/embed/6pIq2rJONFQ?si=Ai6NUk-BSyG0MTFv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Please check the vignettes and this comprehensive example Shiny app using Golem: <https://github.com/pachadotdev/d3po/tree/main/examples/d3podemo>.

I have a minimal Shiny app without Golem that I use to debug here: <https://github.com/pachadotdev/d3po/blob/main/examples/simple-shiny-app.R>.

Here is a simple example of a boxplot using the Pokemon dataset included in the package:

```r
library(d3po)

d3po(pokemon, width = 800, height = 600) %>%
  po_box(daes(x = type_1, y = weight, color = color_1)) %>%
  po_labels(title = "Weight Distribution by Type")
```

## Frequently Asked Questions (FAQs)

**Q: Why D3po?**

A: "po" is an idiom used in Chile and people from other Spanish speaking countries find it curious that we add it
   to the end of sentences. The package functions have names like `po_box()`, `po_line()`, etc to reflect this idiom.

**Q: Can I use D3po if I do not use R or Shiny?**

A: Yes, the D3po JavaScript library can be used independently of R and Shiny. Check the `javascript/` folder. You can
   build the JavaScript library using `cd javascript && npm run build` and then include the resulting `dist/d3po.min.js`
   file in your web project.

**Q: Is D3po limited to Shiny applications?**

A: No, D3po can be used in any R Markdown or Quarto document that renders to HTML output or in R scripts.

**Q: Can I change the charts colours, fonts, tooltips, labels, etc?**

A: Yes, D3po provides a variety of options to customize the appearance and behavior of the charts. You can use simple
   HTML tags like `po_tooltip("<b>{pokemon} ({type})")` or use JavaScript for more flexibility as in this example

```r
dout <- aggregate(cbind(count = rep(1, nrow(pokemon))) ~ type_1 + color_1, data = pokemon, FUN = length)
names(dout) <- c("type", "color", "count")

d3po(dout, width = 800, height = 600) %>%
  po_treemap(
    daes(
      size = count, group = type, color = color, tiling = "squarify"
    )
  ) %>%
  po_labels(
    align = "center-middle",
    title = "Share of Pokemon by main type",
    labels = JS(
      "function(percentage, row) {
        var pct = (percentage).toFixed(1) + '%';
        var name = (row && (row.type || row.name)) ? (row.type || row.name) : '';
        var count = row && (row.count != null ? row.count : (row.value != null ? row.value : ''));
        return '<i>' + name + '</i><br/>Count: ' + (count || '') + '<br/>Share: ' + pct;
      }"
    )
  ) %>%
  po_tooltip("<i>Type: {type}</i><br/>Count: {count}")
```
