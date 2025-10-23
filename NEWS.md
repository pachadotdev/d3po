# d3po 1.0.0

* Option to show/hide the download buttons.
* Allows to customize background color and font.
* Fully responsive to window size changes.
* Zoomable maps and networks.
* The examples use base R.
* Added full Shiny and Golem example app in the `d3podemo` folder.
* Added minimal Shiny example for debugging without Golem in `debug-with-shiny.R`.
* Migrated to D3 7.9.0.
* Minimal codebase.

# d3po 0.5.5

* Back to the pokemon dataset to provide simple examples.
* All the maps were moved back to the package to reduce dependencies.
* All the examples use final data frames and the dplyr codes are commented.

# d3po 0.5.3

* Moves Freedom House data to https://github.com/pachadotdev/freedom.
* The shiny template includes common Shiny tricks and good practice.

# d3po 0.5.2

* Provides Freedom House data for the examples and drops the Pokemon dataset.
* Includes Shiny project template.
* Maps were moved to the side package `d3pomaps`.

# d3po 0.4.5

* Provides maps directly as R-formatted lists, and not as topjson files in inst/

# d3po 0.4.0

* Heavily simplifies plotting graph/network objects
* Allows to plot donuts and geographic maps

# d3po 0.3.3

* Added a `NEWS.md` file to track changes to the package.
* Added background options and font customization for labels and title. These
  function pass default values to maintain compatibility with previous version.

# d3po 0.3.2

* First release on CRAN.
