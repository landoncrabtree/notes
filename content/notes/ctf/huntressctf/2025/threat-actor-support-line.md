---
title: HuntressCTF 2025 Threat Actor Support Line
draft: false
tags:
  - ctf
  - web-exploitation
---

# Threat Actor Support Line

> You've heard of _RaaS_, you've heard of _SaaS_... the _**Threat Actor Support Line**_ brings the two together! Upload the files you want encrypted, and the service will start up its own hacker computer _(as the Administrator user with antivirus disabled, of course)_ and encrypt them for you!

When visiting the website, there's a helpful F.A.Q. section at the bottom, which mentions that the backend uses `Winrar 7.12`. Looking up "Winrar 7.12 vulnerability", there are two seemingly potential candidates:
- CVE-2025-6218
- CVE-2025-8088

From what I was able to determine, `CVE-2025-6218` only affects <= 7.11, but some also posts also reference 7.12 beta 1. CVE-2025-8088 is a guarantee, as it affects <= 7.12. The TL:DR of CVE-2025-8088 is that it uses alternate data streams (ASD) which is an artifact of the NTFS file system, to trick Winrar into extracting files into other locations using standard path traversal tricks (e.g. `../`), so basically, Zip-Slip using ASD. The exploit should be straight forward: Find a proof-of-concept (PoC), create a payload, upload it, and profit! However, that was not the case. We spent a **lot** of time on this challenge. Most PoCs upload the payload to `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`, which would execute when the user logs in. However, our understanding of the backend is not very clear, and it's hard to be sure where we need to drop a file. Using context clues: the wording of the website makes it seem like the potential flow of the application is as follows:

1. You upload the file
2. "Hacking computer" is powered on
3. WinRAR 7.12 uncompresses it
4. Some logic to encrypt the files and add ransom note
5. WinRAR 7.12 compresses it
6. File is sent to webserver
7. "Hacking computer" is powered off

Given that theoretical flow, it makes sense to target Administrator's Startup folder. So, I used [RevShells](https://www.revshells.com/) with a C# payload and compiled it to a `.exe`. The original PoC we tried was this https://github.com/onlytoxi/CVE-2025-8088-Winrar-Tool, but we were never able to pop a shell. Thus, we figured "maybe the Administrator startup logic is incorrect?". What other places could we drop a payload and get execution? One idea is `UnRAR.exe`, which is packaged with WinRAR at `C:\Program Files\WinRAR\UnRAR.exe`. The idea is that we know the automation is un-compressing the file, and it probably is doing it headlessly via CLI, so `UnRAR.exe` is more than likely being executed. Trying to upload a RAR which drops our payload to `C:\Program Files\WinRAR\UnRAR.exe` causes an error on the website-- unfortunate, but a good sign that the exploit is working. It probably failed because `UnRAR.exe` is currently open, so we can't overwrite a file with an active handle. At this point, we were a bit stuck. Dropping into Startup didn't work, UnRAR.exe didn't work, RAR.exe didn't work, and we were running out of ideas on where else could we drop this payload that would get execute. I began to think about other another option:

1) We are assuming the user is Administrator, because the challenge says "running as Administrator". However, that doesn't necessarily mean the username is "Administrator"- could be some other user with admin permissions. I found this PoC https://github.com/pentestfunctions/CVE-2025-8088-Multi-Document which bruteforces using multiple ASDs to guarantee a drop in Startup, without knowing the current user. However, this did not drop us any shell. This made be begin to doubt that Startup was the correct drop location, since this _should_ have been a guaranteed shell if Startup items were actually being executed. 

This challenge was written by John Hammond, if you know anything about HuntressCTF, he usually likes to funnel traffic to his YouTube videos. 

![[jh_winrar.png]]

Would you look at there... a video from John talking about WinWAR being hacked.. which showcases the exact vulnerability we are looking at. I decided that maybe we need to use the exact PoC he showcases in the video. After all, if you're designing a challenge, you will design/test it based on how you know to exploit it. I was able to find the exact PoC used in the video: https://github.com/sxyrxyy/CVE-2025-8088-WinRAR-Proof-of-Concept-PoC-Exploit- and using the following command:

```
echo "idk" > decoy.txt
py poc.py --decoy decoy.txt --payload payload.exe --drop "C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup"
```

We are able to catch a shell (finally). It took about ~3 different times at uploading the same file before the shell caught, but we got it! I'm not sure why the other PoCs didn't work, because they (in theory) should be doing the same thing, and I was dropping **the same** payload to **the same location**, yet they never seemed to catch a shell. Not a fan of brittle challenges like that, but nonetheless, solved!