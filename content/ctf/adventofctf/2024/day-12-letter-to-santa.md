---
title: AdventOfCTF 2024 Day 12: Letter to Santa
draft: false
tags:
  - ctf
---

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