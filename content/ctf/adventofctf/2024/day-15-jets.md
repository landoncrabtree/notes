---
title: "AdventOfCTF 2024 Day 15: JETS"
draft: false
tags:
  - ctf
---

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