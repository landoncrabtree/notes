---
title: NSA CodebreakerChallenge 2024 Task 2
draft: false
tags:
  - ctf
  - forensics
  - nsa
  - codebreaker
  - cbc
---

# Task 2 - Driving Me Crazy - (Forensics, DevOps)

> Having contacted the NSA liaison at the FBI, you learn that a facility at this address is already on a FBI watchlist for suspected criminal activity. With this tip, the FBI acquires a warrant and raids the location. Inside they find the empty boxes of programmable OTP tokens, but the location appears to be abandoned. We're concerned about what this APT is up to! These hardware tokens are used to secure networks used by Defense Industrial Base companies that produce critical military hardware. The FBI sends the NSA a cache of other equipment found at the site. It is quickly assigned to an NSA forensics team. Your friend Barry enrolled in the [Intrusion Analyst Skill Development Program](https://www.intelligencecareers.gov/nsa/development-program#iasdp) and is touring with that team, so you message him to get the scoop. Barry tells you that a bunch of hard drives came back with the equipment, but most appear to be securely wiped. He managed to find a drive containing what might be some backups that they forgot to destroy, though he doesn't immediately recognize the data. Eager to help, you ask him to send you a zip containing a copy of the supposed backup files so that you can take a look at it. If we could recover files from the drives, it might tell us what the APT is up to. Provide a file with unique SHA256 hashes of all files you were able to find from the backups.

We're provided with `archive.tar.bz2` so let's first extract it with `tar -xvjf archive.tar.bz2`. We end up with a bunch of `logseq*` files, and if we run file:

```bash
file logseq*

...
logseq77252293125371:    ZFS snapshot (little-endian machine), version 17, type: ZFS, destination GUID: 2A 04 FFFFFFED FFFFFFDC FFFFFFC2 FFFFFF96 FFFFFFE9 FFFFFF89, name: 'wjcppool/qdfs@logseq77252293125371'
...
```

So, looks like we have some ZFS snapshots. My first thought was to just `binwalk` the snapshots and grab the SHA256 hash(es) of any extracted files. I did this using `binwalk -eM --dd=".*" logseq*` and a python script to recursively open all the `_logseq*_extracted` folders that binwalk generates, but my answer was incorrect. I figured it would be incorrect, but thought maybe I could get a quick win 😦 So, I guess I'll need to do legitimate ZFS snapshot recovery. I spun up an AWS EC2 instance, created a new volume, and attached it to the instance. Then, I got ZFS up and running:

```bash
sudo apt install zfsutils-linux
sudo zpool create wjcppool /dev/xvdf
sudo zfs create wjcppool/qdfs
```

Now, I have a pool and filesystem that matches the ZFS snapshots. Now, I just need to get the base snapshot and order the incremental snapshots. Doing some quick `grep`-fu, I was able to order the snapshots from earliest to latest.

```bash
grep -ain "January 02" logseq*
grep -ain "January 03" logseq*
grep -ain "January .." logseq*
grep -ain "January 30" logseq*
```

```
Jan 2 logseq11688836119012-i
Jan 3 logseq286942769432268-i
Jan 4 logseq209932396930821-i
Jan 5 logseq27136158271647-i
Jan 6 logseq29171777129512-i
Jan 7 logseq102452543011321-i
Jan 8 logseq2468511167737-i
Jan 9 logseq32881554713545-i
Jan 10 logseq24796312017972-i
Jan 11 logseq55853168410708-i
Jan 12 logseq11027531712611-i
Jan 13 logseq15803315518981-i
Jan 14 logseq290492998122354-i
Jan 15 logseq259992022729275-i
Jan 16 logseq24965400441-i
Jan 17 logseq16205262583362-i
Jan 18 logseq21208259776628-i
Jan 19 logseq18162965925393-i
Jan 20 logseq213721945032207-i
```

