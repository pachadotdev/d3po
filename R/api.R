# Box ----

#' @title Boxplot
#'
#' @description Draw a boxplot.
#'
#' @param d3po Either the output of [d3po()] or [d3po_proxy()].
#' @param ... Aesthetics, see [daes()].
#' @param data Any dataset to use for plot, overrides data passed
#' to [d3po()].
#' @param inherit_daes Whether to inherit aesthetics previous specified.
#'
#' @examples
#' if (interactive()) {
#'   # Vertical box plot
#'   d3po(pokemon) %>%
#'     po_box(daes(x = type_1, y = weight, color = color_1)) %>%
#'     po_labels(title = "Weight Distribution by Type")
#'
#'   # Horizontal box plot
#'   d3po(pokemon) %>%
#'     po_box(daes(x = height, y = type_1, color = color_1)) %>%
#'     po_labels(title = "Height Distribution by Type")
#'
#'   # Log-transformed distribution
#'   pokemon$log_weight <- log10(pokemon$weight)
#'   d3po(pokemon) %>%
#'     po_box(daes(x = type_1, y = log_weight, color = color_1)) %>%
#'     po_labels(title = "Log(Weight) Distribution by Type")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_box <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_box")

#' @export
#' @method po_box d3po
po_box.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "box"

  # Prefer attributes already present on the widget under `x$data`.
  # For SF objects `d3po.sf` is expected to populate `x$data` (attributes)
  # and `x$map` (topojson). If caller passed `data` explicitly, use it to
  # override `x$data`.
  if (!is.null(data)) {
    attrs <- data
  } else {
    attrs <- d3po$x$data
  }

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)
  if (is.null(attrs)) {
    stop("po_geomap requires attribute data (x$data) to be present. Please call d3po() with an sf object or supply `data` to po_geomap().")
  }

  # Select only requested columns from attribute table; ensure result is a
  # plain data.frame (not a tibble with sfc etc.).
  d3po$x$data <- as.data.frame(dplyr::select(attrs, columns))
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$stack <- daes_to_opts(daes, "stack")

  return(d3po)
}

#' @export
#' @method po_box d3proxy
po_box.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-box", msg)

  return(d3po)
}

# Treemap ----

#' @title Treemap
#'
#' @description Plot a treemap
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   dout <- aggregate(pokemon$name, by = list(
#'     type = pokemon$type_1,
#'     color = pokemon$color_1
#'   ), FUN = length)
#'
#'   colnames(dout)[3] <- "count"
#'
#'   d3po(dout) %>%
#'     po_treemap(daes(size = count, group = type, color = color, tiling = "squarify")) %>%
#'     po_labels(title = "Share of Pokemon by main type")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_treemap <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_treemap")

#' @export
#' @method po_treemap d3po
po_treemap.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "treemap"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$subgroup <- daes_to_opts(daes, "subgroup")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$tiling <- daes_to_opts(daes, "tiling")

  return(d3po)
}

#' @export
#' @method po_treemap d3proxy
po_treemap.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-treemap", msg)

  return(d3po)
}

# Pie ----

#' @title Pie
#'
#' @description Plot a pie
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   dout <- aggregate(pokemon$name, by = list(
#'     type = pokemon$type_1,
#'     color = pokemon$color_1
#'   ), FUN = length)
#'
#'   colnames(dout)[3] <- "count"
#'
#'   d3po(dout) %>%
#'     po_pie(daes(
#'       size = count, group = type, color = color,
#'       innerRadius = 0, startAngle = 0, endAngle = 2 * pi
#'     )) %>%
#'     po_labels(title = "Share of Pokemon by main type")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_pie <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_pie")

#' @export
#' @method po_pie d3po
po_pie.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "pie"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$innerRadius <- daes_to_opts(daes, "innerRadius")
  d3po$x$startAngle <- daes_to_opts(daes, "startAngle")
  d3po$x$endAngle <- daes_to_opts(daes, "endAngle")

  return(d3po)
}

#' @export
#' @method po_pie d3proxy
po_pie.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-pie", msg)

  return(d3po)
}

# Donut ----

