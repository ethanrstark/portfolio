from pathlib import Path
from PIL import Image, ImageOps

# ---- Settings ----
INPUT_DIR = Path("bushes")
OUTPUT_DIR = Path("cropped")

PADDING = 1  # transparent pixels around each sprite


def crop_sprite(input_path: Path, output_path: Path):
    image = Image.open(input_path).convert("RGBA")

    # Get the alpha (transparency) channel
    alpha = image.getchannel("A")

    # Find bounding box containing all non-transparent pixels
    bbox = alpha.getbbox()

    # Completely transparent image
    if bbox is None:
        print(f"Skipping empty image: {input_path.name}")
        return

    # Crop tightly around visible pixels
    cropped = image.crop(bbox)

    # Add transparent padding
    padded = ImageOps.expand(
        cropped,
        border=PADDING,
        fill=(0, 0, 0, 0)
    )

    padded.save(output_path)

    print(
        f"{input_path.name}: "
        f"{image.width}x{image.height} -> "
        f"{padded.width}x{padded.height}"
    )


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for file in INPUT_DIR.iterdir():
        if file.is_file() and file.suffix.lower() == ".png":
            output_path = OUTPUT_DIR / file.name
            crop_sprite(file, output_path)


if __name__ == "__main__":
    main()