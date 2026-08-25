import sys
from pathlib import Path
from PIL import Image, ImageDraw

source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "docx-render-v2"
pages = sorted(source.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
groups = [pages[index:index + 7] for index in range(0, len(pages), 7)]

for group_index, group in enumerate(groups, start=1):
    thumbs = []
    for page in group:
        image = Image.open(page).convert("RGB")
        image.thumbnail((300, 390))
        tile = Image.new("RGB", (320, 430), "#d8d4ca")
        x = (320 - image.width) // 2
        tile.paste(image, (x, 25))
        draw = ImageDraw.Draw(tile)
        draw.text((12, 8), page.stem, fill="#101416")
        thumbs.append(tile)
    columns = 4
    rows = (len(thumbs) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * 320, rows * 430), "#101416")
    for index, tile in enumerate(thumbs):
        sheet.paste(tile, ((index % columns) * 320, (index // columns) * 430))
    sheet.save(source / f"contact-{group_index}.png", quality=92)
