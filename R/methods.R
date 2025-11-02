#' d3po
#'
#' This function provides 'd3po' methods from R console
#'
#' @param data d3po need explicit specified data objects formatted as JSON, and this parameter passed it from R.
#' @param elementId Dummy string parameter. Useful when you have two or more charts on the same page.
#' @param width Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param height Same as width parameter.
#' @param ... Aesthetics to pass, see [daes()]
#'
#' @export
#' @return Creates a basic 'htmlwidget' object for simple visualization
d3po <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) UseMethod("d3po")

#' @export
d3po.default <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) {
  # Default widgets expose attribute tables under `data`.
  x <- list(data = data)

  x$daes <- get_daes(...)

  # serialise rowwise
  attr(x, "TOJSON_ARGS") <- list(dataframe = "rows")

  # create widget
  widget_this(x, width, height, elementId)
}

#' @method d3po igraph
#' @export
d3po.igraph <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) {
  # extract data from igraph object
  graph_df <- igraph::as_data_frame(data, "both")

  # Store the igraph object and edges in network_data for po_network to use
  # Store vertex attributes in data for the widget
  x <- list(
    data = get_vertices(graph_df$vertices),
    network_data = list(
      graph = data,
      edges = graph_df$edges
    )
  )

  # group defaults to name as in igraph
  x$group <- "name"

  # default to network
  x$type <- "network"

  # get aes as group may be overriden
  x$daes <- get_daes(...)
  if (!is.null(x$daes$group)) {
    x$group <- daes_to_opts(x$daes, "group")
  }

  # serialise rowwise
  attr(x, "TOJSON_ARGS") <- list(dataframe = "rows")

  # create widget
  widget_this(x, width, height, elementId)
}

#' @method d3po sf
#' @export
d3po.sf <- function(data = NULL, ..., width = NULL, height = NULL, elementId = NULL) {
  if (is.null(data)) stop("d3po.sf requires an 'sf' object as data")

  # Ensure sf package is available
  if (!requireNamespace("sf", quietly = TRUE)) {
    stop("Package 'sf' is required for d3po.sf")
  }

  # Ensure geojsonio is available for conversion
  if (!requireNamespace("geojsonio", quietly = TRUE)) {
    stop("Package 'geojsonio' is required for d3po.sf")
  }

  # Force coordinate reference system to WGS84 (EPSG:4326) which GeoJSON expects
  current_crs <- sf::st_crs(data)
  if (is.na(current_crs)) {
    # No CRS defined, assume WGS84
    data <- sf::st_set_crs(data, 4326)
  } else if (!is.na(current_crs$epsg) && current_crs$epsg != 4326) {
    data <- sf::st_transform(data, 4326)
  }

  # Handle GEOMETRYCOLLECTION by casting to MULTIPOLYGON or simpler types
  # GEOMETRYCOLLECTION often causes issues with D3/GeoJSON rendering
  geom_types <- unique(sf::st_geometry_type(data))
  if ("GEOMETRYCOLLECTION" %in% geom_types) {
    message("Converting GEOMETRYCOLLECTION to MULTIPOLYGON for better compatibility")
    data <- sf::st_collection_extract(data, type = "POLYGON")
  }

  # Extract attribute table (drop geometry column)
  attrs <- sf::st_drop_geometry(data)

  # Convert geometry to GeoJSON FeatureCollection
  # Use geojsonsf which produces cleaner output than sf::st_write
  if (!requireNamespace("geojsonsf", quietly = TRUE)) {
    stop("Package 'geojsonsf' is required for GeoJSON conversion")
  }
  
  geojson_text <- geojsonsf::sf_geojson(data, atomise = FALSE, simplify = FALSE)
  
  # Parse to R object
  geomap_data <- jsonlite::fromJSON(geojson_text, simplifyVector = FALSE)

  x <- list()
  x$data <- attrs
  x$geomap_data <- geomap_data

  # Keep track of minimal metadata
  x$type <- "geomap"
  x$daes <- get_daes(...)

  # serialise rowwise
  attr(x, "TOJSON_ARGS") <- list(dataframe = "rows")

  widget_this(x, width, height, elementId)
}

