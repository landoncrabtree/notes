---
title: HuntressCTF 2025 Sandy
draft: false
tags:
  - ctf
  - deobfuscation
---

# Sandy

> My friend Sandy is really into cryptocurrencies! She's been trying to get me into it too, so she showed me a lot of Chrome extensions I could add to manage my wallets. Once I got everything sent up, she gave me this cool program! She says it adds better protection so my wallets can't get messed with by hackers.

First, we perform a simple `strings` to check for any instant wins. One thing that stands out are the strings `UPX0` and `UPX1`. This indicates that the executable was likely packed with UPX. Luckily, we can unpack it with `upx -d`. Once unpacked, we can do another `strings` and notice an AutoIt block:

```
strings unpacked.exe

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
<assemblyIdentity
    type="win32"
    processorArchitecture="*"
    version="3.0.0.0"
    name="AutoIt3"
<description>AutoIt v3</description>
<!-- Identify the application security requirements. -->
<trustInfo xmlns="urn:schemas-microsoft-com:asm.v2">
<security>
<requestedPrivileges>
<requestedExecutionLevel
```

We can use [AutoIt-Ripper](https://github.com/nazywam/AutoIt-Ripper) to extract the Autoit script. In it, there is a huge array of base64 encoded strings. I copy and pasted this array into a `.py` and converted it to Python array syntax. 

```python
import base64
import re

stage2 = ""

for chunk in chunks:
    stage2 += base64.b64decode(chunk).decode("utf-16-le", errors="ignore")

print(stage2)
```

Notice we use `utf-16-le` as Windows is UTF16 based. If we use the default of UTF8, then we will get random bytes between our output. This gives us another base64 encoded blob:

```powershell
$decodedScript = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($encodedScript))
Invoke-Expression $decodedScript
```

Again, we can change `Invoke-Expression` to `Write-Host` to just output the decoded content. Doing this, and grepping for flag, we can find 

```
{
                "name": "Flag",
                "path": "flag{27768419fd176648b335aa92b8d2dab2}"
}
```