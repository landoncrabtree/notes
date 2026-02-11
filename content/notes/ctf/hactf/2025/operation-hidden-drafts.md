---
title: HAC CTF 2025 Operation Hidden Drafts
draft: false
tags:
  - ctf
  - web-exploitation
---
# Operation: Hidden Drafts

> Since we just rolled out draft posts, we want to make sure they stay safe from prying eyes. If you want to see the stuff from someone else that hasn't been posted yet, you're outta luck!

This challenge wants us to find the draft post which (presumably) has the flag. The `user_id` 1 is the admin, so I assumed that's where the draft would be too. There is a `/posts` endpoint, that accepts two query parameters: `draft` and `author_id`. I spent some time trying things like `?draft=true`, `?author_id=1`, `?author_id=1&draft=true`, etc. but came to the realization that:

- ?draft=true: 403 Forbidden
- ?draft=false: 200 Success
- ?author_id=1: 200 Success
- ?author_id=1&draft=true: 403 Forbidden
- ?author_id=1&draft=false: 200 Success
- ?author_id=<our_id>&draft=true: 200 Success

There is some backend logic that takes the `author_id` you are trying to grab posts for, and _only_ allows drafts if it's your own ID. At this point, I considered forging JWT to pretend to be the admin user, but signature verification was in place and the secret was not in `rockyou.txt`, so called that off. Then, I considered some noSQL attacks, such as `?draft[$ne]true` but those also failed. I began to look at the Swagger docs: https://spylog.chals.ctf.malteksolutions.com/docs and realized that  `/users/1` would return the admin `UserSchema` which included the admin's password. Maybe the whole `posts` endpoint was a red herring, and we just needed to literally be the admin to see our drafts? Doing this, and grabbing the admin hash, we can throw it into crackstation and get the password `koolman1`. From here, we login as admin and can see our draft post which has the flag!