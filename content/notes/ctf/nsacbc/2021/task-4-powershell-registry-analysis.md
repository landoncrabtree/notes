---
title: NSA Codebreaker Challenge 2021 Task 4
draft: false
tags:
  - ctf
  - nsa
  - cbc
  - codebreaker
  - reverse-engineering
---

# Task 4: PowerShell, Registry Analysis

> A number of OOPS employees fell victim to the same attack, and we need to figure out what’s been compromised! Examine the malware more closely to understand what it’s doing. Then, use these artifacts to determine which account on the OOPS network has been compromised.

Extracting `artifacts.zip` reveals a bunch of PuTTY public and private keys, and a `NTUSER.DAT` file. If we analyze `malicious.ps1`, we notice that the code is extracting active WinSCP, PuTTY, and RDP sessions from all users in the current hive.

> The registry is divided into sections known in Microsoft terminology as hives, and the ntuser.dat file is a copy of the data stored in the registry hive for a specific user, organized in a set of hives called HKEY_USERS. When you are logged in, your user hive can be found in the registry as HKEY_CURRENT_USER.” (TechWalla)

It turns out viewing Windows registry files is insanely hard to do on macOS. I first tried a Java application called RegeditEx, which allowed me to view the directories, but I wasn’t able to view any key pair values. I then tried PyRegEdit, but I wasn’t able to install the dependencies it required as it’s 8 years old. So, I booted up Kali and used the already installed `hivexsh` tool, which allows you to view and modify Windows Registry files. Running `hivexsh NTUSER.dat` allows you to interact with the file just like normal Linux file system. You can use `cd` to move around and `ls` to list files. If we take a look at the PowerShell script, we notice it gets active sessions from:

```
$PuTTYPathEnding = "\SOFTWARE\SimonTatham\PuTTY\Sessions"
$WinSCPPathEnding = "\SOFTWARE\Martin Prikryl\WinSCP 2\Sessions"
```

Since we’re looking for PuTTY sessions, let’s go to that directory. We simply run

```
cd Software\SimonTatham\PuTTY\Sessions
```

and we are given the PuTTY sessions that were active at the time. This reduces our options to 5 machines. Now we have to reduce it to one.

Our options are dkr_prd16, dkr_prd24, dkr_prd71, dkr_prd80, and dkr_tst07. We have to figure out which machine the attacker would be able to access. I then began analyzing the PuTTY private key files, starting with `dkr_prd16.ppk`:

```
PuTTY-User-Key-File-2: ssh-rsa
Encryption: aes256-cbc
Comment: __COMP1__
Public-Lines: 6
AAAAB3NzaC1yc2EAAAABJQAAAQEAiAftVqF4iJdXq+y6qnpfFWJCfGirnA3ITHlH
x67fTGNMHI/8aziKO/DSgvqbg1T0Fam83MSFsdtqgaPXhvG4oLFAqKyomOTmsy2l
ja7zpOB8YnCya78pnRip5zDaz9tIXZOSvS/7Ak7OT70V3JV28EgkwsgVTN83eF7J
L9i3p0+CAaNUxYv63p3hc4pL4U+O7CuBCOaxSYCM/opZiauLCrxCuWcJd4rLfv5s
99/3Frx5/Bed1uJxZlk5sMa5VRAtYJLfiLqHFJpsmfJ0v0pbISAYMi+uk1drpBWR
qNEUurwME/U7lyeyveYHPEctwczFgvEf+uT4+iV2YqQFlCjvfQ==
Private-Lines: 14
ZFLMFmJiQ95RW0j0zlXDHHBP/DvBk+2GRdgeDz4TxTY5Nfy4oqL2WjL1jaaUOSa4
NUOss9e7ZjConu7COEcIOOJKj9DgqyyFhXmF730I7QmjJkVp2WzzlQipoxe4/t8W
yDOEpafOEDNnerBlnQ2UBt3ayxdu3YUP1DSMTaEz7PQNRPK5g3kT8YMSp2PluS1Z
PxltbeQ8gkEX0Z6Y8+3u7r939qmLyvkpS0pKgFIjmk9CnX3TuH20+GmEd7XXk16U
kryG6eaLGy27EB9CYt+WmXRSpWntdQwqCS1REwubcQETJ5YYf6PwZzHUWErG8o1f
j2rG4tW741KfxWc5dGkkJdwN09gXFNydIzQvIndMuFZtnm3nI9LWFeSeJUPicE6R
11Kr3p9JwejZMw+thAmAtuOixY9NT5M6886xZG/lfiWCRXspDa/PgakPFeNeKC5f
Aim10Agu0SbDu7bwtObr56kggCOUSGECNwrtod5Rd3duxeO/+dPi3Z3KJoOzEAUr
vuUwISyuSkLNdtb7sH1SqxShoXnkD85dDoBpqlSgBJb5zoh5vzLqaXWVKYsSvY4f
PG59UwQj/EPIaKCle+X28os/0Efh8xwrLspgR5dR08/cF9HxneguRVJu1LSvOQ2M
zx35OsCZa56dItSxIQhqRnh4YAKMzSYq+iPRe3AHxgmGIXbJfGjlM888Xt2iXJej
djb+Ueh6j8JXeFTiqfqZ+l8LpLahxvN4Midl+yANEWZc7ulpmW/zi/u2KwApcOb1
xoK3KGQ4ZeinM4u4f1eW8mcXEOZb+8J9r8UYzr9kMeQYv3+QZsECxpI7IidQVuUJ
XZkBL923Uk4eT/ACb0lLgOsTmTHqr/+VTr8uASIBuBZ9jaKuBi7YrXcVATGZ0L4r
Private-MAC: cc925b7288219c35ffc0080fc3976b090e957c10
```

Thee first thing that stood out to me was the Encryption: ‘AES256-CBC’. An attacker would want to attack a device with no encryption. So, I went through all of the .ppk files for the machines that had active PuTTY sessions, and when I got to `dkr_prd80.ppk`, I noticed: ‘Encryption: none’. There we go, we know the attacker attacked that machine. If we head back to `hivexsh`, we can use `cd dkr_prd80` and then `lsval` to list all of the keypairs. At the very top, we will see one specific value: ‘“HostName”=“hypervbot@dkr_prd80”’. So we now have the username, `hypervbot` and the machine, `dkr_prd80`.