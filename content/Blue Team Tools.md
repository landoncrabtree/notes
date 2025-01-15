---
title: Blue Team Tooling
draft: false
tags:
  - blueteam
  - tooling
---
### Forensics

| Repository                                                                    | Description                                                                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [Angle-Grinder](https://github.com/rcoh/angle-grinder)                        | Parse, aggregate, sum, average, min/max, percentile, and sort log files.                                                |
| [Autopsy](https://github.com/sleuthkit/autopsy)                               | Investigate disk images.                                                                                                |
| [Autoruns](https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns) | Show persistence on Windows                                                                                             |
| [Chainsaw](https://github.com/WithSecureLabs/chainsaw)                        | Parse and threat hunt Windows EVTX files.                                                                               |
| [FTK Imager](https://www.exterro.com/ftk-imager)                              | Investigate disk images.                                                                                                |
| [KnockKnock](https://objective-see.org/products/knockknock.html)              | Show persistence on macOS                                                                                               |
| [Magika](https://github.com/google/magika)                                    | Detect file content types with deep learning.                                                                           |
| [Velociraptor](https://github.com/Velocidex/velociraptor)                     | Velociraptor is a tool for collecting host based state information using The Velociraptor Query Language (VQL) queries. |
| [Volatility](https://github.com/volatilityfoundation/volatility)              | Analyze memory dump files.                                                                                              |
| [ZimmermanTools](https://ericzimmerman.github.io)                             | Eric Zimmerman's toolset for Windows forensics: EVTX, registry, ShellBags, ShimCache, and more.                         |
### Network Analysis

| Repository                              | Description                                                    |
| --------------------------------------- | -------------------------------------------------------------- |
| [mitmproxy](https://mitmproxy.org/)     | CLI-based HTTP(S) proxy to intercept and modify HTTP requests. |
| [Wireshark](https://www.wireshark.org/) | GUI-based pcap, pcapng analyzer and network traffic sniffer.   |

### Deobfuscation & Unpacking

| Repository                                                                                      | Description                                            |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [cfxc-deobf](https://github.com/wildcardc/cfxc-deobf)                                           | ConfuserEx unpacker.                                   |
| [de4dot-cex](https://github.com/ViRb3/de4dot-cex)                                               | ConfuserEx unpacker.                                   |
| [de4dot](https://github.com/de4dot/de4dot)                                                      | .NET deobfuscator and unpacker.                        |
| [deobfuscate.io](https://deobfuscate.io/)                                                       | Javascript deobfuscator.                               |
| [FLOSS](https://github.com/mandiant/flare-floss)                                                | Automatically extract obfuscated strings from malware. |
| [NoFuserEx](https://github.com/undebel/NoFuserEx)                                               | ConfuserEx unpacker.                                   |
| [Packer-specific Unpackers](https://github.com/NotPrab/.NET-Deobfuscator/blob/master/README.md) | List of unpackers for specific packers.                |
| [PSDecode](https://github.com/R3MRUM/PSDecode)                                                  | PowerShell deobfuscator.                               |
| [relative.im](https://deobfuscate.relative.im/)                                                 | Javascript deobfuscator.                               |
| [UnconfuserExTools](https://github.com/landoncrabtree/UnconfuserExTools)                        | ConfuserEx deobfuscation toolkit (old).                |

### Reverse Engineering

| Repository                                                                            | Description                                                |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [awesome-ida-x64-olly-plugin](https://github.com/fr0gger/awesome-ida-x64-olly-plugin) | A list of plugins for IDA, Ghidra, GDB, OllyDBG, etc.      |
| [Binary Ninja](https://binary.ninja/)                                                 | Decompiler, disassembler, and debugger GUI.                |
| [Cerberus](https://github.com/h311d1n3r/Cerberus)                                     | Unstrips Rust and Go binaries.                             |
| [cutter](https://github.com/rizinorg/cutter)                                          | Decompiler, disassembler, and debugger GUI based on Rizin. |
| [dnSpy](https://github.com/dnSpy/dnSpy)                                               | .NET debugger and editor.                                  |
| [dotPeak](https://www.jetbrains.com/decompiler/)                                      | .NET Decompiler and assembly browser                       |
| [GDB](https://www.sourceware.org/gdb/)                                                | CLI debugger for Linux executables.                        |
| [GEF](https://github.com/hugsy/gef)                                                   | GDB addon with advanced features.                          |
| [ghidra](https://github.com/NationalSecurityAgency/ghidra)                            | Decompiler and disassembler GUI.                           |
| [JADX](https://github.com/skylot/jadx)                                                | JAR, APK, DEX, AAR, AAB, and ZIP decompiler.               |
| [IDA](https://www.hex-rays.com/products/ida/index.shtml)                              | Decompiler and disassembler GUI.                           |
| [OllyDbg](https://www.ollydbg.de/)                                                    | GUI debugger for Windows executables.                      |
| [pycdc](https://github.com/zrax/pycdc)                                                | Decompile .pyc files into Python source code.              |
| [pyinstxtractor](https://github.com/extremecoders-re/pyinstxtractor)                  | Extract .pyc files from PyInstaller compiled executables.  |
| [redress](https://github.com/goretk/redress)                                          | Analyzes stripped Go binaries.                             |
| [rizin](https://github.com/rizinorg/rizin)                                            | Disassembler and debugger CLI.                             |
| [x64dbg](https://x64dbg.com/)                                                         | GUI debugger for Windows executables.                      |
| [XPEViewer](https://github.com/horsicq/XPEViewer)                                     | PE file viewer (headers, libraries, strings, etc).         |

### Malware Analysis

| Repository                                                                                    | Description                                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [any.run](https://any.run)                                                                    | Cloud-based sandbox.                                                                              |
| [CAPA](https://github.com/mandiant/capa)                                                      | Identify capabilities in executable files.                                                        |
| [CAPEv2](https://github.com/kevoreilly/CAPEv2)                                                | Self-hosted sandbox.                                                                              |
| [Cuckoo](https://cuckoosandbox.org/)                                                          | Self-hosted sandbox.                                                                              |
| [Detect-It-Easy](https://github.com/horsicq/Detect-It-Easy)                                   | Detect file type and packer used for Windows executables.                                         |
| [DRAKVUF](https://github.com/CERT-Polska/drakvuf-sandbox?tab=readme-ov-file)                  | Self-hosted sandbox.                                                                              |
| [Joe's Sandbox](https://www.joesandbox.com/#windows)                                          | Cloud-based sandbox.                                                                              |
| [mac-monitor](https://github.com/redcanaryco/mac-monitor)                                     | Advanced process monitoring for macOS                                                             |
| [oletools](https://github.com/decalage2/oletools)                                             | Toolkit for Microsoft Office documents (Word, Excel, etc.) to extract VBA, embedded objects, etc. |
| [PEiD](https://github.com/wolfram77web/app-peid)                                              | Detect packer, cryptor, and compiler used for Windows executables.                                |
| [Process Explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer) | Shows parent-child relationships between processes and open DLL handles.                          |
| [Process Hacker](https://processhacker.sourceforge.io/)                                       | Process Explorer + more                                                                           |
| [Process Monitor](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon)           | Tracks registry, file system, network, and process activity.                                      |

### Hardening

Repository | Description
---- | ----
[BLUESPAWN](https://github.com/ION28/BLUESPAWN) |  An Active Defense and EDR software to empower Blue Teams
[CISBenchmarks](https://downloads.cisecurity.org) | Benchmark for security configuration best practices
[HardeningKitty](https://github.com/0x6d69636b/windows_hardening) | HardeningKitty and Windows Hardening settings and configurations
[Linux Hardening](https://madaidans-insecurities.github.io/guides/linux-hardening.html) | Linux Hardening
[SteamRoller](https://github.com/Msfv3n0m/SteamRoller) | Automating basic security configurations across an Active Directory environment