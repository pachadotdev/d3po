/**
 * @jest-environment jsdom
 */

import D3po from '../src/D3po';

describe('D3po Base Class', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Constructor', () => {
    it('should create instance with selector', () => {
      const d3po = new D3po('#test-container');
      expect(d3po.container).toBe(container);
    });

    it('should create instance with element', () => {
      const d3po = new D3po(container);
      expect(d3po.container).toBe(container);
    });

    it('should throw error for invalid selector', () => {
      expect(() => new D3po('#non-existent')).toThrow('Container element not found');
    });

    it('should set default options', () => {
      const d3po = new D3po(container);
      expect(d3po.options.width).toBeGreaterThan(0);
      expect(d3po.options.height).toBeGreaterThan(0);
      expect(d3po.options.margin).toBeDefined();
    });

    it('should accept custom options', () => {
      const d3po = new D3po(container, {
        width: 500,
        height: 400,
        title: 'Test Chart',
      });
      expect(d3po.options.width).toBe(500);
      expect(d3po.options.height).toBe(400);
      expect(d3po.options.title).toBe('Test Chart');
    });
  });

  describe('Methods', () => {
    let d3po;

    beforeEach(() => {
      d3po = new D3po(container, { width: 800, height: 600 });
    });

    it('should calculate inner width correctly', () => {
      const innerWidth = d3po.getInnerWidth();
      expect(innerWidth).toBe(800 - 60 - 40); // width - left - right margins
    });

    it('should calculate inner height correctly', () => {
      const innerHeight = d3po.getInnerHeight();
      expect(innerHeight).toBe(600 - 60 - 60); // height - top - bottom margins
    });

    it('should set data', () => {
      const data = [{ x: 1, y: 2 }];
      d3po.setData(data);
      expect(d3po.data).toEqual(data);
    });

    it('should chain methods', () => {
      const result = d3po
        .setTitle('New Title')
        .setBackground('#fff')
        .setFont('Arial', 14);
      expect(result).toBe(d3po);
    });

    it('should throw error when render not implemented', () => {
      expect(() => d3po.render()).toThrow('render() must be implemented by subclass');
    });
  });

  describe('Cleanup', () => {
    it('should destroy visualization', () => {
      const d3po = new D3po(container);
      d3po.destroy();
      expect(d3po.data).toBeNull();
      expect(d3po.svg).toBeNull();
      expect(container.children.length).toBe(0);
    });
  });
});
