---
title: "AdventOfCTF 2024 Day 18: trng"
draft: false
tags:
  - ctf
---

# Day 18: trng

> True random numbers can’t hurt you … they’re not real. (Or are they?)

Given a binary that gets 8 bytes from `/dev/urandom` and then performs 

```c
0000121a  {
00001222      int64_t rax = data_4010;
00001235      int64_t var_10_1 = (rax ^ (rax << 7));
00001249      data_4010 = (var_10_1 ^ (var_10_1 >> 9));
00001258      return data_4010;
0000121a  }
```

on it 1,000,000 times. This is a simple implementation of `xorshift`. find this post https://stackoverflow.com/questions/31513168/finding-inverse-operation-to-george-marsaglias-xorshift-rng which explains how to inverse the left shift. ~~steal~~ use the code 

```python
def forward_xorshift(x, w=64):
    y = x ^ (x << 7) & ((1 << w) - 1)
    z = y ^ (y >> 9)
    return z & ((1 << w) - 1)

def reverse_xor_lshift(y, shift, w=64):
    x = y & ((1<<shift) - 1)
    for i in range(w - shift):
        x |= (1 if bool(x & (1<<i)) ^ bool(y & (1<<(shift+i))) else 0)<<(shift+i)
    return x

def reverse_bin(x, w=64):
    return int(bin(x)[2:].rjust(w, '0')[::-1], 2)

def reverse_xor_rshift(y, shift):
    return reverse_bin(reverse_xor_lshift(reverse_bin(y), shift))

def reverse_xorshift(y, w=64):
    z = reverse_xor_rshift(y, 9)
    x = reverse_xor_lshift(z, 7)
    return x

# # test reverse_xorshift
# initial = 0x93c08c04ef153ac5
# for i in range(1000000):
#     print(i)
#     initial = forward_xorshift(initial)
# print(hex(initial))

modified = 0x7c8d88629f79501a

for i in range(1000000):
    print(i)
    modified = reverse_xorshift(modified)

print(hex(modified))
```

Don't ask me what it does. I don't know. 
`csd{M47H_15nT_7H4t_5cARY_N0w_15_I7?}`