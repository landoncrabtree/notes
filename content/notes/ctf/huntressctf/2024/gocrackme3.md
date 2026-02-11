---
title: HuntressCTF 2024 GoCrackMe3
draft: false
tags:
  - ctf
  - reverse-engineering
  - go
---

# GoCrackMe3

I didn't keep good documentation of this one. It was more trial and error until something worked. Despite not being a good writeup, I'm including it because there were only ~100 solves after 20 days. It was basically a lot of patching. For example, `0x004f7a76 JZ` to `JNZ` would give the 'Access still denied' message. Then at `4f7fcd` you could patch to get 'Actually, I don't feel like printing the flag...' 

![[Pasted image 20241031160953.png]]

I kept repeating the patching of the logic (basically just invert everything) and changing some of the `JMP` branches, and eventually you can get to `004f81a4` which generates chunks of the flag in memory. By default, it only does 3 chunks: `221fccaa8`, `flag{32b2`, `42024a30b` and you need to patch the for loop to get the last chunk: `edda76fdc2`.

![[Pasted image 20241031161034.png]]

I cheesed this pretty hard since it was out of order, but I just generated all permutations and tried each one.

```
flag{221fccaa832b242024a30bedda76fdc2}
flag{221fccaa832b2edda76fdc242024a30b}
flag{221fccaa842024a30b32b2edda76fdc2}
flag{221fccaa842024a30bedda76fdc232b2}
flag{221fccaa8edda76fdc232b242024a30b}
flag{221fccaa8edda76fdc242024a30b32b2}
flag{32b2221fccaa842024a30bedda76fdc2}
flag{32b2221fccaa8edda76fdc242024a30b}
flag{32b242024a30b221fccaa8edda76fdc2}
flag{32b242024a30bedda76fdc2221fccaa8}
flag{32b2edda76fdc2221fccaa842024a30b}
flag{32b2edda76fdc242024a30b221fccaa8}
flag{42024a30b221fccaa832b2edda76fdc2}
flag{42024a30b221fccaa8edda76fdc232b2}
flag{42024a30b32b2221fccaa8edda76fdc2}
flag{42024a30b32b2edda76fdc2221fccaa8}
flag{42024a30bedda76fdc2221fccaa832b2}
flag{42024a30bedda76fdc232b2221fccaa8}
flag{edda76fdc2221fccaa832b242024a30b}
flag{edda76fdc2221fccaa842024a30b32b2}
flag{edda76fdc232b2221fccaa842024a30b}
flag{edda76fdc232b242024a30b221fccaa8}
flag{edda76fdc242024a30b221fccaa832b2}
flag{edda76fdc242024a30b32b2221fccaa8}
```

I got the correct flag on my third attempt. Also, using https://github.com/getCUJO/ThreatIntel for Ghidra helps with the process a lot. You can also use this [PR](https://github.com/getCUJO/ThreatIntel/pull/4) by https://github.com/monoidic which adds golang 1.20 support.