#' @title Donut
#'
#' @description Plot a donut
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   dout <- aggregate(pokemon$name, by = list(
#'     type = pokemon$type_1,
#'     color = pokemon$color_1
#'   ), FUN = length)
#'
#'   colnames(dout)[3] <- "count"
#'
#'   d3po(dout) %>%
#'     po_donut(daes(
#'       size = count, group = type, color = color,
#'       innerRadius = 0.4, startAngle = 0, endAngle = 2 * pi
#'     )) %>%
#'     po_labels(title = "Share of Pokemon by main type")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_donut <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_donut")

#' @export
#' @method po_donut d3po
po_donut.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "donut"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$innerRadius <- daes_to_opts(daes, "innerRadius")
  d3po$x$startAngle <- daes_to_opts(daes, "startAngle")
  d3po$x$endAngle <- daes_to_opts(daes, "endAngle")

  return(d3po)
}

#' @export
#' @method po_donut d3proxy
po_donut.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-donut", msg)

  return(d3po)
}

# Area ----

#' @title Area
#'
#' @description Plot an area chart.
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   dout <- pokemon[pokemon$name %in% c(
#'     "Squirtle", "Wartortle", "Blastoise",
#'     "Charmander", "Charmeleon", "Charizard",
#'     "Pikachu", "Raichu"
#'   ), c("height", "weight", "type_1", "color_1")]
#'
#'   colnames(dout) <- c("height", "weight", "type", "color")
#'
#'   d3po(dout) %>%
#'     po_area(daes(
#'       x = height, y = weight, group = type, color = color
#'     )) %>%
#'     po_labels(title = "Pokemon Evolution: Weight vs Height by Type")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_area <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_area")

#' @export
#' @method po_area d3po
po_area.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "area"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$stack <- daes_to_opts(daes, "stack")

  return(d3po)
}

#' @export
#' @method po_area d3proxy
po_area.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-area", msg)

  return(d3po)
}

# Bar ----

#' @title Bar
#'
#' @description Draw a bar chart.
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   dout <- aggregate(pokemon$name, by = list(
#'     type = pokemon$type_1,
#'     color = pokemon$color_1
#'   ), FUN = length)
#'
#'   colnames(dout)[3] <- "count"
#'
#'   # Vertical bars
#'   d3po(dout) %>%
#'     po_bar(daes(x = type, y = count, color = color)) %>%
#'     po_labels(title = "Vertical Bars")
#'
#'   # Horizontal bars (flipped axes)
#'   d3po(dout) %>%
#'     po_bar(daes(x = count, y = type, color = color)) %>%
#'     po_labels(title = "Horizontal Bars")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_bar <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_bar")

#' @export
#' @method po_bar d3po
po_bar.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "bar"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  # optional: sorting hint passed via daes, e.g. "desc-x" or "asc-y".
  # Supported values:
  # - "asc-x" / "desc-x": sort categories by the numeric x/value (ascending/descending)
  # - "asc-y" / "desc-y": sort categories by label/name (ascending/descending)
  # - "none": keep the input order (default)
  d3po$x$sort <- daes_to_opts(daes, "sort")
  # stacking option: read directly from daes() if provided; otherwise leave NULL
  d3po$x$stack <- daes_to_opts(daes, "stack")

  return(d3po)
}

#' @export
#' @method po_bar d3proxy
po_bar.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  # Do not accept explicit `stack` param for proxy; stack should be passed via daes() only
  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-bar", msg)

  return(d3po)
}

# Line ----

#' @title Line
#'
#' @description Plot an line chart.
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   dout <- pokemon[pokemon$name %in% c(
#'     "Squirtle", "Wartortle", "Blastoise",
#'     "Charmander", "Charmeleon", "Charizard",
#'     "Pikachu", "Raichu"
#'   ), c("height", "weight", "type_1", "color_1")]
#'
#'   colnames(dout) <- c("height", "weight", "type", "color")
#'
#'   d3po(dout) %>%
#'     po_line(daes(
#'       x = height, y = weight, group = type, color = color
#'     )) %>%
#'     po_labels(title = "Pokemon Evolution: Weight vs Height by Type")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_line <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_line")

#' @export
#' @method po_line d3po
po_line.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "line"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")

  return(d3po)
}

#' @export
#' @method po_line d3proxy
po_line.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-line", msg)

  return(d3po)
}

# Scatter ----

