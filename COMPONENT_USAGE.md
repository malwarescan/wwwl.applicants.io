# Risk Component Usage Guide

## Available Components

### RiskBadge
Displays a risk band badge (Low, Guarded, Elevated, High, Severe) based on score.

**Props:**
- `score` (number, required): Risk score 0-100
- `size` (string, optional): 'sm' | 'md' | 'lg' (default: 'md')

**Usage in Vue:**
```vue
<RiskBadge :score="65" size="lg" />
```

**Usage in Markdown (MDC syntax):**
```mdc
::RiskBadge{score="65" size="lg"}
::
```

### RiskMeter
Displays a visual meter with score, confidence, and progress bar.

**Props:**
- `score` (number, required): Risk score 0-100
- `confidence` (number, required): Confidence level 0-1
- `showLabels` (boolean, optional): Show confidence labels (default: true)

**Usage in Vue:**
```vue
<RiskMeter :score="65" :confidence="0.72" />
```

**Usage in Markdown (MDC syntax):**
```mdc
::RiskMeter{score="65" confidence="0.72"}
::
```

### RiskScore (Composite)
Combines RiskBadge and RiskMeter for complete risk display.

**Props:**
- `score` (number, required): Risk score 0-100
- `confidence` (number, optional): Confidence level 0-1 (default: 1.0)
- `showMeter` (boolean, optional): Show meter component (default: true)

**Usage in Vue:**
```vue
<RiskScore :score="65" :confidence="0.72" />
```

**Usage in Markdown (MDC syntax):**
```mdc
::RiskScore{score="65" confidence="0.72"}
::
```

## Registering Components for MDC

To use these components in markdown files, they need to be auto-imported or registered. Nuxt Content automatically imports components from `app/components/content/` directory.

Components in `app/components/` can be used with the `::ComponentName` syntax if they're auto-imported.

## Current Implementation

For company pages, you can:

1. **Use in markdown directly** (if MDC is enabled):
```mdc
## Risk score

::RiskScore{score="65" confidence="0.72"}
::
```

2. **Use programmatically** in the page component (future enhancement):
The page component can inject these components based on frontmatter data.

3. **Manual display** (current approach):
Display risk score information manually in markdown, matching the component output format.

## Risk Band Colors

- **Low (0-19)**: Green
- **Guarded (20-39)**: Blue
- **Elevated (40-59)**: Yellow
- **High (60-79)**: Orange
- **Severe (80-100)**: Red





