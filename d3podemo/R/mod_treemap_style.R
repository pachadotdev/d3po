# Module: treemap_style
mod_treemap_style_plot <- function(data) {
  dout <- stats::aggregate(cbind(count = rep(1, nrow(data))) ~ type_1 + color_1,
    data = data, FUN = length
  )
  names(dout) <- c("type", "color", "count")

  d3po(dout, width = 800, height = 600) %>%
    po_treemap(daes(size = .data$count, group = .data$type, color = .data$color)) %>%
    po_labels(align = "center-middle", title = "Share of Pokemon by Main Type") %>%
    po_background("#ffcc00") %>%
    po_font("Comic Sans MS", 16, "uppercase") %>%
    po_download(FALSE)
}