#' @title Scatter
#'
#' @description Plot an scatter chart.
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   # Unweighted scatter plot
#'   d3po(pokemon) %>%
#'     po_scatter(daes(
#'       x = height, y = weight, group = name, color = color_1
#'     )) %>%
#'     po_labels(title = "Height vs Weight")
#'
#'   # Log-transformed scatter plot
#'   pokemon$log_height <- log10(pokemon$height)
#'   pokemon$log_weight <- log10(pokemon$weight)
#'
#'   d3po(pokemon) %>%
#'     po_scatter(daes(
#'       x = log_height, y = log_weight, group = name, color = color_1
#'     )) %>%
#'     po_labels(title = "Log(Height) vs Log(Weight)")
#'
#'   # Weighted scatterplot by inverse distance from mean
#'   mean_weight <- mean(pokemon$weight, na.rm = TRUE)
#'   mean_height <- mean(pokemon$height, na.rm = TRUE)
#'
#'   pokemon$distance_from_mean_weight <- abs(pokemon$weight - mean_weight)
#'   pokemon$distance_from_mean_height <- abs(pokemon$height - mean_height)
#'
#'   pokemon$avg_distance <- (pokemon$distance_from_mean_weight +
#'     pokemon$distance_from_mean_height) / 2
#'
#'   pokemon$inverse_distance_from_mean <- 1 / (pokemon$avg_distance + 0.01)
#'
#'   d3po(pokemon) %>%
#'     po_scatter(daes(
#'       x = height, y = weight, size = inverse_distance_from_mean,
#'       group = name, color = color_1
#'     )) %>%
#'     po_labels(title = "Height vs Weight (Size = 1 / Distance from the Mean)")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_scatter <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_scatter")

#' @export
#' @method po_scatter d3po
po_scatter.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # defaults
  d3po$x$type <- "scatter"

  data <- .get_data(d3po$x$data, data)

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  d3po$x$data <- dplyr::select(data, columns)
  d3po$x$x <- daes_to_opts(daes, "x")
  d3po$x$y <- daes_to_opts(daes, "y")
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")

  return(d3po)
}

#' @export
#' @method po_scatter d3proxy
po_scatter.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-scatter", msg)

  return(d3po)
}




# Tooltip ----

#' @title Tooltip
#'
#' @description Set a custom tooltip template for a chart. The template can be a literal
#' string (e.g. `<b>{name}</b><br>Value: {value}`) which will be evaluated
#' server-side by substituting column values.
#'
#' @inheritParams po_box
#' @param template A character string template or formatter expression.
#' @export
#' @return Appends tooltip settings to an 'htmlwidgets' object
po_tooltip <- function(d3po, template) UseMethod("po_tooltip")

#' @export
#' @method po_tooltip d3po
po_tooltip.d3po <- function(d3po, template) {
  assertthat::assert_that(!missing(template), msg = "Missing `template`")

  # store template on the widget object for use by the javascript renderer
  d3po$x$tooltip_template <- template
  return(d3po)
}

#' @export
#' @method po_tooltip d3proxy
po_tooltip.d3proxy <- function(d3po, template) {
  assertthat::assert_that(!missing(template), msg = "Missing `template`")

  msg <- list(id = d3po$id, msg = list(template = template))

  d3po$session$sendCustomMessage("d3po-tooltip", msg)

  return(d3po)
}


# Format ----

#' @title Format
#'
#' @description Precompute formatted label columns from expressions and attach them to the
#' widget data. Accepts named expressions like `x = round(varx, 2)` or
#' `y = format(varY, big.mark = ",")`. The formatted columns are added to
#' `d3po$x$data` with names `__label_<name>` and registered in
#' `d3po$x$formatted_cols` for the renderer to use.
#'
#' @inheritParams po_box
#' @param ... Named formatting expressions (as quosures). Each name should
#' correspond to an aesthetic (e.g. `x`, `y`, `tooltip`, etc.).
#' @export
po_format <- function(d3po, ...) UseMethod("po_format")

