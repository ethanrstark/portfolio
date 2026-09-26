from pathlib import Path
import re

# Change this to the directory containing your PNGs
directory = Path("./src/assets")

# Matches exactly:
# _({tree type} tree {tree size}) _{frame number}.png
pattern = re.compile(
    r"^_\((.+?)\) _(\d+)\.png$",
    re.IGNORECASE
)

for file in directory.iterdir():
    # Skip directories and non-PNG files
    if not file.is_file() or file.suffix.lower() != ".png":
        continue

    match = pattern.match(file.name)

    if not match:
        print(f"Skipping: {file.name}")
        continue

    frame_name, frame_number = match.groups()



    new_name = f"{frame_name}_{frame_number}.png"
    new_path = file.with_name(new_name)

    # Prevent accidentally overwriting an existing file
    if new_path.exists():
        print(f"Cannot rename — already exists: {new_name}")
        continue

    file.rename(new_path)
    print(f"{file.name} -> {new_name}")