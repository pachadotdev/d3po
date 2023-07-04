# d3pbasicdemo

<!-- badges: start -->
<!-- badges: end -->

The goal of d3pbasicdemo is to show to visualize something complicated with relative low effort with Shiny+Golem+D3po.

## Installation

You can install the development version of d3po like so:

```r
remotes::install_github("pachadotdev/d3po")
```

Or the stable version like so:

```r
install.packages("d3po")
```

Then follow the instructions to create a templated project from the [main readme](https://github.com/pachadotdev/d3po/tree/main#examples).

## Example

The next line allows you to run this Shiny app locally:

```r
d3pbasicdemo::run_app()
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
