---
title: HAC CTF 2025 Time Vault
draft: false
tags:
  - ctf
  - web-exploitation
  - jwt
---
# Time Vault

> The Chronos Corporation has developed a revolutionary "Time Vault" that locks away secrets for a hundred years. Only those with a valid access token and enough patience can open the vault... or so they claim. Can you find a way to unlock the vault and claim the flag before the century is up?

Taking a look at the web application, there are two primary endpoints: `request-access` and `open-vault`. request-access returns a JWT and open-vault takes a JWT. There isn't any parameters passed to request-access, so we can't try to control what gets passed to the backend when the JWT is being made. I decided to try a simple `algorithm=None` attack, which basically removes the signature from a JWT and declares the algorithm as `None`, and if a backend is susceptible, it will use the same algorithm and ignore any integrity checks. 

```python
jwt_json = {
   "access_id": "TV-98091",
   "requestor_ip": "10.2.5.15",
   "unlock_timestamp": 1747348400,
   "current_timestamp": 1747348400
}


jwt_token = jwt.encode(jwt_json, None, algorithm='none')
print(jwt_token)
```

This creates a JWT using the same payload as the original application, it just modifies the `unlock_timestamp` to be _now_ rather than in the future. With this JWT, we can call `open-vault` and get the flag :) 