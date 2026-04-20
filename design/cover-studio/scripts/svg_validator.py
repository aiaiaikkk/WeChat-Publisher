#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import json
import os
import argparse
import sys
import re

# 标准错误码
ERR_CODES = {
    "E_VIEWBOX_MISSING": "缺失 viewBox 属性",
    "E_VIEWBOX_INVALID": "viewBox 格式错误",
    "E_GEOMETRY_OUT_OF_BOUNDS": "坐标超出 viewBox 范围",
    "E_CONTRAST_LOW": "对比度不足 (要求 4.5:1)",
    "E_CONTRAST_UNRESOLVED": "关键文本颜色无法解析，对比度未知",
    "E_SECURITY_TAG": "检测到危险标签 (script/foreignobject/iframe/use)",
    "E_SECURITY_STYLE_CONTENT": "检测到危险的样式内容 (@import/外部url/data/js)",
    "E_SECURITY_EXTERNAL": "检测到非法外链或脚本协议",
    "E_A11Y_MISSING": "缺少 title 或 desc 标签",
    "E_XML_PARSE_FAIL": "XML 解析失败",
    "E_VALIDATOR_CRASH": "校验器运行时异常"
}

def log_stderr(msg):
    print(msg, file=sys.stderr)

def parse_length(length_str, viewBox_size=1000):
    if not length_str: return 0
    length_str = str(length_str).strip().lower()
    if length_str.endswith('%'):
        try: return (float(length_str[:-1]) / 100.0) * viewBox_size
        except: return 0
    if length_str.endswith('px'):
        try: return float(length_str[:-2])
        except: return 0
    try: return float(re.sub(r'[a-z%]+', '', length_str))
    except: return 0

def parse_color(color_str):
    if not color_str or color_str == 'none' or color_str == 'transparent':
        return None
    color_str = color_str.strip().lower()
    if color_str.startswith('#'):
        c = color_str.lstrip('#')
        if len(c) == 3: c = ''.join([char*2 for char in c])
        if len(c) == 6: return c
        return None
    if color_str.startswith('rgb'):
        nums = re.findall(r'\d+', color_str)
        if len(nums) >= 3:
            return '{:02x}{:02x}{:02x}'.format(int(nums[0]), int(nums[1]), int(nums[2]))
        return None
    return None

def get_luminance(hex_color):
    if not hex_color: return 0.5
    try:
        r, g, b = [int(hex_color[i:i+2], 16)/255.0 for i in (0, 2, 4)]
        r = r/12.92 if r <= 0.03928 else ((r+0.055)/1.055)**2.4
        g = g/12.92 if g <= 0.03928 else ((g+0.055)/1.055)**2.4
        b = b/12.92 if b <= 0.03928 else ((b+0.055)/1.055)**2.4
        return 0.2126*r + 0.7152*g + 0.0722*b
    except: return 0.5

def check_contrast_ratio(c1_hex, c2_hex):
    if not c1_hex or not c2_hex: return None
    l1, l2 = get_luminance(c1_hex), get_luminance(c2_hex)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

def parse_rect(rect_str):
    if not rect_str: return None
    parts = re.split(r'[,\s]+', rect_str.strip())
    if len(parts) != 4: return None
    try: return [float(p) for p in parts]
    except: return None

