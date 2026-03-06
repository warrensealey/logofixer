from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import UnidentifiedImageError

from logo_tools import TargetSize, resize_logo_to_canvas


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Resize a logo to fit within a target box while preserving aspect ratio, "
            "fill remaining area with the inferred background color, and save as PNG. "
            "Accepts common image formats such as JPEG/JPG, PNG, GIF, BMP, WEBP, and TIFF."
        )
    )
    parser.add_argument(
        "-i",
        "--input",
        required=True,
        help="Path to the input logo image (JPEG/JPG, PNG, GIF, BMP, WEBP, TIFF, etc.).",
    )
    parser.add_argument(
        "-o",
        "--output",
        required=True,
        help="Path to the output PNG image.",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=150,
        help="Target canvas width in pixels (default: 150).",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=50,
        help="Target canvas height in pixels (default: 50).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.is_file():
        print(f"Error: input file does not exist: {input_path}", file=sys.stderr)
        return 1

    if args.width <= 0 or args.height <= 0:
        print("Error: width and height must be positive integers.", file=sys.stderr)
        return 1

    target = TargetSize(width=args.width, height=args.height)

    try:
        resize_logo_to_canvas(input_path, output_path, target)
    except UnidentifiedImageError:
        print(f"Error: unable to open image file (unsupported or corrupted): {input_path}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover - generic safety net
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

