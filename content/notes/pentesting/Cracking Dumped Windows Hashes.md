---
title: Cracking Dumped Windows Hashes
draft: false
tags:
  - pentesting
  - windows
  - credentials
  - cracking
---
# Cracking dumped Windows hashes

https://www.thehacker.recipes/ad/movement/credentials/dumping/sam-and-lsa-secrets
https://www.ired.team/offensive-security/credential-access-and-credential-dumping/dumping-and-cracking-mscash-cached-domain-credentials
https://medium.com/@petergombos/lm-ntlm-net-ntlmv2-oh-my-a9b235c58ed4

## LM Hashes

Dumped Windows hashes are typically in an LM:NT format. If the `LM` hash is `aad3b435b51404ee`, then that's just a NULL/empty hash, which means the password is hashed using `NT`.

If you have a non-null LM hash, Rainbow Tables can be used to crack them due to the technical limitations with LANMAN. For example, LM can only be 14 characters at a maximum with a character set of 46.

- OphCrack with Rainbow Tables [https://ophcrack.sourceforge.io/tables.php](https://ophcrack.sourceforge.io/tables.php)
- Crackstation [https://crackstation.net/](https://crackstation.net/)
- LM Rainbow Table Lookup [http://rainbowtables.it64.com/](http://rainbowtables.it64.com/)

##  NT Hashes

You might often find NT be referenced as `NTLM`. NT/NTLM can be used interchangeably for the sake of this writing. NT hashes are much stronger than LM (and are the default in modern Windows systems).

Example: `7d3f11711c610f013c06959a5e98f2fd`

```
hashcat -a 0 -m 1000 hashes.txt rockyou.txt

john --format=NT --wordlist=rockyou.txt hashes.txt
```

## DCC2/MsCashv2

MsCashv2 is the hash for cached Active Directory credentials. This allows users to login to a domain joined machine even if the Domain Controller is down, preventing lookups. 

Example: `$DCC2$10240#username#hash`

```
hashcat -a 0 -m 2100 hashes.txt rockyou.txt

john --format=mscash2 --wordlist=rockyou.txt hashes.txt
```


