---
title: CSAW 2024 ZipZipZipZi........
draft: false
tags:
  - ctf
---

# ZipZipZipZi........

> Brighten up at last with the flag

We are given a singular zip file. When unzipping with `unzip challenge.zip`, we are given `chunk1.zip` and `chunk0.txt`. Looking at `chunk0.txt`, it looks like base64. So, we can assume we need to recursively unzip, grab all the chunks, and convert our base64 into a file.


```python
import subprocess
import base64

nextZip = "challenge.zip"
chunks = []

try:
    while True:
        if "zip" not in nextZip: break
        unzip = f"unzip {nextZip}"
        rm = f"rm {nextZip}"
        output = subprocess.check_output(unzip, shell=True).decode()
        if "extracting" in output:
            print(output)
            nextZip = output.split()[-1]
            print(f"Extracted {nextZip}")
            chunks.append(nextZip.replace(".zip", ".txt"))
            subprocess.check_output(rm, shell=True)
        else:
            print("Finished")
            break
except KeyboardInterrupt:
    print("ok we done")
    pass

base64png = ""
for chunk in chunks[:-1]:
    with open(chunk, "r") as f:
        base64png += f.read().strip()
with open("flag.png", "wb") as f:
    f.write(base64.b64decode(base64png + "=="))
```