from PIL import Image
import sys, os

if len(sys.argv) < 2:
  print("Usage: python clear_exif.py <input_file>")
  sys.exit(1)


# open directory and walk all image files, clearing exif data
for root, dirs, files in os.walk(sys.argv[1]):
  for filename in files:
    if filename.endswith((".jpg", ".jpeg", ".png")):
      img_path = os.path.join(root, filename)
      img = Image.open(img_path)
      # Clear EXIF data
      img.info.pop("exif", None)
      img.save(img_path)