#' @export
#' @method po_format d3po
po_format.d3po <- function(d3po, ...) {
  formats <- rlang::quos(...)
  assertthat::assert_that(length(formats) > 0, msg = "No formatters provided to po_format()")

  # Work on the already-selected data present in `x$data` (preferred)
  data <- d3po$x$data
  if (is.null(data) || ncol(as.data.frame(data)) == 0) {
    stop("po_format requires data to be present in d3po$x$data or passed explicitly to po_format()")
  }

  # Ensure data is a data.frame
  data <- as.data.frame(data)

  if (is.null(d3po$x$formatted_cols)) d3po$x$formatted_cols <- list()

  for (nm in names(formats)) {
    if (is.null(nm) || nm == "") {
      stop("po_format requires named arguments like x = round(varx, 2)")
    }

    q <- formats[[nm]]

    # Evaluate the expression in the data frame context. The result should be
    # a vector with length 1 or nrow(data).
    vals <- rlang::eval_tidy(q, data = data)

    if (length(vals) == 1 && nrow(data) > 1) {
      vals <- rep(vals, nrow(data))
    }

    if (length(vals) != nrow(data)) {
      stop(sprintf("Formatter for '%s' returned length %d but data has %d rows", nm, length(vals), nrow(data)))
    }

    newcol <- paste0("__label_", nm)
    data[[newcol]] <- as.character(vals)
    d3po$x$formatted_cols[[nm]] <- newcol

    # If the user formatted the 'x' aesthetic (categorical axis) and the
    # widget already has a `group` aesthetic defined, replace the group
    # column values with the formatted strings so category ticks and
    # labels render as the formatted values on the JS side.
    if (identical(nm, "x") && !is.null(d3po$x$group) && d3po$x$group %in% names(data)) {
      data[[d3po$x$group]] <- data[[newcol]]
    }

    # Heuristic: if the user formatted the 'y' aesthetic using an R-style
    # thousands separator (e.g. format(..., big.mark = " ")), detect that
    # and set a client-side JS number formatter using Intl.NumberFormat to
    # mirror the appearance. This is a best-effort heuristic and won't cover
    # arbitrary R formatting expressions.
    if (identical(nm, "y")) {
      # original y column name (if present in d3po options)
      original_y_col <- d3po$x$y
      # Detect formatted strings containing space as thousands sep
      looks_like_space_grouping <- any(grepl("[0-9] [0-9]{3}", data[[newcol]]))
      if (!is.null(original_y_col) && looks_like_space_grouping) {
        # Use French locale as it uses non-breaking space grouping in many browsers
        d3po$x$axis_y <- "JS(new Intl.NumberFormat('fr-FR').format(value))"
      }
    }
  }

  d3po$x$data <- data
  return(d3po)
}

#' @export
#' @method po_format d3proxy
po_format.d3proxy <- function(d3po, ...) {
  formats <- rlang::quos(...)
  assertthat::assert_that(length(formats) > 0, msg = "No formatters provided to po_format()")

  # Convert quosures to text so they can be handled client-side or by the
  # server receiver. We use rlang::as_label to get a readable representation.
  txt <- vapply(formats, function(q) rlang::as_label(q), character(1))

  msg <- list(id = d3po$id, msg = list(formatters = as.list(txt)))

  d3po$session$sendCustomMessage("d3po-format", msg)

  return(d3po)
}

# Labels ----

#' @title Labels
#'
#' @description Edit labels positioning in a treemap.
#'
#' @inheritParams po_box
#' @param x Optional x-axis label.
#' @param y Optional y-axis label.
#' @param title Optional title for the chart.
#' @param subtitle Optional subtitle for the chart.
#' @param labels Optional character vector or JavaScript function for custom label fields for treemaps.
#' @param align Label alignment for treemaps. Must be one of "left-top", "center-middle", or "right-top".
#' @export
#' @return Appends custom labels to an 'htmlwidgets' object
po_labels <- function(d3po, x = NULL, y = NULL, title = NULL, subtitle = NULL, labels = NULL, align = "left-top") {
  UseMethod("po_labels")
}

