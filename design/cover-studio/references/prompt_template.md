# SVG Architect Prompt Engineering Template

Use this template to guide the internal reasoning of the model for High-Quality mode.

## Phase 2: Layout Plan (Example)
```json
{
  "canvas": {
    "viewBox": "0 0 1200 630",
    "safe_area": "100 80 1000 470",
    "aspect_ratio": "16:9"
  },
  "palette": {
    "background": "#0A0A0B",
    "primary": "#3B82F6",
    "text_primary": "#F8FAFC"
  },
  "typography": {
    "font_family": "system-ui",
    "title_size": 72
  },
  "composition": {
    "layout_mode": "Vercel",
    "visual_hierarchy": ["Title", "Central Node", "Connection Flows"]
  },
  "elements": [
    { "id": "node-1", "type": "node", "label": "API Gateway", "position": "center" }
  ],
  "design_rationale": "Using Vercel's dark mode style with a central focus to emphasize the API as the gateway."
}
```

## Phase 4: Self-Check (Example)
Must output a table with strict adherence to `resources/quality_checklist.json`.
Any 'Medium' or 'High' severity item that is not ✅ must be explained and fixed in a second iteration if `--strict` is enabled.
