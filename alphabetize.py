import sys

if len(sys.argv) < 2:
  print("Usage: python alphabetize.py <input_file>")
  sys.exit(1)

l = sys.argv[1:]
l.sort()
for i in l:
  print(i, end=", ")