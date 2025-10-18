# Getting Started with d3po v1.0

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd javascript-new
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

This will open a browser with all the examples at `http://localhost:5173/examples/`

### 3. Build for Production

```bash
npm run build
```

## Class Hierarchy

```
D3po (Base Class)
├── Common functionality
│   ├── SVG initialization
│   ├── Margin handling
│   ├── Title/background/font
│   ├── Download (SVG/PNG)
│   └── Event handling
│
└── Extends to all visualization types
    ├── BarChart
    ├── BoxPlot
    ├── GeoMap
    ├── LineChart
    ├── Network
    ├── PieChart
    ├── ScatterPlot
    └── Treemap
```

## Data Flow

```
User Data
    │
┌─────────────────┐
│  Validation     │  (utils.js)
│  - validateData │
│  - groupBy      │
│  - calculateBox │
└─────────────────┘
         │
┌─────────────────┐
│  D3po Instance  │  (D3po.js)
│  - setData()    │
│  - setTitle()   │
│  - setFont()    │
└─────────────────┘
         │
┌─────────────────┐
│  Visualization  │  (visualizations/*.js)
│  - render()     │
│  - scales       │
│  - axes         │
│  - elements     │
└─────────────────┘
         │
┌─────────────────┐
│  SVG Output     │
│  - Interactive  │
│  - Responsive   │
│  - Exportable   │
└─────────────────┘
```

### NPM Scripts

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production

# Testing
npm test            # Run tests
npm test:watch      # Watch mode

# Code Quality
npm run lint        # Check style
npm run lint:fix    # Fix issues
npm run format      # Format code
```