#' @export
#' @method po_labels d3po
po_labels.d3po <- function(d3po, x = NULL, y = NULL, title = NULL, subtitle = NULL, labels = NULL, align = NULL) {
  # ---- Treemaps only ----
  # treemaps only
  # If align is not provided, default to left-top
  if (is.null(align)) align <- "left-top"

  # Validate align value
  valid_values <- c("left-top", "center-middle", "right-top")
  assertthat::assert_that(
    align %in% valid_values,
    msg = paste0("align must be one of 'left-top', 'center-middle', or 'right-top', got: '", align, "'")
  )

  # Split align into horizontal and vertical components
  parts <- strsplit(align, "-")[[1]]

  d3po$x$labels <- NULL
  d3po$x$labels$align <- parts[1]
  d3po$x$labels$valign <- parts[2]
  # Optional custom label fields (character vector or named list) that the
  # JS treemap/tooltip renderer can use to decide what to display at each
  # hierarchy level. Store raw value for the client-side to interpret.
  if (!is.null(labels)) {
    # Basic validation: allow character vector or list; otherwise error
    assertthat::assert_that(is.character(labels) || is.list(labels), msg = "`labels` must be a character vector or a list")
    d3po$x$labels$fields <- labels
  }
  # -----------------------

  # Accept subtitle passed via po_labels
  if (!is.null(subtitle)) d3po$x$labels$subtitle <- subtitle
  # accept title via po_labels for backward compatibility
  if (!is.null(title)) d3po$x$title <- title

  # Optional axis labels (x and y). If provided, store under axis_labels so
  # the renderer can use them for axes or legends. They must be character
  # or NULL.
  if (!is.null(x)) {
    assertthat::assert_that(is.character(x) || is.null(x), msg = "`x` must be a character string or NULL")
  }
  if (!is.null(y)) {
    assertthat::assert_that(is.character(y) || is.null(y), msg = "`y` must be a character string or NULL")
  }

  d3po$x$axis_labels <- list(x = x, y = y)

  return(d3po)
}

#' @export
#' @method po_labels d3proxy
po_labels.d3proxy <- function(d3po, x = NULL, y = NULL, title = NULL, subtitle = NULL, labels = NULL, align = NULL) {
  if (is.null(align)) align <- "left-top"

  # Note: For Shiny proxies, we can't easily check the type,
  # so we trust the user to use this correctly

  # Validate align value
  valid_values <- c("left-top", "center-middle", "right-top")
  assertthat::assert_that(
    align %in% valid_values,
    msg = paste0("align must be one of 'left-top', 'center-middle', or 'right-top', got: '", align, "'")
  )

  # Split align into horizontal and vertical components
  parts <- strsplit(align, "-")[[1]]

  msg_payload <- list(align = parts[1], valign = parts[2])

  if (!is.null(labels)) {
    assertthat::assert_that(is.character(labels) || is.list(labels), msg = "`labels` must be a character vector or a list")
    msg_payload$labels <- labels
  }

  if (!is.null(x)) {
    assertthat::assert_that(is.character(x) || is.null(x), msg = "`x` must be a character string or NULL")
    msg_payload$x <- x
  }
  if (!is.null(y)) {
    assertthat::assert_that(is.character(y) || is.null(y), msg = "`y` must be a character string or NULL")
    msg_payload$y <- y
  }
  if (!is.null(subtitle)) msg_payload$subtitle <- subtitle
  if (!is.null(title)) msg_payload$title <- title

  msg <- list(id = d3po$id, msg = msg_payload)

  d3po$session$sendCustomMessage("d3po-labels", msg)

  return(d3po)
}

# Font ----

#' @title Font
#'
#' @description Edit the font used in a chart.
#'
#' @inheritParams po_box
#' @param family family font to use ("Roboto", "Merriweather", etc.).
#' @param size size to use (10, 11, 12, etc. overrides auto-sizing).
#' @param transform transformation to use for the title ("lowercase", "uppercase", "capitalize", "none").
#' @export
#' @return Appends custom font to an 'htmlwidgets' object
po_font <- function(d3po, family = "Fira Sans",
                    size = 16,
                    transform = "none") {
  UseMethod("po_font")
}

#' @export
#' @method po_font d3po
po_font.d3po <- function(d3po, family, size, transform) {
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")

  d3po$x$font <- NULL
  d3po$x$font$family <- family
  d3po$x$font$size <- size
  d3po$x$font$transform <- transform
  return(d3po)
}

#' @export
#' @method po_font d3proxy
po_font.d3proxy <- function(d3po, family, size, transform) {
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")

  msg <- list(id = d3po$id, msg = list(family = family, size = size, transform = transform))

  d3po$session$sendCustomMessage("d3po-font", msg)

  return(d3po)
}

