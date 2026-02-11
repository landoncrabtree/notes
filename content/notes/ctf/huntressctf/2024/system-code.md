---
title: HuntressCTF 2024 System Code
draft: false
tags:
  - ctf
  - web-exploitation
---

# System Code

> Follow the white rabbit. NOTE: Bruteforce is permitted for this challenge instance if you feel it is necessary. 

rant: this was such a bad challenge. 

We are given a website that prompts you for an input. 

![[Pasted image 20241008183320.png]]

The first thing that stood out was the `Credit` button which links to the [repository](https://github.com/Rezmason/matrix) the website is based off of. 

The challenge author gave a lot of hints regarding recon and enumeration, so my first though was `feroxbuster`, but there wasn't any files or directories found using `common.txt`, `directory-list-2.3.*`, etc. So, I then focused on the GitHub repo. For example, `README.md` exists, but does it exist on the webserver (assuming they just did a `git clone`). Trying http://challenge.ctf.games:32436/README.md we see it exists! So, let's compare all the GitHub files to get a list of all the different files to further hone in on. 

```python
import requests
import os
import json
import sys
from urllib.parse import unquote, quote

# # Get all files inside of './matrix' directory (recursively)
# files = []
# for root, _, filenames in os.walk('matrix'):
#     for filename in filenames:
#         files.append(os.path.join(root, filename))

# URL = 'http://challenge.ctf.games:32547'

# for file in files:
#     urlPath = file.replace(r"matrix/", "")
#     urlPath = quote(urlPath)
#     r = requests.get(f"{URL}/{urlPath}")
#     #print(f"Requesting {URL}/{urlPath}")
#     if r.status_code == 200:
#         # Compare this file to the original
#         with open(file, "rb") as f:
#             original = f.read()
#         if r.content != original:
#             print(f"File {file} is different")
#         else:
#             print(f"File {file} is the same")
#     else:
#         continue
```

Running this, we get

```
File matrix/glyph order.txt is the same
File matrix/LICENSE is the same
File matrix/prettier_command.txt is the same
File matrix/screenshot.png is the same
File matrix/README.md is the same
File matrix/webgpu_notes.txt is the same
File matrix/js/colorToRGB.js is the same
File matrix/js/config.js is different
File matrix/js/main.js is the same
File matrix/js/camera.js is the same
File matrix/js/webgpu/mirrorPass.js is the same
File matrix/js/webgpu/endPass.js is the same
File matrix/js/webgpu/stripePass.js is the same
File matrix/js/webgpu/main.js is the same
File matrix/js/webgpu/rainPass.js is the same
File matrix/js/webgpu/palettePass.js is the same
File matrix/js/webgpu/utils.js is the same
File matrix/js/webgpu/bloomPass.js is the same
File matrix/js/webgpu/imagePass.js is the same
File matrix/js/regl/quiltPass.js is the same
File matrix/js/regl/mirrorPass.js is the same
File matrix/js/regl/stripePass.js is the same
File matrix/js/regl/main.js is the same
File matrix/js/regl/rainPass.js is the same
File matrix/js/regl/palettePass.js is the same
File matrix/js/regl/utils.js is the same
File matrix/js/regl/lkgHelper.js is the same
File matrix/js/regl/bloomPass.js is the same
File matrix/js/regl/imagePass.js is the same
File matrix/svg sources/texture_simplified.svg is the same
File matrix/svg sources/coptic_texture_simplified.svg is the same
File matrix/svg sources/gothic_texture_simplified.svg is the same
File matrix/svg sources/huberfish_a.svg is the same
File matrix/svg sources/huberfish_d.svg is the same
File matrix/shaders/glsl/quiltPass.frag.glsl is the same
File matrix/shaders/glsl/rainPass.intro.frag.glsl is the same
File matrix/shaders/glsl/stripePass.frag.glsl is the same
File matrix/shaders/glsl/bloomPass.combine.frag.glsl is the same
File matrix/shaders/glsl/palettePass.frag.glsl is the same
File matrix/shaders/glsl/rainPass.frag.glsl is the same
File matrix/shaders/glsl/rainPass.effect.frag.glsl is the same
File matrix/shaders/glsl/bloomPass.highPass.frag.glsl is the same
File matrix/shaders/glsl/bloomPass.blur.frag.glsl is the same
File matrix/shaders/glsl/rainPass.raindrop.frag.glsl is the same
File matrix/shaders/glsl/rainPass.symbol.frag.glsl is the same
File matrix/shaders/glsl/rainPass.vert.glsl is the same
File matrix/shaders/glsl/imagePass.frag.glsl is the same
File matrix/shaders/glsl/mirrorPass.frag.glsl is the same
File matrix/shaders/wgsl/imagePass.wgsl is the same
File matrix/shaders/wgsl/stripePass.wgsl is the same
File matrix/shaders/wgsl/endPass.wgsl is the same
File matrix/shaders/wgsl/palettePass.wgsl is the same
File matrix/shaders/wgsl/bloomBlur.wgsl is the same
File matrix/shaders/wgsl/bloomCombine.wgsl is the same
File matrix/shaders/wgsl/rainPass.wgsl is the same
File matrix/shaders/wgsl/mirrorPass.wgsl is the same
File matrix/lib/regl.js is the same
File matrix/lib/holoplaycore.module.js is the same
File matrix/lib/regl.min.js is the same
File matrix/lib/gpu-buffer.js is the same
File matrix/lib/gl-matrix.js is the same
File matrix/assets/megacity_msdf.png is the same
File matrix/assets/msdf_command.txt is the same
File matrix/assets/pixel_grid.png is the same
File matrix/assets/gtarg_tenretniolleh_msdf.png is the same
File matrix/assets/metal.png is the same
File matrix/assets/gothic_msdf.png is the same
File matrix/assets/gtarg_alientext_msdf.png is the same
File matrix/assets/matrixcode_msdf.png is the same
File matrix/assets/resurrections_glint_msdf.png is the same
File matrix/assets/huberfish_a_msdf.png is the same
File matrix/assets/neomatrixology_msdf.png is the same
File matrix/assets/Matrix-Code.ttf is the same
File matrix/assets/huberfish_d_msdf.png is the same
File matrix/assets/mesh.png is the same
File matrix/assets/resurrections_msdf.png is the same
File matrix/assets/Matrix-Resurrected.ttf is the same
File matrix/assets/sand.png is the same
File matrix/assets/coptic_msdf.png is the same
File matrix/playdate/.gitignore is the same
File matrix/playdate/INSTRUCTIONS.md is the same
File matrix/playdate/matrix_lua/Source/main.lua is the same
File matrix/playdate/matrix_lua/Source/pdxinfo is the same
File matrix/playdate/matrix_lua/Source/images/matrix-glyphs.png is the same
File matrix/playdate/matrix_lua/Source/images/fade-gradient.png is the same
File matrix/playdate/matrix_c/CMakeLists.txt is the same
File matrix/playdate/matrix_c/main.c is the same
File matrix/playdate/matrix_c/Source/pdxinfo is the same
File matrix/playdate/matrix_c/Source/images/matrix-glyphs.png is the same
File matrix/playdate/matrix_c/Source/images/fade-gradient.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/88.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/77.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/63.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/62.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/76.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/89.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/60.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/74.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/48.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/animation.txt is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/49.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/75.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/61.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/59.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/65.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/71.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/70.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/64.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/58.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/8.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/72.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/66.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/67.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/73.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/9.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/14.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/28.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/29.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/15.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/17.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/16.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/12.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/13.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/39.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/11.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/10.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/38.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/35.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/21.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/20.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/34.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/22.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/36.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/37.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/23.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/27.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/33.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/32.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/26.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/18.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/30.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/24.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/25.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/31.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/19.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/95.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/81.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/4.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/56.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/42.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/43.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/5.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/57.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/80.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/94.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/82.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/41.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/55.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/7.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/69.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/68.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/54.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/6.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/40.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/83.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/87.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/93.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/78.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/44.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/2.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/50.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/3.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/51.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/45.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/79.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/92.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/86.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/90.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/84.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/53.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/1.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/47.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/46.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/52.png is the same
File matrix/playdate/matrix_c/Source/images/launcher/card-highlighted/85.png is the same
```

There is only **one** different file, `js/config.js`. This is where I got stuck for a while, trying to compare the webserver's config.js to the GitHub default config.js. One though was the color palette-- maybe the `hsl()` colors if converted to HEX would be an ASCII string? But, that didn't really get me anywhere. 

My next thought was just bruteforcing strings (since the challenge permits it), so started trying characters, quotes, etc from `The Matrix` and `Alice in Wonderland` but no dice there either. 

I went back to analyzing the `config.js` since it was my only lead and noticed a configuration property called `backupGlyphsTwr` which had zero references in the GitHub. 

```js
backupGlyphsTwr: ["a", "b", "c", "d", "e", "f"], // The characters to fallback to if glyphs fail to load
```

![[Pasted image 20241008185032.png]]
It wasn't until I took a break and got home I realized `Twr` was `THE WHITE RABBIT!!` So, I generated permutations of abcdef to try as inputs.

```python
import itertools
import requests
import concurrent.futures

# The characters to permute
characters = 'abcdef'

# Function to generate and print permutations of various lengths
def generate_permutations(characters, min_size, max_size):
    perms = []
    for size in range(min_size, max_size + 1):
        permutations = list(itertools.permutations(characters, size))
        print(f"Permutations of size {size}:")
        for perm in permutations:
            perms.append(perm)
            print(''.join(perm))
        print("\n")
    return perms

# Call the function for sizes 4 to 6
perms = generate_permutations(characters, 4, 6)

def check_permutation(perm):
    url = 'http://challenge.ctf.games:30467/enter='
    r = requests.get(f"{url}{''.join(perm)}")
    if "Incorrect" not in r.text:
        return r.text
    return None

# Use ThreadPoolExecutor for multithreading
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    future_to_perm = {executor.submit(check_permutation, perm): perm for perm in perms}
    for future in concurrent.futures.as_completed(future_to_perm):
        result = future.result()
        if result:
            print(result)
            executor.shutdown(wait=False, cancel_futures=True)
            break
```

And the permutation `bfdaec` gives us the flag!