---
title: HuntressCTF 2025 I Forgot
draft: false
tags:
  - ctf
  - volatility
  - forensics
---

# I Forgot

> So.... bad news. We got hit with ransomware. And... worse news... we paid the ransom. _After_ the breach we FINALLY set up _some_ sort of backup solution... it's not that good, but, it might save our bacon... because my VM crashed while I was trying to decrypt everything. And perhaps the worst news... **I forgot the decryption key.** _Gosh, I have such bad memory!!_

We're provided a Windows 11 memory dump. Taking a look at the process list:

```
1388	5920	Notepad.exe	0xdf07c45b70c0	6	-	1	False	2025-09-28 04:41:51.000000 UTC	N/A	Disabled
1628	1388	Notepad.exe	0xdf07c50d2080	17	-	1	False	2025-09-28 04:41:51.000000 UTC	N/A	Disabled
2132	5920	BackupHelper.e	0xdf07c4733080	6	-	1	False	2025-09-28 04:41:51.000000 UTC	N/A	Disabled
```

These are the ones that standout- Notepad.exe and BackupHelper.exe. I made the assumption `BackupHelper.exe` was our decryptor. Another intuition I had, was that: "Maybe the key is in a Notepad". It makes sense: you pay a ransomware, and you don't want to lose the key, so put it somewhere you can find it again. I first tried [this](https://medium.com/@rifqiaramadhan/volatility-3-plugin-kusertime-notepad-sticky-evtxlog-f0e8739eee55) Volatility3 plugin, which is supposed to extract text from Notepad.exe processes. However, I just got a garbled mess, so I think the plugin doesn't work on Windows11(?). I even had ChatGPT try to fix it, but each iteration, the same results for the most part. 

Next, I wanted to try and investigate `BackupHelper.exe` using `vol -f memdump.dmp windows.filescan | grep "BackupHelper.exe"`. The offset is at 0xdf07c4733080, so I tried to dump this using `windows.dumpfiles`, however, it failed. My next step was to try and determine, how exactly BackupHelper works. 

```bash
strings memdump.dmp | grep "BackupHelper"

"C:\Users\User\Desktop\BackupHelper.exe" C:\Users\User\Desktop\DECRYPT_PRIVATE_KEY.zip
```

was an interesting string that stood out. My intuition here was that you pass this ZIP to the binary, and it handles extracting the key(s) from the ZIP and decrypting files. So, let's try to find this ZIP. I first did another `windows.filescan | egrep '\.zip'`, but nothing of interest. At this point, I figured if there was any ZIP, `binwalk` would be the tool to find it. 

```bash
inwalk memdump.dmp -y "zip"

                                                               /Users/landoncrabtree/Downloads/i_forgot/memdump.dmp
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
DECIMAL                            HEXADECIMAL                        DESCRIPTION
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
84237035                           0x5055AEB                          ZIP archive, file count: 5, total size: 459724414 bytes
678578558                          0x2872497E                         ZIP archive, file count: 5, total size: 129249339 bytes
951177608                          0x38B1D188                         ZIP archive, file count: 2, total size: 4294154 bytes
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Analyzed 1 file for 1 file signatures (1 magic patterns) in 289.0 milliseconds
```

So, we find three potential ZIPs, but the last one seems the most probable due to file size. Here, however, binwalk didn't seem to properly extract the .ZIP, so I did it manually with `dd if=memdump.dmp of=recovered.zip bs=1 skip=951177608 count=4294154 status=progress`. If we run `strings` or `xxd`, we can see that this ZIP is still seemingly corrupt (ie: lot's of Microsoft Defender signatures inside it), but we also see references to `private.pem` and `key.enc`, so we're progressing. I wanted to see if there were any other references to these strings, so again:

```bash
strings memdump.dmp | egrep "private\.pem|key\.enc"

1) Extract private.pem from DECRYPT_PRIVATE_KEY.zip (using\
   openssl pkeyutl -decrypt -inkey private.pem -in key.enc -out key_raw.bin -pkeyopt rsa_p
```

Interesting! We have now found decryption instructions. Let us carve the bytes around this string, to try and find the full instruction set:

```bash
strings -a -t d memdump.dmp | grep "Extract private.pem from DECRYPT_PRIVATE_KEY.zip"
389130833 1) Extract private.pem from DECRYPT_PRIVATE_KEY.zip (using\

OFFSET=389130833
WINDOW=65536  # 64 KB
START=$(( OFFSET > WINDOW ? OFFSET - WINDOW : 0 ))
COUNT=$(( WINDOW * 2 ))  # total 128 KB
dd if=memdump.dmp of=carved_bytes.bin bs=1 skip=$START count=$COUNT status=progress
```

We find some very garbled bytes, but we can make it out:

```
On a machine with OpenSSL installed (Linux / Windows(
O), the steps to recover files are:
1) Extract private.pem from DECRYPT_PRIVATE_KEY.zip (using\
ZIP password)
   Example
pSL): un:
L-P "
2Or m
^L7-Zip (GUI): Right-click ->
 archive
Uenter
2) Decrypt
AES key+IV:
openssl pkeyutl -d-
i-inkey)
0-in<
.enc -out
_raw.bin -B
opt rsa_padding_mode:oaepl
(This writes<
: first 32 by
 (hex), next 16
jIV)
Bdata
KEYHEX=$(xxd -p -c 256r
p | head
064)}
/IV3
@tail3
!323
d -aes-256-cbc+
txt -K $
a -iv $z
twill be
key.
```

TL:DR

1. Extract `private.pem` and `key.enc` from the ZIP using the zip password
2. Decrypt `key.enc` with the private key
3. Split `key_raw.bin` into AES key and IV 
4. Decrypt flag.enc with AES key and IV

So, we just need to find the ZIP password. One final `strings` and hope:

```bash
strings memdump.dmp | grep "ZIP password"

ZIP password: ePDaACdOCwaMiYDG
```

So, now, we should be able to decrypt, First, we use `7z x recovered.zip` wit the password `ePDaACdOCwaMiYDG`


then, run `strings memdump | grep "ZIP password"` and find password: `ePDaACdOCwaMiYDG`. Using `unzip` to decrypt worked, whereas `7z x` failed. 

```bash
unzip Recovered_3.zip
Archive:  Recovered_3.zip
warning [Recovered_3.zip]:  4292216 extra bytes at beginning or within zipfile
  (attempting to process anyway)
[Recovered_3.zip] private.pem password:
  inflating: private.pem
replace key.enc? [y]es, [n]o, [A]ll, [N]one, [r]ename: y
 extracting: key.enc
```

Now, we can decrypt `key.enc` with `private.pem`, grab the key and IV, and decrypt!

```bash
openssl pkeyutl -decrypt -inkey private.pem -in key.enc -out key_raw.bin -pkeyopt rsa_padding_mode:oaep

KEYHEX=$(xxd -p key_raw.bin | tr -d '\n' | cut -c1-64)
IVHEX=$(xxd -p key_raw.bin | tr -d '\n' | cut -c65-96)

openssl enc -d -aes-256-cbc -in flag.enc -out flag.txt -K $KEYHEX -iv $IVHEX
```

Flag: `flag{fa838fa9823e5d612b25001740faca31}`