---
title: Red Team Tooling
draft: false
tags:
  - redteam
  - tooling
---
### Defense Evasion
Repository | Description
---- | ----
[Amsi-Bypass-PowerShell](https://github.com/S3cur3Th1sSh1t/Amsi-Bypass-Powershell) | AMSI bypasses (Most are patched, but can be obfuscated to bypass)
[AMSITrigger](https://github.com/RythmStick/AMSITrigger) | Finds which string(s) trigger AMSI.
[chameleon](https://github.com/klezVirus/chameleon) | PowerShell Script Obfuscator
[Invisi-Shell](https://github.com/OmerYa/Invisi-Shell) | Used to bypass PowerShell security (logging, AMSI, etc).
[Invoke-Obfuscation](https://github.com/danielbohannon/Invoke-Obfuscation>) | PowerShell module for obfuscating PowerShell scripts to bypass AV/EDR solutions.
[ISESteroids](https://powershell.one/isesteroids/quickstart/overview) | Powerful extension for the built-in ISE PowerShell editor (has obfuscation module)
[Invoke-Stealth](https://github.com/JoelGMSec/Invoke-Stealth) | Simple & Powerful PowerShell Script Obfuscator
[UPX](https://upx.github.io/) | PE packer.
[Unprotect](https://unprotect.it) | Contains malware evasion techniques along with PoC. 

### OSINT
Repository | Description
---- | ----
[Cloudmare](https://github.com/mrh0wl/Cloudmare) |  Cloudflare, Sucuri, Incapsula real IP tracker. 
[crt.sh](https://crt.sh) | Find certificates based on a domain name. Can be used to find subdomains.
[DorkSearch](https://dorksearch.com/) | Premade Google dork queries.
[ExifTool](https://exiftool.org) | Read (and modify) metadata of files.
[FaceCheck.ID](https://facecheck.id) | Reverse image lookup based on facial-recognition.
[Hunter](https://hunter.io) | Find company email format and list of employee email addresses.
[osintframework](https://osintframework.com/) | An online database of OSINT tools.
[PimEyes](https://pimeyes.com/) | Reverse image lookup based on facial-recognition.
[Recon-NG](https://github.com/lanmaster53/recon-ng) | Reconaissance and OSINT framework. Has many modules such as port scanning, subdomain finding, Shodan, etc.
[ScrapeIn](https://github.com/landoncrabtree/ScrapeIn) | Scrapes LinkedIn to create a list of employee email addresses (for use in Initial Access).
[SecurityTrails](https://securitytrails.com) | Extensive DNS information.
[Shodan](https://shodan.io) | Scans for all digital assets.
[SpiderFoot](https://spiderfoot.net) | Automatic OSINT analysis.
[TheHarvester](https://github.com/laramies/theHarvester) | Collects names, emails, IPs, and subdomains of a target.

### Reconaissance
Repository | Description
---- | ----
[altdns](https://github.com/infosec-au/altdns) | Subdomain enumeration using mutated wordlists.
[AWSBucketDump](https://github.com/jordanpotti/AWSBucketDump) | Enumerate AWS S3 buckets to find interesting files.
[burpsuite](https://portswigger.net/burp) | An advanced web application testing suite that can be used to get info on how webpages work.
[CameRadar](https://github.com/Ullaakut/cameradar) |  Cameradar hacks its way into RTSP videosurveillance cameraa
[CloudBrute](https://github.com/0xsha/CloudBrute) | Enumerates "the cloud" (Google, AWS, DigitalOcean, etc) to find infrastructure, files, and apps for a given target.
[dirb](https://github.com/v0re/dirb) | Web application directory / file fuzzer to find other pages.
[DNSDumpster](https://dnsdumpster.com/) | Online tool for DNS information of a domain.
[EyeWitness](https://github.com/FortyNorthSecurity/EyeWitness) | Screenshots webpages. Supports multi-domain lists and Nmap output.
[feroxbuster](https://github.com/epi052/feroxbuster) | Like dirb, but written in Rust.
[gobuster](https://github.com/OJ/gobuster) | Like dirb, but written in Go. Also supports DNS busting (such as subdomains).
[GoWitness](https://github.com/sensepost/gowitness) | Like EyeWitness, but in Go.
[Masscan](https://github.com/robertdavidgraham/masscan) | Like nmap, but faster (thus, not stealthy.)
[Nikto](https://github.com/sullo/nikto) | Web server scanner to perform security checks on a web server.
[Nmap](https://nmap.org/) | Find running services on a network.
[Raccoon](https://github.com/evyatarmeged/Raccoon) | All-in-one Reconaissance. Port/service scans, dirbusting, and web application retrieval.
[Recon-NG](https://github.com/lanmaster53/recon-ng) | Reconaissance and OSINT framework. Has many modules such as port scanning, subdomain finding, Shodan, etc.
[Rustscan](https://github.com/RustScan/RustScan) | A rust network scanner that is faster than Nmap, and sends open ports to Nmap for service/version detection.
[subfinder](https://github.com/projectdiscovery/subfinder) | Passive subdomain discovery tool.
[wappalyzer](https://www.wappalyzer.com/) | Identify what frameworks a website runs
[wpscan](https://github.com/wpscanteam/wpscan) | Automatic WordPress scanner to identify information about a WordPress site and possible vulnerabilities.

### Social Engineering
Repository | Description
---- | ----
[evilginx](https://github.com/kgretzky/evilginx2) | Standalone man-in-the-middle attack framework used for phishing login credentials along with session cookies, allowing for the bypass of 2-factor authentication
[GoPhish](https://github.com/gophish/gophish>) | Phishing campaign framework to compromise user credentials.
[Social Engineering Toolkit](https://github.com/trustedsec/social-engineer-toolkit) | Social engineering framework. 
[SpoofCheck](https://github.com/BishopFox/spoofcheck) | Checks if a domain can be spoofed.
[zphisher](https://github.com/htr-tech/zphisher) | An automated phishing tool with 30+ templates.

### Leaked Credentials
Repository | Description
---- | ----
[Dehashed](https://dehashed.com) | Leaked credential search engine to find passwords based on username, email, etc.
[LeakCheck](https://leakcheck.com) | Leaked credential search engine to find passwords based on username, email, domain, etc.
[Snusbase](https://snusbase.com) | Leaked credential search engine to find passwords based on username, email, etc.

### Web Exploitation
Repository | Description
---- | ----
[Arachni](https://github.com/Arachni/arachni) |  Web Application Security Scanner Framework
[burpsuite](https://portswigger.net/burp/communitydownload) | Full web testing suite, including proxied requests
[Caido](https://caido.io/) | Like Burp but written in Rust
[dirb](https://github.com/v0re/dirb) | Web application directory/file fuzzer to find other pages or files worth looking at.
[dotGit](https://github.com/davtur19/DotGit) | A Firefox and Chrome extension that shows you if there is an exposed `.git` directory 
[feroxbuster](https://github.com/epi052/feroxbuster) | Web application directory/file fuzzer to find other pages or files worth looking at. Written in Rust.
[flask-unsign](https://github.com/Paradoxis/Flask-Unsign) | Command line tool to fetch, decode, brute-force and craft session cookies of a Flask application
[gobuster](https://github.com/OJ/gobuster) | Web application directory/file fuzzer to find other pages or files worth looking at. Also supports DNS busting (such as subdomains). Written in Go.
[Nikto](https://github.com/sullo/nikto) | Web server scanner to perform security checks on a web server.
[nosqlmap](https://github.com/codingo/NoSQLMap) | Like sqlmap, but for NoSQL.
[PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master) | Useful payloads for a variety of attacks such as SQLi, IDOR, XSS, etc.
[sqlmap](https://github.com/sqlmapproject/sqlmap) | Performs automated SQL injection tests on GET and POST requests.
[w3af](https://w3af.org/) | Web application attack and audit framework.
[wappalyzer](https://www.wappalyzer.com/) | Identify what frameworks a website runs
[wpscan](https://github.com/wpscanteam/wpscan) | Automatic WordPress scanner to identify information about a WordPress site and possible vulnerabilities.
### Wireless
Repository | Description
---- | ----
[Aircrack-ng](https://www.aircrack-ng.org) | Aircrack-ng is a complete suite of tools to assess WiFi network security.
[Kismet](https://www.kismetwireless.net/) | sniffer, WIDS, and wardriving tool for Wi-Fi, Bluetooth, Zigbee, RF, and more
[Reaver](https://github.com/t6x/reaver-wps-fork-t6x) | Reaver implements a brute force attack against Wifi Protected Setup (WPS) registrar PINs in order to recover WPA/WPA2 passphrases
[Wifite](https://www.kali.org/tools/wifite/) | Python script to automate wireless auditing using aircrack-ng tools
[WifiPhisher](https://github.com/wifiphisher/wifiphisher) |  The Rogue Access Point Framework 

### Initial Access
Repository | Description
---- | ----
[Easysploit](https://github.com/KALILINUXTRICKSYT/easysploit) | Automatic Metasploit payload generator and shell listener.
[Impacket](https://github.com/SecureAuthCorp/impacket) | A collection of Python scripts useful for Windows targets: psexec, smbexec, kerberoasting, ticket attacks, etc.
[Kerbrute](https://github.com/ropnop/kerbrute) | A tool to perform Kerberos pre-auth bruteforcing
[Medusa](https://github.com/jmk-foofus/medusa) | Bruteforcer with multiple protocol support.
[Metasploit](https://github.com/rapid7/metasploit-framework) | Exploit framework that can be used for intial access and/or post-exploitation.
[Searchsploit](https://gitlab.com/exploit-database/exploitdb) | Search ExploitDB for exploits. Useful if you identify a service version.
[TeamFiltration](https://github.com/Flangvik/TeamFiltration) | Cross-platform framework for enumerating, spraying, exfiltrating, and backdooring O365 AAD accounts
[THC-Hydra](https://github.com/vanhauser-thc/thc-hydra) | Bruteforcer with multiple protocol support.
[TREVORspray](https://github.com/blacklanternsecurity/TREVORspray) | Advanced password spraying tool for Active Directory environments.

### C2 Frameworks
C2 frameworks can be considered both initial access and post-exploitation, as they generate payloads to be used in phishing campaigns (initial access) and will provide access to the host machine when ran (post exploitation).

Repository | Description
---- | ----
[Cobalt Strike](https://www.cobaltstrike.com/) | Most robust and advanced C2 framework (also paid).
[Pupy](https://github.com/n1nj4sec/pupy) | Python and C C2 framework.
[Sliver](https://github.com/BishopFox/sliver) | Go C2 framework.
[Villain](https://github.com/t3l3machus/Villain) | Python and Powershell C2 framework.

### Post Exploitation
Repository | Description
---- | ----
[BeRoot](https://github.com/AlessandroZ/BeRoot) | Automated Windows, Linux, and Mac privilege escalation path discovery tool.
[BloodHound](https://github.com/BloodHoundAD/BloodHound) | Active Directory visualizer, useful for finding misconfigurations and/or shortest path to Domain Admin.
[CrackmapExec](https://github.com/mpgn/CrackMapExec) | Post-exploitation tool that helps automate assessing the security of large Active Directory networks
[GTFOBins](https://gtfobins.github.io/) | Unix binaries that can be used to bypass local security restrictions in misconfigured systems.
[Impacket](https://github.com/SecureAuthCorp/impacket) | A collection of Python scripts useful for Windows targets: psexec, smbexec, kerberoasting, ticket attacks, etc.
[Invoke-PrivescCheck](https://github.com/itm4n/PrivescCheck) | Automated Windows privilege escalation path discovery tool.
[LOLBAS](https://github.com/LOLBAS-Project/LOLBAS) | Microsoft-signed binaries to perform APT or red-team functions (ie: dumping process memory).
[Metasploit](https://github.com/rapid7/metasploit-framework) | Exploit framework that can be used for intial access and/or post-exploitation.
[Mimikatz](https://github.com/ParrotSec/mimikatz) | Mimikatz is both an exploit on Microsoft Windows that extracts passwords stored in memory and software that performs that exploit.
[nishang](https://github.com/samratashok/nishang) | Offensive PowerShell for red team, penetration testing and offensive security.
[PEASS-ng](https://github.com/carlospolop/PEASS-ng) | Automated Windows, Linux, and Mac privilege escalation path discovery tool.
[PowerHub](https://github.com/AdrianVollmer/PowerHub) | Post-exploitation module for bypassing endpoint protection and running arbitrary files.
[PowerSploit](https://github.com/AdrianVollmer/PowerSploit) | A PowerShell post-exploitation framework with many modules: exfiltration, privelege escalation, etc.
[PowerUp](https://github.com/PowerShellMafia/PowerSploit/blob/master/Privesc/PowerUp.ps1) | Automated Windows privilege escalation path discovery tool.
[Searchsploit](https://gitlab.com/exploit-database/exploitdb) | Search ExploitDB for exploits. Useful if you identify a service version.
[SharpHound](https://github.com/BloodHoundAD/SharpHound) | Data ingestor for BloodHound.
[smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html) | Allows connection to the SMB protocol.
[smbmap](https://github.com/ShawnDEvans/smbmap) | Enumerates SMB shares.

### Exfiltration
Repository | Description
---- | ----
[DNSExfiltrator](https://github.com/Arno0x/DNSExfiltrator) | Data exfiltration over DNS request covert channel
[PowerSploit](https://github.com/AdrianVollmer/PowerSploit) | A PowerShell post-exploitation framework with many modules: exfiltration, privelege escalation, etc.

### Credential Dumping
Repository | Description
---- | ----
[certsync](https://github.com/zblurx/certsync) | Dump NTDS with golden certificates and UnPAC the hash
[Dumpert](https://github.com/outflanknl/Dumpert) | LSASS memory dumper using direct system calls and API unhooking.
[Mimikatz](https://github.com/ParrotSec/mimikatz) | Mimikatz is both an exploit on Microsoft Windows that extracts passwords stored in memory and software that performs that exploit.
[nishang](https://github.com/samratashok/nishang) | Offensive PowerShell for red team, penetration testing and offensive security.
[PowerSploit](https://github.com/AdrianVollmer/PowerSploit) | A PowerShell post-exploitation framework with many modules: exfiltration, privelege escalation, etc.

### Password Cracking
Repository | Description
---- | ----
[CeWL](https://github.com/digininja/CeWL) | Scrape a website to generate a wordlist 
[crunch](https://github.com/jim3ma/crunch) | Generate wordlists based on requirements such as minimum and maximum length, character sets, etc.
[Cupp](https://github.com/Mebus/cupp) | Utilize OSINT to create password candidates for a specific person
[hashcat](https://hashcat.net/hashcat) | Password cracking tool with multiple different supported formats
[JohnTheRipper](https://www.openwall.com/john/) | Password cracking tool (slower than Hashcat) but supports more formats with the Jumbo version
[Mentalist](https://github.com/sc0tfree/mentalist) | A GUI for wordlisst generation