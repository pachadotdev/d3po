.PHONY: build test

test:
	cd ./javascript && \
	npm run lint && \
	npm run dev

build:
	cd ./javascript && \
	npm run lint && \
	npm run build && \
	cd .. && \
	mkdir -p ./inst/htmlwidgets/lib && \
	rm -f ./inst/htmlwidgets/lib/d3po.min.js && \
	rm -f ./inst/htmlwidgets/lib/d3po.min.js.map && \
	mv ./javascript/dist/d3po.min.js ./inst/htmlwidgets/lib/d3po.min.js && \
	Rscript -e "devtools::document(); devtools::install()"

build-debug:
	cd ./javascript && \
	npm run lint && \
	npm run build-debug && \
	cd .. && \
	mkdir -p ./inst/htmlwidgets/lib && \
	rm -f ./inst/htmlwidgets/lib/d3po.min.js && \
	rm -f ./inst/htmlwidgets/lib/d3po.min.js.map && \
	mv ./javascript/dist/d3po.min.js ./inst/htmlwidgets/lib/d3po.min.js && \
	mv ./javascript/dist/d3po.min.js.map ./inst/htmlwidgets/lib/d3po.min.js.map && \
	Rscript -e "devtools::document(); devtools::install()"
