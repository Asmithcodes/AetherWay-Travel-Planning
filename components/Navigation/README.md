# GooeyNav Component

A visually rich gooey navigation bar with particle-based transitions that animate when switching between navigation items.

## Features

- Gooey pill animation that follows the active navigation item
- Particle burst animations during transitions
- Blur and contrast effects for a unique visual style
- Keyboard accessible (Enter/Space key support)
- Configurable particle count, timing, distances, and colors
- Active state handling with smooth transitions

## Installation

The component has been created directly in the project. No additional package installation is required.

## Usage

```tsx
import GooeyNav from './components/Navigation/GooeyNav';

const items = [
  { label: "Home", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

<div style={{ height: '600px', position: 'relative' }}>
  <GooeyNav
    items={items}
    particleCount={15}
    particleDistances={[90, 10]}
    particleR={100}
    initialActiveIndex={0}
    animationTime={600}
    timeVariance={300}
    colors={[1, 2, 3, 1, 2, 3, 1, 4]}
  />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `GooeyNavItem[]` | Required | Array of navigation items with `label` and `href` |
| `animationTime` | `number` | `600` | Base animation duration in milliseconds |
| `particleCount` | `number` | `15` | Number of particles in the burst animation |
| `particleDistances` | `[number, number]` | `[90, 10]` | Start and end distances for particles |
| `particleR` | `number` | `100` | Particle rotation range |
| `timeVariance` | `number` | `300` | Random variance in animation timing |
| `colors` | `number[]` | `[1, 2, 3, 1, 2, 3, 1, 4]` | Color indices for particles (maps to CSS variables) |
| `initialActiveIndex` | `number` | `0` | Index of initially active navigation item |

## Interactions

- **Click**: Clicking a navigation item animates the gooey pill to the selected item with a particle burst
- **Keyboard**: Press Enter or Space on a focused navigation item to activate it
- **Active State**: Only one navigation item can be active at a time

## Notes

- The component uses inline styles for complex animations that are difficult to recreate with Tailwind
- All particle animations, blur/contrast effects, and timing are preserved from the original design
- The component is fully keyboard accessible
- Particle colors can be customized via CSS variables (`--color-1`, `--color-2`, etc.)
