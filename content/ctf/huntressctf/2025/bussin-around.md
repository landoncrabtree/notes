---
title: HuntressCTF 2025 Bussin Around
draft: false
tags:
  - ctf
  - pcap
  - modbus
---

# Bussin Around

> One of the engineers noticed that an HMI was going haywire. He took a packet capture of some of the traffic but he can't make any sense of it... it just looks like gibberish! For some reason, some of the traffic seems to be coming from someone's computer. Can you help us figure out what's going on?

If we look at the unit reference numbers and/or units, we see there's four pairings:

```
ref_num 4  is unit 3  -- mix of bytes 
ref_num 10 is unit 6  -- mix of bytes
ref_num 0  is unit 38 -- 0,1
ref_num 20 is unit 12 -- 0,1
```

So, we can basically extract the data for each pairing and see if something gives us anything. Eventually, when you get to ref_num 0, which is a binary stream, it decodes into a .ZIP and the password, which results in the flag. 

```bash
tshark -r bussing_around.pcapng -Y "(modbus.reference_num == 0) && (ip.src_host == 172.20.10.6)" -T fields -e modbus.data | awk '{print substr($0,length,1)}' | tr -d '\n'
```