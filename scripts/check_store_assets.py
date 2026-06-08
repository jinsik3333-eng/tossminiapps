#!/usr/bin/env python3
"""Validate Apps in Toss store image assets.

Checks the assets that caused Toss review rejection:
- icons/logos/thumbnails must be exact size, full-square, and have no transparent pixels
- console upload copies under assets/app-store must match the same rule
- optional app-store zip bundles must contain the corrected images

By default this checks apps 1~6. Pass app directory glob patterns to check another
batch, for example:

    python3 scripts/check_store_assets.py '0[7-9]-*' '1[0-2]-*'
"""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import sys
import zipfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_APP_GLOBS = ["0[1-6]-*"]

PUBLIC_EXPECTED = {
    "public/app-icon.png": (600, 600),
    "public/app-logo.png": (600, 600),
    "public/app-logo-dark.png": (600, 600),
    "public/thumbnail.png": (1932, 828),
}
STORE_EXPECTED = {
    "app-logo-600.png": (600, 600),
    "app-logo-dark-600.png": (600, 600),
    "thumbnail-1932x828.png": (1932, 828),
}
SCREENSHOT_EXPECTED = {
    "screenshot-01-636x1048.png": (636, 1048),
    "screenshot-02-636x1048.png": (636, 1048),
    "screenshot-03-636x1048.png": (636, 1048),
    "screenshot-horizontal-1504x741.png": (1504, 741),
}


def transparent_pixels(image: Image.Image) -> int:
    alpha = image.convert("RGBA").getchannel("A")
    return sum(alpha.histogram()[:255])


def check_image(path_label: str, image: Image.Image, expected_size: tuple[int, int], *, require_rgb: bool) -> list[str]:
    errors: list[str] = []
    if image.size != expected_size:
        errors.append(f"{path_label}: expected {expected_size}, got {image.size}")
    transparent = transparent_pixels(image)
    if transparent:
        errors.append(f"{path_label}: has {transparent} transparent pixels")
    if require_rgb and image.mode != "RGB":
        errors.append(f"{path_label}: expected RGB mode, got {image.mode}")
    return errors


def check_file(path: Path, expected_size: tuple[int, int], *, require_rgb: bool) -> list[str]:
    if not path.exists():
        return [f"{path.relative_to(ROOT)}: missing"]
    try:
        with Image.open(path) as image:
            return check_image(str(path.relative_to(ROOT)), image, expected_size, require_rgb=require_rgb)
    except Exception as exc:  # pragma: no cover - diagnostic path
        return [f"{path.relative_to(ROOT)}: failed to read image: {exc}"]


def check_screenshot_set(directory: Path, label: str) -> list[str]:
    errors: list[str] = []
    if not directory.exists():
        return errors
    portraits = 0
    landscapes = 0
    for path in sorted(directory.glob("*.png")):
        try:
            with Image.open(path) as image:
                rel = str(path.relative_to(ROOT))
                if image.size == (636, 1048):
                    portraits += 1
                elif image.size == (1504, 741):
                    landscapes += 1
                else:
                    errors.append(f"{rel}: unsupported screenshot size {image.size}")
                    continue
                errors.extend(check_image(rel, image, image.size, require_rgb=True))
        except Exception as exc:  # pragma: no cover - diagnostic path
            errors.append(f"{path.relative_to(ROOT)}: failed to read image: {exc}")
    if portraits < 3:
        errors.append(f"{label}: expected at least 3 portrait screenshots, got {portraits}")
    if landscapes < 1:
        errors.append(f"{label}: expected at least 1 landscape screenshot, got {landscapes}")
    return errors


def check_zip(zip_path: Path) -> list[str]:
    errors: list[str] = []
    if not zip_path.exists():
        return errors
    try:
        with zipfile.ZipFile(zip_path) as bundle:
            for name, size in {**STORE_EXPECTED, **SCREENSHOT_EXPECTED}.items():
                if name not in bundle.namelist():
                    errors.append(f"{zip_path.relative_to(ROOT)}: missing {name}")
                    continue
                with Image.open(BytesIO(bundle.read(name))) as image:
                    errors.extend(
                        check_image(
                            f"{zip_path.relative_to(ROOT)}::{name}",
                            image,
                            size,
                            require_rgb=name in STORE_EXPECTED,
                        )
                    )
    except Exception as exc:  # pragma: no cover - diagnostic path
        errors.append(f"{zip_path.relative_to(ROOT)}: failed to read zip: {exc}")
    return errors


def main() -> int:
    errors: list[str] = []
    app_globs = sys.argv[1:] or DEFAULT_APP_GLOBS
    apps = []
    seen: set[Path] = set()
    for app_glob in app_globs:
        for app in sorted((ROOT / "apps").glob(app_glob)):
            if app not in seen:
                apps.append(app)
                seen.add(app)
    if not apps:
        print(f"No apps found for patterns: {', '.join(app_globs)}", file=sys.stderr)
        return 2

    for app in apps:
        slug = app.name.split("-", 1)[1]
        print(f"## {app.relative_to(ROOT)}")
        for rel, size in PUBLIC_EXPECTED.items():
            image_errors = check_file(app / rel, size, require_rgb=True)
            errors.extend(image_errors)
            print(f"  {rel}: {'FAIL' if image_errors else 'ok'}")
        screenshot_dir = app / "public" / "screenshots"
        screenshot_errors = check_screenshot_set(screenshot_dir, str(screenshot_dir.relative_to(ROOT)))
        errors.extend(screenshot_errors)
        print(f"  public/screenshots: {'FAIL' if screenshot_errors else 'ok'}")

        store_dir = ROOT / "assets" / "app-store" / slug
        print(f"## {store_dir.relative_to(ROOT)}")
        for rel, size in {**STORE_EXPECTED, **SCREENSHOT_EXPECTED}.items():
            image_errors = check_file(store_dir / rel, size, require_rgb=rel in STORE_EXPECTED)
            errors.extend(image_errors)
            print(f"  {rel}: {'FAIL' if image_errors else 'ok'}")
        zip_errors = check_zip(store_dir / f"{slug}-appstore-assets.zip")
        errors.extend(zip_errors)
        print(f"  {slug}-appstore-assets.zip: {'FAIL' if zip_errors else 'ok'}")

    if errors:
        print("\nAsset validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("\nStore assets passed: exact sizes, opaque square canvas, and upload bundles verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