#' @export
#' @method po_font d3proxy
po_font.d3proxy <- function(d3po, family, size, transform) {
  assertthat::assert_that(!missing(family), msg = "Missing `family`")
  assertthat::assert_that(!missing(size), msg = "Missing `size`")
  assertthat::assert_that(!missing(transform), msg = "Missing `transform`")

  msg <- list(id = d3po$id, msg = list(family = family, size = size, transform = transform))

  d3po$session$sendCustomMessage("d3po-font", msg)

  return(d3po)
}

# Background ----

#' @title Background
#'
#' @description Add a background to a chart.
#'
#' @inheritParams po_box
#' @param background background to add (hex code).
#' @export
#' @return Appends custom background to an 'htmlwidgets' object
po_background <- function(d3po, background = "#fff") UseMethod("po_background")

#' @export
#' @method po_background d3po
po_background.d3po <- function(d3po, background) {
  assertthat::assert_that(!missing(background), msg = "Missing `background`")

  d3po$x$background <- background
  return(d3po)
}

#' @export
#' @method po_background d3proxy
po_background.d3proxy <- function(d3po, background) {
  assertthat::assert_that(!missing(background), msg = "Missing `background`")

  msg <- list(id = d3po$id, msg = list(background = background))

  d3po$session$sendCustomMessage("d3po-background", msg)

  return(d3po)
}

# Theme ----

#' @title Theme
#'
#' @description Manually set colors used by D3po for axis/axis-labels/title and for
#' tooltips/download menu background. This allows you to override page
#' themes (Tabler/Shiny) and force D3po to render with readable contrast.
#'
#' @inheritParams po_box
#' @param axis Hex color string for axis lines and axis/label/title fill (e.g. "#fff").
#' @param tooltips Hex color string for tooltip / download menu background (e.g. "#000").
#' @export
#' @return Appends theme settings to an 'htmlwidgets' object
po_theme <- function(d3po, axis = NULL, tooltips = NULL) UseMethod("po_theme")

#' @export
#' @method po_theme d3po
po_theme.d3po <- function(d3po, axis = NULL, tooltips = NULL) {
  if (!is.null(axis)) assertthat::assert_that(is.character(axis) && nzchar(axis), msg = "axis must be a hex color string")
  if (!is.null(tooltips)) assertthat::assert_that(is.character(tooltips) && nzchar(tooltips), msg = "tooltips must be a hex color string")

  d3po$x$theme <- list()
  if (!is.null(axis)) d3po$x$theme$axis <- as.character(axis)
  if (!is.null(tooltips)) d3po$x$theme$tooltips <- as.character(tooltips)

  return(d3po)
}

#' @export
#' @method po_theme d3proxy
po_theme.d3proxy <- function(d3po, axis = NULL, tooltips = NULL) {
  msg <- list(id = d3po$id, msg = list())
  if (!is.null(axis)) msg$msg$axis <- as.character(axis)
  if (!is.null(tooltips)) msg$msg$tooltips <- as.character(tooltips)

  d3po$session$sendCustomMessage("d3po-theme", msg)

  return(d3po)
}

# Download ----

#' @title Download
#'
#' @description Show/hide the download button.
#'
#' @param d3po A 'd3po' or 'd3proxy' object.
#' @param show Logical indicating whether to show (TRUE) or hide (FALSE) the download button.
#' @export
#' @return Appends download button settings to an 'htmlwidgets' object
po_download <- function(d3po, show = TRUE) UseMethod("po_download")

#' @export
#' @method po_download d3po
po_download.d3po <- function(d3po, show = TRUE) {
  assertthat::assert_that(is.logical(show), msg = "`show` must be TRUE or FALSE")

  d3po$x$download <- show
  return(d3po)
}

#' @export
#' @method po_download d3proxy
po_download.d3proxy <- function(d3po, show = TRUE) {
  assertthat::assert_that(is.logical(show), msg = "`show` must be TRUE or FALSE")

  msg <- list(id = d3po$id, msg = list(show = show))

  d3po$session$sendCustomMessage("d3po-download", msg)

  return(d3po)
}

# Network ----

