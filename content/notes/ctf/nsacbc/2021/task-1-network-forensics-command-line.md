---
title: NSA Codebreaker Challenge 2021 Task 1
draft: false
tags:
  - ctf
  - nsa
  - cbc
  - codebreaker
  - forensics
---

# Task 1: Network Forensics, Command Line

> The NSA Cybersecurity Collaboration Center has a mission to prevent and eradicate threats to the US Defense Industrial Base (DIB). Based on information sharing agreements with several DIB companies, we need to determine if any of those companies are communicating with the actor’s infrastructure. You have been provided a capture of data en route to the listening post as well as a list of DIB company IP ranges. Identify any IPs associated with the DIB that have communicated with the LP.

First, I opened `capture.pcap` using Wireshark. Then, it was a simple filter to see which IP(s) had interactions. Using the filter `ip.addr == XX.XX.XX.XX/XX` for each CIDR notation will show which IP addresses interacted with the LP.

![Wireshark](static/cbc_wireshark.png)