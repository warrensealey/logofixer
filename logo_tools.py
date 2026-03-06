from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Tuple

from PIL import Image


Color = Tuple[int, int, int, int]  # RGBA


@dataclass
class TargetSize:
    width: int
    height: int


def _load_image(path: Path) -> Image.Image:
    img = Image.open(path)
    return img.convert("RGBA")


def _sample_border_pixels(img: Image.Image, border: int = 5) -> Iterable[Color]:
    width, height = img.size
    pixels = img.load()

    # Top and bottom rows within the border
    for y in range(border):
        if y >= height:
            break
        for x in range(width):
            yield pixels[x, y]
    for y in range(height - border, height):
        if y < 0:
            continue
        for x in range(width):
            yield pixels[x, y]

    # Left and right columns within the border
    for x in range(border):
        if x >= width:
            break
        for y in range(height):
            yield pixels[x, y]
    for x in range(width - border, width):
        if x < 0:
            continue
        for y in range(height):
            yield pixels[x, y]


def infer_background_color(img: Image.Image) -> Color:
    """
    Infer a background color by sampling the image borders and picking
    the most frequent color. Falls back to the top-left pixel.
    """
    width, height = img.size
    pixels = img.load()
    if width == 0 or height == 0:
        # Degenerate image, default to transparent black
        return 0, 0, 0, 0

    samples = list(_sample_border_pixels(img))
    if not samples:
        # Fallback: top-left
        return pixels[0, 0]

    counter: Counter[Color] = Counter(samples)
    # Most common color
    bg, _ = counter.most_common(1)[0]
    return bg


def compute_scaled_size(
    original_width: int, original_height: int, target: TargetSize
) -> Tuple[int, int]:
    if original_width <= 0 or original_height <= 0:
        raise ValueError("Original image has non-positive dimensions.")

    scale_w = target.width / float(original_width)
    scale_h = target.height / float(original_height)
    scale = min(scale_w, scale_h)

    new_w = max(1, int(original_width * scale))
    new_h = max(1, int(original_height * scale))
    return new_w, new_h


def resize_logo_to_canvas(
    input_path: Path,
    output_path: Path,
    target: TargetSize = TargetSize(width=150, height=50),
) -> None:
    """
    Resize a logo to fit within target size while preserving aspect ratio,
    fill remaining area with inferred background color, and save as PNG.
    """
    img = _load_image(input_path)
    bg_color = infer_background_color(img)

    orig_w, orig_h = img.size
    new_w, new_h = compute_scaled_size(orig_w, orig_h, target)

    resized = img.resize((new_w, new_h), Image.LANCZOS)

    # Use an opaque background derived from bg_color (ignore original alpha)
    r, g, b, _a = bg_color
    canvas = Image.new("RGBA", (target.width, target.height), (r, g, b, 255))

    offset_x = (target.width - new_w) // 2
    offset_y = (target.height - new_h) // 2

    canvas.paste(resized, (offset_x, offset_y), resized)

    # Ensure PNG output
    output_path = output_path.with_suffix(".png")
    canvas.save(output_path, format="PNG")

