---
title: HuntressCTF 2024 Mimi
draft: false
tags:
  - ctf
  - forensics
  - mimikatz
---

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