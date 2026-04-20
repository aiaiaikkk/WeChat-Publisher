# SVG Architect Error & Exit Codes

## 1. Error Codes (`E_*`)

| Code | Meaning | Repair Responsibility |
| :--- | :--- | :--- |
| `E_VIEWBOX_MISSING` | Missing `viewBox` attribute | `svg_fixer.py` (auto) |
| `E_VIEWBOX_INVALID` | Malformed `viewBox` format | `svg_fixer.py` (auto) |
| `E_GEOMETRY_OUT_OF_BOUNDS` | Safe area or slots exceed viewBox | `repair-cmd` / Manual |
| `E_CONTRAST_LOW` | Contrast ratio < 4.5:1 | `repair-cmd` / Manual |
| `E_CONTRAST_UNRESOLVED` | Text color cannot be resolved (strict) | `repair-cmd` / Manual |
| `E_SECURITY_TAG` | Dangerous tag (`script`, `iframe`, etc.) | `repair-cmd` / Manual |
| `E_SECURITY_STYLE_CONTENT` | Unsafe CSS (`@import`, external `url()`) | `svg_fixer.py` (auto) |
| `E_SECURITY_EXTERNAL` | External `href` or `src` detected | `repair-cmd` / Manual |
| `E_A11Y_MISSING` | Missing `<title>` or `<desc>` | `svg_fixer.py` (auto) |
| `E_XML_PARSE_FAIL` | SVG is not a valid XML | Manual |
| `E_VALIDATOR_CRASH` | Internal validator logic error | Developer |
| `E_PIPELINE_STALLED` | No progress made after retry | Manual |
| `E_PIPELINE_REPORT_PARSE_FAIL` | Failed to parse JSON report | Developer |

---

## 2. Pipeline Exit Codes

| Code | Meaning | Action |
| :--- | :--- | :--- |
| **0** | **Success** | Pipeline completed, assets ready. |
| **1** | **Failed (Logic/Stalled)** | Max retries reached or `E_PIPELINE_STALLED`. |
| **2** | **Failed (Infrastructure)** | `E_PIPELINE_REPORT_PARSE_FAIL` or validator crash. |
| **3** | **Repair Required** | Non-auto-fixable error detected (when no `--repair-cmd`). |
| **4** | **Post-processing Warning** | SVG ready but PNG export failed. |
