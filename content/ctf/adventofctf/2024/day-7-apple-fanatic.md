---
title: AdventOfCTF 2024 Day 7: Apple Fanatic
draft: false
tags:
  - ctf
---

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