#' @title Network
#'
#' @description Draw a network graph showing relationships between entities.
#' Requires an igraph object with nodes (vertices) and links (edges).
#' Node size can represent counts or other metrics.
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   d3po(pokemon_network) %>%
#'     po_network(daes(size = size, color = color, layout = "kk")) %>%
#'     po_labels(title = "Pokemon Type Network")
#' }
#'
#' @export
#' @return Appends nodes arguments to a network-specific 'htmlwidgets' object
po_network <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_network")

#' @export
#' @method po_network d3po
po_network.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  check_installed("igraph")

  d3po$x$type <- "network"

  # For network, data comes from igraph vertices stored in d3po$x$network_data$graph
  if (is.null(d3po$x$network_data) || is.null(d3po$x$network_data$graph)) {
    stop("po_network requires an igraph object to be passed to d3po()")
  }

  graph_obj <- d3po$x$network_data$graph
  vertices_data <- igraph::as_data_frame(graph_obj, what = "vertices")

  # extract & process coordinates
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)

  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$tooltip <- daes_to_opts(daes, "tooltip")

  layout <- daes_to_opts(daes, "layout")
  move <- daes_to_opts(daes, "move")

  # Set default for move if not specified
  if (is.null(move)) {
    move <- FALSE
  }

  d3po$x$move <- move

  # Check if vertices already have x and y coordinates
  has_manual_coords <- all(c("x", "y") %in% names(vertices_data))

  # Check if graph object has a $layout attribute
  has_layout_attr <- !is.null(graph_obj$layout) && is.matrix(graph_obj$layout)

  # Decide whether to use manual coordinates or calculate layout
  # Priority:
  # 1. If layout is specified, use it (ignoring any manual coords or layout attr)
  # 2. If no layout specified but graph has $layout attribute, use that
  # 3. If no layout specified but vertex x/y exist, use those
  # 4. If none of above, default to 'kk' layout
  if (!is.null(layout)) {
    # Layout algorithm specified - calculate positions using igraph
    layout_func <- switch(layout,
      "nicely" = igraph::layout_nicely,
      "fr" = igraph::layout_with_fr,
      "kk" = igraph::layout_with_kk,
      "graphopt" = igraph::layout_with_graphopt,
      "drl" = igraph::layout_with_drl,
      "lgl" = igraph::layout_with_lgl,
      "mds" = igraph::layout_with_mds,
      "sugiyama" = igraph::layout_with_sugiyama,
      stop("Unknown layout: ", layout)
    )

    layout_coords <- round(as.data.frame(layout_func(graph_obj)), 3)
    names(layout_coords) <- c("x", "y")
    d3po$x$layout <- layout
  } else if (has_layout_attr) {
    # No layout specified, but graph has $layout attribute - use it
    # Both the layout matrix and vertices_data are in the same igraph vertex order
    # So we can use the layout directly without reordering
    layout_matrix <- graph_obj$layout

    layout_coords <- round(as.data.frame(layout_matrix), 3)
    names(layout_coords) <- c("x", "y")
    d3po$x$layout <- "manual"
  } else if (has_manual_coords) {
    # No layout specified, but manual coordinates exist in vertices - use them
    layout_coords <- vertices_data[, c("x", "y")]
    d3po$x$layout <- "manual"
  } else {
    # No layout specified and no manual coordinates - default to 'kk'
    layout_coords <- round(as.data.frame(igraph::layout_with_kk(graph_obj)), 3)
    names(layout_coords) <- c("x", "y")
    d3po$x$layout <- "kk"
  }

  # Combine vertex attributes with layout coordinates
  # Add id field from vertex names
  vertices_data$id <- vertices_data$name

  # Remove x and y from vertices_data if they exist to avoid duplication
  vertices_data <- vertices_data[, !names(vertices_data) %in% c("x", "y"), drop = FALSE]

  nodes <- dplyr::bind_cols(vertices_data, layout_coords)

  d3po$x$nodes <- nodes

  # Extract edges from igraph object
  edges <- igraph::as_data_frame(graph_obj, what = "edges")
  # Use node names as source/target (not numeric indices)
  edges$source <- edges$from
  edges$target <- edges$to
  # Keep all edge attributes (including edge_size, weight, etc.)
  edges <- edges[, !names(edges) %in% c("from", "to"), drop = FALSE]
  d3po$x$edges <- edges

  # Remove network_data as it's no longer needed and can't be serialized to JSON
  d3po$x$network_data <- NULL

  return(d3po)
}