def validate_svg(svg_file, layout_plan_file=None, strict=False):
    report = {"status": "PASS", "errors": [], "warnings": [], "info": []}
    try:
        tree = ET.parse(svg_file)
        root = tree.getroot()
        vb_raw = root.attrib.get('viewBox', "")
        vb_parts = parse_rect(vb_raw)
        
        v_w = 1200
        if vb_parts: v_w = vb_parts[2]

        # 1. Geometry (强制补回 Slots 检查)
        if not vb_raw:
            report["errors"].append({"code": "E_VIEWBOX_MISSING", "msg": ERR_CODES["E_VIEWBOX_MISSING"]})
        elif not vb_parts:
            report["errors"].append({"code": "E_VIEWBOX_INVALID", "msg": ERR_CODES["E_VIEWBOX_INVALID"]})
        else:
            v_x, v_y, v_w, v_h = vb_parts
            if layout_plan_file and os.path.exists(layout_plan_file):
                with open(layout_plan_file, 'r') as f:
                    plan = json.load(f)
                    # 1.1 Safe Area 检查
                    sa = plan['canvas']['safe_area']
                    if sa['x'] < v_x or sa['y'] < v_y or (sa['x'] + sa['width']) > (v_x + v_w) or (sa['y'] + sa['height']) > (v_y + v_h):
                        report["errors"].append({"code": "E_GEOMETRY_OUT_OF_BOUNDS", "msg": f"Safe Area {sa} exceeds viewBox"})
                    # 1.2 Slots 检查 (补齐项)
                    for slot in plan.get('slots', []):
                        r = slot['rect']
                        if r['x'] < v_x or r['y'] < v_y or (r['x'] + r['w']) > (v_x + v_w) or (r['y'] + r['h']) > (v_y + v_h):
                            report["errors"].append({"code": "E_GEOMETRY_OUT_OF_BOUNDS", "msg": f"Slot {slot['slot_id']} exceeds viewBox"})

        # 2. Security
        dangerous_tags = ['script', 'foreignobject', 'iframe']
        for elem in root.iter():
            tag = elem.tag.split('}')[-1].lower()
            if tag in dangerous_tags:
                code = "E_SECURITY_TAG"
                report["errors"].append({"code": code, "msg": f"Dangerous tag <{tag}> detected."})
            
            if tag == 'use':
                href = elem.attrib.get('href', elem.attrib.get('{http://www.w3.org/1999/xlink}href', ""))
                if href and not href.startswith('#'):
                    report["errors"].append({"code": "E_SECURITY_EXTERNAL", "msg": f"External use href detected: {href}"})

            style_text = elem.text if tag == 'style' else elem.attrib.get('style', '')
            if style_text:
                if re.search(r'url\(\s*[\'"]?(?!#)', style_text, re.I) or any(p in style_text.lower() for p in ['@import', 'data:', 'javascript:']):
                    report["errors"].append({"code": "E_SECURITY_STYLE_CONTENT", "msg": ERR_CODES["E_SECURITY_STYLE_CONTENT"]})

            for attr, value in elem.attrib.items():
                if any(p in value.lower() for p in ['http:', 'https:', 'data:', 'javascript:']) and not value.strip().startswith('#'):
                    report["errors"].append({"code": "E_SECURITY_EXTERNAL", "msg": f"Unsafe value in {attr}: {value}"})

        # 3. Contrast
        bg_color_hex = "0a0a0b"
        max_area = 0
        for rect in root.iter('{http://www.w3.org/2000/svg}rect'):
            w = parse_length(rect.attrib.get('width', '0'), v_w)
            h = parse_length(rect.attrib.get('height', '0'), v_w)
            if w * h > max_area:
                max_area = w * h
                c = parse_color(rect.attrib.get('fill', '#000000'))
                if c: bg_color_hex = c
        
        for text in root.iter('{http://www.w3.org/2000/svg}text'):
            txt_color_hex = parse_color(text.attrib.get('fill', '#ffffff'))
            ratio = check_contrast_ratio(bg_color_hex, txt_color_hex)
            if ratio is None:
                if strict: report["errors"].append({"code": "E_CONTRAST_UNRESOLVED", "msg": f"Text color unresolved."})
                else: report["warnings"].append({"code": "W_COLOR_UNRESOLVED", "msg": f"Text color unresolved."})
            elif ratio < 4.5:
                level = "errors" if strict else "warnings"
                report[level].append({"code": "E_CONTRAST_LOW", "msg": f"Contrast ratio {ratio:.2f}:1 low."})

        # 4. A11y
        has_title = any(c.tag.split('}')[-1].lower() == 'title' for c in root)
        has_desc = any(c.tag.split('}')[-1].lower() == 'desc' for c in root)
        if not (has_title and has_desc):
            report["errors"].append({"code": "E_A11Y_MISSING", "msg": ERR_CODES["E_A11Y_MISSING"]})

    except Exception as e:
        report["errors"].append({"code": "E_VALIDATOR_CRASH", "msg": str(e)})

    report["status"] = "ERROR" if report["errors"] else "PASS"
    return report

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", required=True)
    parser.add_argument("--plan")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    log_stderr(f"[*] Validating {args.svg}...")
    report = validate_svg(args.svg, args.plan, args.strict)
    if args.json: print(json.dumps(report))
    else:
        print(f"Status: {report['status']}")
        for e in report["errors"]: print(f"  [ERR] {e['code']}: {e['msg']}")
    sys.exit(1 if report["status"] == "ERROR" else 0)

if __name__ == "__main__": main()
