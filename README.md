# d3po

What remains to finish the migration to D3.js 5.x:

- migrate d3.layout.treemap(), d3.layout.pack() and d3.layout.stack() to their 5.x counterparts
- migrate d3.svg.axis() and d3.svg.brush() to their 5.x counterparts
- test that everything works as expected.

Why it cannot be done currently:

- the functions that remain to migrate are largely different between 3.x and 5.x, and the surrounding code and logic must be changed accordingly.
- best practice for refactoring code (upgrading a library without modifying the behavior is refactoring) is to ensure the unit tests keep working after modifying the code. But there are no unit tests in the code base: trivial refactoring is OK, but touching largest parts of code is too risky and result cannot be verified.

What is recommended:

- create unit tests for all the functions in the library

Additionally, it would be good to:

- cut the functions in smaller functions (max. 30/35 lines)
- add doctrings to all the functions (see http://documentation.js.org/ for example) + generate API documentation (result: https://docs.mapbox.com/mapbox-gl-js/api/)
- enforce coherent code style with eslint and prettier
- add a README.ms in the javascript/ directory
- move the javascript/ directory to its own git repository, publish it as a npm package
