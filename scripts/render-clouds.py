"""Render VayuSaathi's original cloud artwork. Optional art tool: NumPy and Pillow."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

OUTPUT = Path(__file__).resolve().parents[1] / "public" / "atmosphere"
WIDTH, HEIGHT = 768, 320


def render(seed):
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[:HEIGHT, :WIDTH]

    def grain(cell):
        grid = rng.normal(0, 1, (HEIGHT // cell + 2, WIDTH // cell + 2)).astype("float32")
        return np.asarray(Image.fromarray(grid).resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC))

    # A broken bank of overlapping rising thermals, with smaller lobes at its shoulders.
    warp_x = 11 * grain(36) + 4 * grain(14) + 2 * grain(5)
    warp_y = 9 * grain(35) + 4 * grain(12) + 1.5 * grain(4)
    relief = np.full((HEIGHT, WIDTH), -100.0)
    for cx in np.linspace(88, WIDTH - 88, 12):
        height = np.sin(np.pi * cx / WIDTH)
        radius = rng.uniform(34, 76) * height + 19
        cy = 195 - rng.uniform(12, 62) * height
        for offset in (0, 1, 2):
            size = radius if offset == 0 else radius * rng.uniform(0.35, 0.65)
            px = cx + (rng.uniform(-radius, radius) if offset else 0)
            py = cy + (rng.uniform(-radius * 0.6, radius * 0.6) if offset else 0)
            distance = np.hypot((x + warp_x - px) / 1.22, y + warp_y - py)
            relief = np.maximum(relief, size - distance)

    # Break up the silhouette and light the textured relief from the upper left.
    relief += 9 * grain(28) + 4 * grain(11) + 1.6 * grain(4)
    relief = np.minimum(relief, 238 + 6 * grain(52) + 2 * grain(13) - y)
    soft = Image.fromarray(np.clip(relief + 100, 0, 255).astype("uint8"))
    dy, dx = np.gradient(np.asarray(soft.filter(ImageFilter.GaussianBlur(4)), dtype=float))
    light = 230 - 0.32 * (y - 135) + 9 * dx + 12 * dy + 6 * grain(23)
    opacity = np.clip((relief + 7) / 32, 0, 1)
    opacity = opacity * opacity * (3 - 2 * opacity)
    gray = np.clip(light, 145, 255).astype("uint8")
    rgba = np.dstack((gray, gray, gray, (opacity * 255).astype("uint8")))
    return Image.fromarray(rgba)


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for i, seed in enumerate((581, 749, 1087), start=1):
        render(seed).save(OUTPUT / f"cloud-{i}.webp", quality=88, method=6)
