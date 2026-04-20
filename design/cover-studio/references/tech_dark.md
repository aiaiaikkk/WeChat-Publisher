# Tech-Dark Visual Specification

## Palette (沉浸暗黑)
- **Background**: `#0A0A0B` (Deep Space)
- **Primary**: `#3B82F6` (Electric Blue)
- **Secondary**: `#8B5CF6` (Cyber Purple)
- **Text (Primary)**: `#F8FAFC`
- **Text (Secondary)**: `#94A3B8`

## Typography (现代排版)
- **Font Stack**: `Inter, system-ui, sans-serif`
- **Title Weight**: 800 (Extra Bold)
- **Letter Spacing**: 2px for titles

## Effects (质感光影)
- **Glow**: Use `feGaussianBlur` with `stdDeviation="15"` for core nodes.
- **Grid**: 40x40px, `#1E293B`, opacity 0.3.
- **Lines**: Smooth Bezier curves with `#3B82F6` stroke and 2px width.

## Negative Constraints
- No pure black `#000000`.
- No high-saturation primary red/green.
