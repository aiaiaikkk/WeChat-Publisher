#!/usr/bin/env python3
import shutil
import json
import argparse
import sys
import subprocess

def check_tool(tool_name, install_hint):
    path = shutil.which(tool_name)
    version = None
    if path:
        try:
            # 尝试获取版本，仅作为信息
            if tool_name == 'svgo':
                v = subprocess.check_output(['svgo', '--version'], stderr=subprocess.STDOUT).decode().strip()
                version = v
            elif tool_name == 'cairosvg':
                v = subprocess.check_output(['cairosvg', '--version'], stderr=subprocess.STDOUT).decode().strip()
                version = v
        except:
            pass
            
    return {
        "found": path is not None,
        "path": path,
        "version": version,
        "install_hint": install_hint if not path else None
    }

def main():
    parser = argparse.ArgumentParser(description="SVG Architect Environment Doctor")
    parser.add_argument("--json", action="store_true", help="Output machine readable JSON")
    args = parser.parse_args()

    results = {
        "core": {
            "python": check_tool("python3", "Must have Python 3.x installed.")
        },
        "post_processing": {
            "svgo": check_tool("svgo", "npm install -g svgo"),
            "cairosvg": check_tool("cairosvg", "pip install cairosvg"),
            "resvg": check_tool("resvg-js", "npm install -g @resvg/resvg-js")
        }
    }

    # 总体状态判定
    can_convert = results["post_processing"]["cairosvg"]["found"] or results["post_processing"]["resvg"]["found"]
    can_optimize = results["post_processing"]["svgo"]["found"]
    
    status_summary = {
        "ready_for_full_pipeline": can_convert and can_optimize,
        "can_export_png": can_convert,
        "can_optimize_svg": can_optimize
    }

    final_report = {
        "tools": results,
        "status": status_summary
    }

    if args.json:
        print(json.dumps(final_report, indent=2))
    else:
        print("--- SVG Architect Doctor Report ---")
        for category, tools in results.items():
            print(f"\n[{category.upper()}]")
            for name, info in tools.items():
                status = "✅ Found" if info["found"] else "❌ Missing"
                print(f"  {name:10}: {status} ({info['path'] or 'N/A'})")
                if info["install_hint"]:
                    print(f"    Hint: {info['install_hint']}")
        
        print("\n[SUMMARY]")
        for k, v in status_summary.items():
            status = "YES" if v else "NO"
            print(f"  {k:25}: {status}")

if __name__ == "__main__":
    main()
