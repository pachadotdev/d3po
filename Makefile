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
	cp ./javascript/dist/d3po.min.js ./inst/htmlwidgets/lib/d3po.min.js && \
	cp ./javascript/dist/d3po.min.js.map ./inst/htmlwidgets/lib/d3po.min.js.map && \
	Rscript -e "devtools::document(); devtools::install()"
