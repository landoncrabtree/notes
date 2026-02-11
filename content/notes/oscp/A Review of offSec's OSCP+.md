---
title: A Review of offSec's OSCP+
draft: false
tags:
  - oscp
---
I recently received my confirmation of passing for OffSec's OSCP+ certification. For those unfamiliar with the OSCP (Offensive Security Certified Professional), here's a quick blurb from OffSec themselves:

> The industry-leading Penetration Testing with Kali Linux (PWK/PEN-200) course introduces [penetration testing](https://www.offsec.com/cybersecurity-roles/penetration-tester/) methodology, tools, and techniques in a hands-on, self-paced environment. Access PEN-200’s first Learning Module for an overview of course structure, learning approach, and what the course covers.
> 
> Learners who complete the course and pass the exam after November 1, 2024 will earn the OffSec Certified Professional (OSCP & [OSCP+](https://help.offsec.com/hc/en-us/articles/29840452210580-Changes-to-the-OSCP#h_01J6E5VRJD0VDSYK43DKSGRKRPl)) penetration testing certification which requires holders to successfully attack and penetrate various live machines in a safe lab environment. These certifications are considered to be more technical than other penetration testing certifications and is one of the few that requires evidence of practical pen testing skills. The OSCP is a lifetime certification and the OSCP+ expires after 3 years, representing learners’ commitment to continuing education in the complex cybersecurity space.

OSCP is considered a "gold standard" for those who interested in offensive security (pentesting, red teaming, etc.). In this blog post, I want to detail my experiences with it ranging from PEN200 course content, challenge labs, and the actual exam— as well as the steps I took to prepare for the exam.

Before that, I want to detail the differences between OSCP and OSCP+. The "OSCP+" is the new certification for those who take the exam after November 1, 2024 (which just so happens to be me). The plus exam takes inspiration from other certification companies like SANS and requires you to renew it by paying for another exam attempt after 2 years, or by using CPE credits. If you do not renew your OSCP+, it will be downgraded to just the normal OSCP. This is something that has gotten a lot of backlast, but I understand the reasoning: it keeps students up-to-date with current tools, trends, and technologies. For example, PEN200 just added AWS pentesting to their content and will (soon?) be adding it to the exam.

# PEN200 Course Content

The course content, in my opinion, is pretty introductory, especially for a certification that many recruiters use as a screening method for candidates. It introduces you to all the stages of a penetration test engagement: reconaissance, scanning & enumeration, web exploitation, privilege escalation, and Active Directory attacks. I came into the course with a good amount of self-taught knowledge from resources like HackTheBox, TryHackMe, and capture the flag competitions. I started the course and took notes, but quickly realized I was not learning anything new (except for maybe in the AD section). So to me, that was an interesting point because I went into it thinking the OSCP was supposed to be an intermediate/advanced certificate, and not an entry-level certificate (running `whois`is one of the labs..). In my eyes, because of the "status" of the certificate to recruiters and hiring managers, the course content should reflect that status OR the "status" of OSCP should not be so high as a metric of offensive security experience.

# PEN200 Labs

The PEN200 course also offers several labs associated with the modules to practice what you learn. I think all the labs are well designed and do help you really practice what you learn throughout the modules. Like I mentioned before, I felt like most of the course content was not new to me, so I didn't really focus on doing any of the labs except for the AD labs since that's admittedly my weakest point.

# Challenge Labs

They also offer three labs (OSCPA, OSCPB, OSCPC) that offer a similar environment to the actual OSCP Exam. At my time of having the course content, the challenge labs were not updated to reflect the new "Active Directory assume breach" portion of the exam, so I feel like the practice I got from the challenge labs for AD did not sufficiently prepare me for the _actual_ exam AD attacks. I'm sure the challenge labs will be updated soon to implement the assume breach aspect and will better reflect actual exam content. Besides this small gripe, I think the standalone challenge labs do an excellent job at preparing you for the exam. If you can solve the standalone challenge labs, there is a 90% you can solve the standalone exam machines as well.

Beyond the three challenge labs (OSCPA-C), there are other challenge labs that are more difficult than what the exam is rated as. I personally did not do them, but I should have (poor time management on my part).

# OSCP Exam

The exam is 24 hours long, followed by 24 hours to write and submit a penetration test report detailing your findings, steps to reproduce, mitigations, etc. You are given three "Standalone" machines and one "Active Directory Set" environment of three machines. Throughout the engagement, you are trying to get an initial foothold into the machines, escalate privileges, and find flags. Standalone machines have 2 flags: local.txt for user access and proof.txt for root access. The AD set has three proof.txt flags as well.

- Standalone A
    
    - local.txt: 10 points
    - proof.txt: 10 points
    
- Standalone B
    
    - local.txt: 10 points
    - proof.txt: 10 points
    
- Standalone C
    
    - local.txt: 10 points
    - proof.txt: 10 points
    
- Active Directory Set
    
    - AD A
        
        - proof.txt: 10 points
        
    - AD B
        
        - proof.txt: 10 points
        
    - AD C
        
        - proof.txt: 20 points
        
    

With this, there are 100 total points possible, and you need to get 70 to pass. There's a [few ways](https://help.offsec.com/hc/en-us/articles/4412170923924-OSCP-Exam-FAQ-Newly-Updated) to do this:

- 40 points AD + 3 local.txt flags (70 points)
    
- 40 points AD + 2 local.txt flags + 1 proof.txt flag (70 points)
    
- 20 points AD + 3 local.txt flags + 2 proof.txt flag (70 points)
    
- 10 points AD + 3 fully completed stand-alone machines (70 points)

# Exam Preparation

To prepare for the exam, I read **a lot** of blog posts detailing others' experiences with the exam. Most of the content I was able to find was outdated and did not account for the OSCP+ exam changes, but for the most part, it was able to help.

- **Note Taking**: Have a system ready for your note taking. Not only is this for your personal memory and notes, but you also have to create a report, so by having your notes readily available (with screenshots!!), it makes the process 100x easier. I used [Obsidian](https://obsidian.md) for my note-taking, since it allows for markdown note creation, instance note rendering, and ease of pasting screenshots from clipboard. I highly recommend you have a template created that you want every machine to follow, so you can just copy and paste the `.md`file for every machine and have an outline ready. For mine, it was 1) Loot (usernames, passwords, hashes) 2) Enumeration (table with port, service, notes) 3) Initial Access 4) Privilege Escalation.
    
- **Challenge Labs**: If you have PEN200 course access, then I would highly focus on the challenge labs (OSCPA, OSCPB, and OSCPC) as a priority before any other resources like HackTheBox. Doing these challenges will test your skills and help you identify gaps in your checklist, methodology, etc. As you do labs, practice note taking and updating your checklist.
    
- **HackTheBox**: Basically any room rated "Easy" on HackTheBox will bare resemblence to something you could face on the exam. Some of the rooms I did are **LinkVortex**, **Administrator**, **Cicada**, **Sea**, and **Sightless**. It's a bit hard to recommend boxes because HTB is constantly retiring and adding new machines, but if you get HTB Premium, then I recommend [TJ Null's PWK v3 List](https://docs.google.com/spreadsheets/u/1/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/htmlview#) which lists boxes with similar difficulties to OSCP. **Challenge Labs**: If you have PEN200 course access, then I would highly focus on the challenge labs (OSCPA, OSCPB, and OSCPC) as a priority before any other resources like HackTheBox. Doing these challenges will test your skills and help you identify gaps in your checklist, methodology, etc. As you do rooms, practice note taking and updating your checklist.
    
- **Checklist**: The checklist is critical. You'll want to make sure you know what to do for every stage of the exam— think of it as a flow chart. For my checklist, I had `nmap`and `autorecon`commands with advanced args such as `max-rtt`and `min-timeout`. I had notes regarding the structure of my Obsidian notes and the structure of my actual Kali machine. I had tools to use for common services such as HTTP (`feroxbuster`, `nikto`), SNMP (`snmpbulkwalk`), SMB (`smbmap`, NMAP SMB vuln scripts), FTP (anonymous login), etc. I had notes regarding data staging using Python3 `uploadserver`, `impacket-smbserver`, `wsgidav`, etc. And lastly, I had common privilege escalation tools and techniques. Basically, anything you use during the labs or HTB rooms, also add it to your checklist.

## My Exam

With the exam format being laid out and the preparations I took, let's discuss my exam performance! My exam was scheduled for 10:00 P.M. (I don't remember scheduling it for this late, but I guess I did). I joined the proctor session at 9:45 to verify my identify and environment, and then was provided with my exam VPN connection. At 10:00 P.M., I connected to the VPN to start.

I began on the standalone machines because I was most confident regarding that. I started on Standalone A and quickly got stuck, so I moved onto Standalone B. On Standalone B, I got `local.txt`by 11:00ish, but got stuck on the privilege escalation, so then went to C. C I also got stuck on for a while, and so I began to cycle through A, B, and C until ~3:00A.M. At 3:00 AM, I decided to take a break and sleep until 6:00 AM. This was probably the worst sleep of my life because I was anxious (only 1 flag in 5 hours??) and also just had a lot of ideas racing through my mind. I was able to sleep for maybe an hour or so, and then 6:00 AM came by and I got back on. I went back to C because I was convinced I knew the path, just couldn't get it to work, and eventually did get it to work, grabbing my second `local.txt`. The privesc for C was straight forward, and in about 30 minutes, I had `proof.txt`. At this point, I was hard stuck on A and kinda angry with B, so I decided to start the AD set which I really was trying to avoid.

I began with typical AD enumeration, and didn't really find anything interesting. I kind of assumed that the OSCP+ changes to AD would put a heavier focus on typical AD lateral movement (ie: BloodHound shortest path to domain admin type stuff) but that didn't appear to be the case in my scenario. With all the enumeration completed, and hardstuck on AD, I went back to standalones.

The break from standalones proved beneficial. I quickly got `proof.txt`for B and finally figured out what was going wrong with A and once I did, quickly got `local.txt`and `proof.txt`. At this point, I had all standalone machines completed, and went back to AD. It was this point that I was re-reading the FAQ and realized that under OSCP+, the point distribution for the AD set was different. It used to be 40 points— you get it or you don't, but now it's 10/10/20. So, rather than trying lateral movement like I had been focused on, I decided to switch to vertical movement and started looking for privilege escalation techniques and quickly identified one and got the `proof.txt`to secure me passing OSCP (assuming my report was good).

At this point, I spent a couple more hours trying to find the way to compromise the second machine in the AD set, but eventually gave up. The lack of sleep + frustrations from the standalone boxes (mostly being a result of me wasting multiple hours because of user error and not because I was stuck), I ended up "completing" the exam with six hours left. I completed the exam, got some real sleep, and then started work on my report.

# My Tips

This section will highlight some of my tips for those who are wanting to take the exam.

- Follow my exam preparation. While not an exhaustive resource, it's a good place to start to understand how to prepare for the exam. Obviously, you should prepare where you feel weak, so if you feel like your privesc knowledge is weak, focus on rooms with an emphasis on privesc.
    
- Enumerate to death. Run `nmap`, `autorecon`, etc. You need a comprehensive view of the machine/environment you're planning to attack. Try not to get stuck on red herrings.
    
- If you feel like you have good foundations (by this, I mean you can solve a HackTheBox easy), I would honestly opt to skip the PEN200 course and just buy the [standalone exam attempt.](https://help.offsec.com/hc/en-us/articles/31628160634004-Standalone-OffSec-Certification-Exam-FAQ) Like I said, I didn't find much value in it, but if you're coming in with zero experience, it's worth the purchase.
    
- Here are some of the tools/techniques I recommend to get familiar with. You may not need to use them all, but overall, it's a nice to know:
    
    - Ligolo-ng for pivoting within AD environments
        
    - AD Enumeration Stuff: BloodHound, LDAPDomainDump, etc.
        
    - AD Exploitation Stuff: Kerberoasting, ASREPRoasting, DCSync, etc
        
    - PrivEsc: WinPEAS, LinPEAS, PowerUp, and manual enumeration too
        
    - Reverse Shells: msfvenom, `ncat`, `powercat`, etc. I HIGHLY recommend getting use to working with Windows reverse shells because they're not as easy to turn into an interactive TTY like Linux reverse shells, so knowing how to go from plain nc -> powercat is beneficial.
        
    - Persistence: You may find scenarios where you want persistence. Whether this is user SSH keys, setting up bind shells, etc., a quick and easy way back into the environment is a nice quality-of-life thing instead of needing to redo your entire exploit chain.
        
    - feroxbuster/gobuster for dirbusting
        
    - gobuster/ffuf for vhost fuzzing
        
    - nmap/autorecon/NSE scripts for recon & enumeration
        
    - `impacket-*`tools, such as psexec, wmiexec, smbexec, secretsdump, etc.
        
    - `evil-winrm` and built-in shell commands like `upload`and `download`