One thing to note here is that originally, is that `January 13` never appeared via grep. I just saw that we only had `18` dates out of `19` logseq*-i files and Jan 13 was the one missing. Now, we can start receiving these snapshots. First, we need the base snapshot which I assumed was `logseq77252293125371` since there is no `-i` suffix.

```bash
sudo zfs recv wjcppool/qdfs@logseq77252293125371 -F < logseq77252293125371
```

Now, I just need to receive each incremental snapshot and get all SHA256 hashes of any files that are contained. 

```python
import os
import subprocess

cwd = '/wjcppool/qdfs/'
hashes = []

# get all folders recursively
folders = [x[0] for x in os.walk(cwd)]
folders = folders[1:]
print(folders)

for folder in folders:
    # get sha256 hash of all files in the folder
    files = os.listdir(os.path.join(cwd, folder))
    for file in files:
        # Make sure it's a file and not a directory
        file_path = os.path.join(cwd, folder, file)
        if not os.path.isfile(file_path):
            continue
        print(file_path)
        sha256 = subprocess.check_output(['sha256sum',  file_path]).decode().split()[0]
        hashes.append(sha256)

# get unique hashes
hashes = list(set(hashes))
print('\n'.join(hashes))
```

```bash
sudo zfs recv wjcppool/qdfs@logseq11688836119012 -F < logseq11688836119012-i
python3 hashes.py

sudo zfs recv wjcppool/qdfs@logseq286942769432268 -F < logseq286942769432268-i
python3 hashes.py

...

sudo zfs recv wjcppool/qdfs@logseq213721945032207 < logseq213721945032207-i
python3 hashes.py
```

Lastly, I just removed duplicate hashes and now we have a list of all the unique files we were able to extract from the ZFS snapshots! Could have scripted it out also, but this worked just as good.

edit: Created an automation script for this.

```python
import os
import subprocess

snapshots = [
    "logseq11688836119012-i",
    "logseq286942769432268-i",
    "logseq209932396930821-i",
    "logseq27136158271647-i",
    "logseq29171777129512-i",
    "logseq102452543011321-i",
    "logseq2468511167737-i",
    "logseq32881554713545-i",
    "logseq24796312017972-i",
    "logseq55853168410708-i",
    "logseq11027531712611-i",
    "logseq15803315518981-i",
    "logseq290492998122354-i",
    "logseq259992022729275-i",
    "logseq24965400441-i",
    "logseq16205262583362-i",
    "logseq21208259776628-i",
    "logseq18162965925393-i",
    "logseq213721945032207-i"
]

# Base snapshot
subprocess.run("zfs create wjcppool/qdfs", shell=True)
subprocess.run("zfs recv -F wjcppool/qdfs@logseq77252293125371 < logseq77252293125371", shell=True)

hashes = []
cwd = '/wjcppool/qdfs/'
os.makedirs("./extracted", exist_ok=True)

for snapshot in snapshots:
    cmd = f"zfs recv -F wjcppool/qdfs@{snapshot[:-2]} < {snapshot}"
    subprocess.run(cmd, shell=True)

    # get all folders recursively
    folders = [x[0] for x in os.walk(cwd)]
    folders = folders[1:]
    print(folders)

    for folder in folders:
        files = os.listdir(os.path.join(cwd, folder))
        for file in files:
            file_path = os.path.join(cwd, folder, file)
            if not os.path.isfile(file_path): continue
            print(file_path)
            sha256 = subprocess.check_output(['sha256sum',  file_path]).decode().split()[0]
            hashes.append(sha256)
            # Copy file
            os.makedirs(os.path.join("./extracted", snapshot), exist_ok=True)
            subprocess.run(f"cp '{file_path}' './extracted/{snapshot}/'", shell=True)

# get unique hashes
hashes = list(set(hashes))
print('\n'.join(hashes))

# reset zfs
cmd = "zfs destroy -r wjcppool/qdfs"
subprocess.run(cmd, shell=True)
```