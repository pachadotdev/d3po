/**
 * D3po - Fast and Beautiful Interactive Visualizations with D3.js 7.9
 * @module d3po
 */

import D3po from './D3po.js';
import BoxPlot from './visualizations/BoxPlot.js';
import BarChart from './visualizations/BarChart.js';
import Treemap from './visualizations/Treemap.js';
import PieChart from './visualizations/PieChart.js';
import LineChart from './visualizations/LineChart.js';
import AreaChart from './visualizations/AreaChart.js';
import ScatterPlot from './visualizations/ScatterPlot.js';
import GeoMap from './visualizations/GeoMap.js';
import Network from './visualizations/Network.js';

// Default export for UMD builds
export default {
  D3po,
  BoxPlot,
  BarChart,
  Treemap,
  PieChart,
  LineChart,
  AreaChart,
  ScatterPlot,
  GeoMap,
  Network,
};
