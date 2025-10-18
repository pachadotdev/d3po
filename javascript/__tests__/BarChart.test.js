/**
 * @jest-environment jsdom
 */

import BarChart from '../src/visualizations/BarChart.js';

describe('BarChart Integration', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-chart"></div>';
    container = document.getElementById('test-chart');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create and render a bar chart', () => {
    const data = [
      { category: 'A', value: 10, color: '#ff0000' },
      { category: 'B', value: 20, color: '#00ff00' },
      { category: 'C', value: 15, color: '#0000ff' },
    ];

    const chart = new BarChart('#test-chart', {
      x: 'category',
      y: 'value',
      color: 'color',
      title: 'Test Bar Chart',
    });

    chart.setData(data).render();

    // Check that SVG was created
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Check that bars were rendered
    const bars = container.querySelectorAll('.bar');
    expect(bars.length).toBe(3);
  });
});
