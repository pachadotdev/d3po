# d3po: R package for easy interactive D3 visualization with Shiny

<!-- badges: start -->
[![R-CMD-check](https://github.com/pachadotdev/d3po/workflows/R-CMD-check/badge.svg)](https://github.com/pachadotdev/d3po/actions)
<!-- badges: end -->
  
## The Problem

R already features excellent visualization libraries such as D3 (via the r2d3 
package) or plotly, however though those enable the creation of great looking 
visualisations they have very steep learning curves and even sometimes require 
some understanding of JavaScript. 

There is also the **highcharter** package but the underlying JavaScript library 
(Highcharts) is not free for commercial and governmental use. A single user 
license costs around 2,500 USD, something that ONGs cannot always afford.

Another relevant aspect is the lack of easy alternatives to provide 
internalization, something that can be addressed easily in a community project 
due to the variety of languages.

Our intention is to solve those problems by releasing a complete R package under
an open source license (Apache 2.0).

## The proposal

### Overview

The name "d3po" is inspired after r2d3 but also d3po is something that a chilean
will read as "dee three pooh", and "pooh" is a very typical chilean slang. That 
slang reflects the true chilean spirit that copes with earthquakes but in the 
end they build the technology and adapt to the medium constraints.

Rather than starting from scratch, d3po takes many ideas and adapts codes 
from highcharts (just inspiration, not code), echats (excellent library), 
d3plus 1.9.8 (unmaintained, which is very unfortunate) and many posts from
Stackoverflow that were adapted since 2016 to the date.

It is worth mentioning that the most important goal is to provide out-of-the-box
beautiful visualizations with minimum time and coding effort from the final 
user.

At the end of the project d3po will be a new software that can be perceived as 
an intermediate layer between the user and D3 by providing "templates", 
enabling high quality interactive visualizations oriented to and designed to be 
used with **Shiny**.

The focus will remain on the integration with Shiny and Rmarkdown, the 
javascript outcome from this project could nonetheless be used with other tools.

The ultimate aim of the project is to produce a package that:

* Offers perfect integration with Shiny
* Enables downloading the charts in different image formats (png, jpeg, svg)
* Enables downloading the data in different formats (json, csv, xlsx)
* Can produce high quality results with a minimal number of lines of code
* Has internalization with options to render visualizations in english, spanish,
  french and other languages.

### Details
  
The Minimum Viable Product includes these visualization methods and features:

* Automatic resizing, sensitive to internet browser window maximization/
  minimization
* Ability to download the interactive charts in jpeg/png/svg formats to be 
  included in presentations or other media
* Automatic labels text size
* Automatic labels show/hide according to available space (i.e show some labels 
  to avoid breaking margins or overlapping)
* Treemaps
* Line charts
* Column charts (horizontal and vertical)
* Area chart
* Pie/donut chart
* Scatterplots
* Area/distribution chart
* Networks
* Box and whiskers
* Maps
* Gramatically correct translations

The goal is to provide a package that becomes a gold standard for interactive 
visualization and facilitates using Shiny.

As an R package, the idea is to obtain a high quality result to be accepted on 
rOpenSci and then CRAN. It should run on any computer with RStudio and any 
server running Shiny.

We have worked under three goals:

1. Minimum number of dependencies
2. Use %>% to provide a Tidyverse-alike experience
3. Make the internals "hard" and the externals "easy"
