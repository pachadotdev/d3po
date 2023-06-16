
# d3pomapsdemo

<!-- badges: start -->
<!-- badges: end -->

The goal of d3pomapsdemo is to show to visualize something with relative low effort with Shiny+Golem+D3po.

## Installation

You can install the development version of d3po and d3pomaps like so:

``` r
remotes::install_github("pachadotdev/d3po")
remotes::install_github("pachadotdev/d3pomaps")
```

## Example

The next line allows you to run this Shiny app locally:

``` r
d3pomapsdemo::run_app()
```

## Usage

When you modify the headers of any file in `R/` (i.e., when you add an `@importFrom ...`), remember to run `attachment::att_amend_desc()`.

In general I recommend running these commands until your app is polished:

```r
devtools::load_all()
devtools::check()
attachment::att_amend_desc() # if needed
d3podemo::run_app() # eventually change the name of the app to what you need
```

For convenience the `dev/` folder has three scripts:

1. `dev/01_start.R` to modify the app name, license, description, adding unit tests, etc.
2. `dev/02_dev.R` to update the `DESCRIPTION`, add modules, use GitHub Actions, etc.
3. `dev/02_deploy.R` to deploy your app.
