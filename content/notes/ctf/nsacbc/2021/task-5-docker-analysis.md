---
title: NSA Codebreaker Challenge 2021 Task 5
draft: false
tags:
  - ctf
  - nsa
  - cbc
  - codebreaker
  - reverse-engineering
---

# Task 5: Docker Analysis

> A forensic analysis of the server you identified reveals suspicious logons shortly after the malicious emails were sent. Looks like the actor moved deeper into OOPS’ network. Yikes. The server in question maintains OOPS’ Docker image registry, which is populated with images created by OOPS clients. The images are all still there (phew!), but one of them has a recent modification date: an image created by the Prevention of Adversarial Network Intrusions Conglomerate (PANIC). Due to the nature of PANIC’s work, they have a close partnership with the FBI. They’ve also long been a target of both government and corporate espionage, and they invest heavily in security measures to prevent access to their proprietary information and source code. The FBI, having previously worked with PANIC, have taken the lead in contacting them. The FBI notified PANIC of the potential compromise and reminded them to make a report to DC3. During conversations with PANIC, the FBI learned that the image in question is part of their nightly build and test pipeline. PANIC reported that nightly build and regression tests had been taking longer than usual, but they assumed it was due to resourcing constraints on OOPS’ end. PANIC consented to OOPS providing FBI with a copy of the Docker image in question. Analyze the provided Docker image and identify the actor’s techniques.

I started by unzipping the `image.tar` file and analyzing all the files within it. In the `63a520e0f57025e1b1168dca2316143f7d1fdb00d2b2d29c4f400549b67865c9.json` file, you can already see the answer to the first question, ‘“maintainer”: “[carlson.debra@panic.invalid](mailto:carlson.debra@panic.invalid)”’. Next, we need to find which repository is cloned via Git. This can be done two ways; either loading the Docker image and actually running it, or just by analyzing the files yourself. Because I didn’t want to mess with Docker, I decided to just analyze the file system. In the repositories file, we notice ‘“latest”:“6f5fde26cde9fde9a94e4026745b49a6c2af80a7cd51a71ebcfd11c0d04db552”’, so we can start with that folder. If we extract `6f5fde26cde9fde9a94e4026745b49a6c2af80a7cd51a71ebcfd11c0d04db552/layer.tar`, we will see `usr/local/src/build_test.sh` and we will also see the answer to question #2:

```
git clone https://git-svr-45.prod.panic.invalid/hydraSquirrel/hydraSquirrel.git repo
```

All we have to do now is is find the malicious file. Taking a look at `build_test.sh`:

```bash
#!/bin/bash
git clone https://git-svr-45.prod.panic.invalid/hydraSquirrel/hydraSquirrel.git repo
cd /usr/local/src/repo
./autogen.sh
make -j 4 install
make check
```

These are all of the commands ran when the Docker image is loaded. There are only 5 commands, so one of these has to be malicious. It starts with a `git clone` of the hydraSquirrel repository into a `/repo/` folder, and then cd’s into that folder. Then, `autogen.sh` is ran, and then two make commands. Because the repo repository does not exist in the current file system, /usr/local/src/repo/autogen.sh cannot be the malicious file because it doesn’t exist. A key hint is also given by the prompt: “PANIC reported that nightly build and regression tests had been taking longer than usual,” so we know that something is causing the builds to take longer, such as an increased file size. The malicious command is either the `make` or `git`. So, let’s check make out first. If we go to `f9128527ef00a03558d6a486bcc37653a5c1ec88469b18610220305bcdc7d0b3/layer/usr/bin`, we can see make is 8.7MB. Interesting. Now let’s compare that to the `usr/bin/make` file on our host system (For me, MacOS. This applies to any Unix based OS, though). We can run `cd /usr/bin` and then `ls -lh` to see that make is only 134KB by default. With this, we can confidently say that /usr/bin/make is the malicious file, as it has obviously been tampered with– apparent from the increased file size compared to the default make file.