#' @export
#' @method po_network d3proxy
po_network.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-graph", msg)

  return(d3po)
}

# Geomap ----

#' @title Geomap
#'
#' @description Plot a geomap using sf spatial objects
#'
#' @inheritParams po_box
#'
#' @examples
#' if (interactive()) {
#'   # Using sf objects
#'   library(sf)
#'
#'   # Example 1: North Carolina counties
#'   nc <- sf::st_read(system.file("shape/nc.shp", package = "sf"), quiet = TRUE)
#'   nc$random <- runif(nrow(nc), min = 10, max = 100)
#'
#'   d3po(nc) %>%
#'     po_geomap(daes(group = FIPS, size = random, tooltip = NAME)) %>%
#'     po_labels(title = "Random Values by County")
#'
#'   # Example 2: With custom colors
#'   nc$my_color <- sample(c("#69b3a2", "#F85888", "#A890F0"),
#'     nrow(nc),
#'     replace = TRUE
#'   )
#'
#'   d3po(nc) %>%
#'     po_geomap(daes(
#'       group = FIPS, size = random,
#'       tooltip = NAME, color = my_color
#'     )) %>%
#'     po_labels(title = "Counties with Custom Colors")
#'
#'   # Example 3: Gradient coloring based on values
#'   d3po(nc) %>%
#'     po_geomap(daes(
#'       group = FIPS, size = random,
#'       tooltip = NAME, gradient = TRUE
#'     )) %>%
#'     po_labels(title = "Counties with Gradient")
#' }
#' @export
#' @return an 'htmlwidgets' object with the desired interactive plot
po_geomap <- function(d3po, ..., data = NULL, inherit_daes = TRUE) UseMethod("po_geomap")

#' @export
#' @method po_geomap d3po
po_geomap.d3po <- function(d3po, ..., data = NULL, inherit_daes = TRUE) {
  # Set chart type
  d3po$x$type <- "geomap"

  # Get attribute data
  # For SF objects, d3po.sf should have populated x$data (attributes) and x$geomap_data (GeoJSON)
  if (!is.null(data)) {
    attrs <- data
  } else {
    attrs <- d3po$x$data
  }

  # Extract and process aesthetics
  daes <- get_daes(...)
  daes <- combine_daes(d3po$x$daes, daes, inherit_daes)
  assertthat::assert_that(has_daes(daes))
  columns <- daes_to_columns(daes)

  if (is.null(attrs)) {
    stop("po_geomap requires attribute data (x$data) to be present. Please call d3po() with an sf object or supply `data` to po_geomap().")
  }

  # Select only requested columns from attribute table
  # Ensure result is a plain data.frame
  d3po$x$data <- as.data.frame(dplyr::select(attrs, dplyr::all_of(columns)))

  # Verify that geomap data exists (should have been created by d3po.sf)
  if (is.null(d3po$x$geomap_data)) {
    stop(
      "po_geomap requires an sf object to be passed to d3po().\n",
      "Please ensure you're using an sf spatial object, e.g.:\n",
      "  library(sf)\n",
      "  my_map <- st_read('path/to/shapefile.shp')\n",
      "  d3po(my_map) %>% po_geomap(...)"
    )
  }

  # Set aesthetic mappings
  d3po$x$group <- daes_to_opts(daes, "group")
  d3po$x$text <- daes_to_opts(daes, "text")
  d3po$x$color <- daes_to_opts(daes, "color")
  d3po$x$size <- daes_to_opts(daes, "size")
  d3po$x$tooltip <- daes_to_opts(daes, "tooltip")
  d3po$x$gradient <- daes_to_opts(daes, "gradient")

  return(d3po)
}

#' @export
#' @method po_geomap d3proxy
po_geomap.d3proxy <- function(d3po, ..., data, inherit_daes) {
  assertthat::assert_that(!missing(data), msg = "Missing `data`")
  assertthat::assert_that(!missing(inherit_daes), msg = "Missing `inherit_daes`")

  msg <- list(id = d3po$id, msg = list(data = data, inherit_daes = inherit_daes))

  d3po$session$sendCustomMessage("d3po-geomap", msg)

  return(d3po)
}
