---
title: "AdventOfCTF 2024 Day 6: Epochrypt"
draft: false
tags:
  - ctf
---

# Day 6: Epochrypt

> It's time to test out Tibel Elf's new encryption method. He says once you encrypt it, you can't unencrypt it. Sureeee...

The following function is used to perform the encryption of a string:

```python
def epochrypt(enc):
    bits = bytes([(b + 3) % 256 for b in enc])
    based = b64.b64encode(bits)
    epc = str(int(time.time())).encode()
    final = xor(based, epc)
    print(final.hex())
```

Based on this, it seems relatively simple to decrypt a string. We just need to get an encrypted string, determine the (rough estimate) epoch timestamp of when it was encrypted, and perform the reverse of the encryption: XOR -> Base64 decode -> Shift the bytes

I first connected to the remote server to get an encrypted flag: `6b59695a5359570367607f5e6670515a7a5c7d0357707a0760637d0356065c7677650809`

Then, I wrote a Python script that reverses the `epochrypt` functionality and bruteforces the past five minutes of epoch timestamps. This will yield a significant amount of false positives, but luckily the program has a flag checker built-in, so we can validate without needing to waste submissions on the actual CTF platform.

```python
import time
import base64 as b64
from pwn import xor

def decrypt(enc, epoch):
    try:
        final = xor(enc, epoch)
        based = b64.b64decode(final)
        bits = bytes([(b - 3) % 256 for b in based])
        print(bits.decode())
    except Exception as e:
        pass

encrypted = bytes.fromhex("6b59695a5359570367607f5e6670515a7a5c7d0357707a0760637d0356065c7677650809")

# Try -5 minutes
for i in range(5 * 60):
    epoch = str(int(time.time()) - i)
    decrypt(encrypted, epoch.encode())

# csd{d3F0_M4d3_8y_4N_3lf}
```