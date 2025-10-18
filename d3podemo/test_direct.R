#!/usr/bin/env Rscript

# Direct test of the app components
library(d3podemo)

cat("Testing d3podemo app...\n\n")

# Test 1: Check if d3po package is available
cat("1. Checking d3po package:\n")
tryCatch({
  print(d3po::pokemon[1:3, 1:5])
  cat("   ✓ d3po package loaded\n\n")
}, error = function(e) {
  cat("   ✗ Error:", conditionMessage(e), "\n\n")
})

# Test 2: Check if plot creation works
cat("2. Testing plot creation:\n")
tryCatch({
  pokemon <- d3po::pokemon
  test_plot <- d3po::d3po(pokemon) %>%
    d3po::po_box(d3po::daes(x = .data$type_1, y = .data$weight, color = .data$color_1)) %>%
    d3po::po_title("Test Plot")
  cat("   ✓ Plot created successfully\n")
  cat("   Plot type:", test_plot$x$type, "\n")
  cat("   Data columns:", paste(names(test_plot$x$data), collapse = ", "), "\n\n")
}, error = function(e) {
  cat("   ✗ Error:", conditionMessage(e), "\n\n")
})

# Test 3: Try to run the app
cat("3. Starting app (will run for 5 seconds)...\n")
cat("   Open http://127.0.0.1:3838 in your browser\n\n")

# Run app in a separate process
system("R -e \"d3podemo::run_app()\" &", wait = FALSE)
Sys.sleep(10)
cat("   If the app didn't appear, check for errors above.\n")
