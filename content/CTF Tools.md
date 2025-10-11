---
title: CTF Tooling
draft: false
tags:
  - tooling
  - ctf
---
# Stego

## Text

> Look at the raw bytes and see if anything stands out.

| Repository                                                   | Description            |
| ------------------------------------------------------------ | ---------------------- |
| https://330k.github.io/misc_tools/unicode_steganography.html | Zero width space stego |
| https://offdev.net/demos/zwsp-steg-js                        | Zero width space stego |
| https://neatnik.net/steganographr/                           | Zero width space stego |
## Image

> AperiSolve and pray

| Repository                                          | Description                              |
| --------------------------------------------------- | ---------------------------------------- |
| [AperiSolve](https://www.aperisolve.com/)           | Runs multiple steg tools at once         |
| [steghide](https://steghide.sourceforge.net/)       | Hides files inside of images (JPEG, BMP) |
| [stegseek](https://github.com/RickdeJager/stegseek) | Steghide bruteforce                      |
| https://georgeom.net/StegOnline/upload              | Web-based port of stegsolve              |
| [zsteg](https://github.com/zed-0xff/zsteg)          | Multi-tool for stego (PNG, BMP)          |
| [jsteg](https://github.com/lukechampine/jsteg)      | JPEG steganography                       |
| [SilentEye](https://achorein.github.io/silenteye/)  | LSB stego (JPEG, BMP)                    |

## Video

## Audio

> Listen to the audio. If it sounds robotic, refer to signal references or spectrogram. If it seems like normal audio, try LSB. 

| Repository                                          | Description                           |
| --------------------------------------------------- | ------------------------------------- |
| [Audacity](https://www.audacityteam.org/)           | Spectrogram analysis                  |
| [SonicVisualizer](https://www.sonicvisualiser.org/) | Spectrogram analysis                  |
| [SilentEye](https://achorein.github.io/silenteye/)  | LSB stego (WAV)                       |
| [steghide](https://steghide.sourceforge.net/)       | Hides files inside of audio (WAV, AU) |
| [stegseek](https://github.com/RickdeJager/stegseek) | Steghide bruteforce                   |

### Signal References

> Quick references to common audio signals encountered before. 

- DTMF (https://www.youtube.com/watch?v=onktAfSFyII)
	- https://dtmf.netlify.app/
	- https://github.com/ribt/dtmf-decoder
	- https://nhollmann.github.io/DTMF-Tool/
- SSTV (https://www.youtube.com/watch?v=cJjZm14Pk7w)
	- https://github.com/colaclanth/sstv
- Morse (https://www.youtube.com/watch?v=4NdETLNglhc)
	- https://morsecode.world/international/decoder/audio-decoder-adaptive.html
- AFSK (https://www.youtube.com/watch?v=YLGFaAyUdso)
	- https://github.com/EliasOenal/multimon-ng
	- https://github.com/kamalmostafa/minimodem


# Cryptography

| Repository                                             | Description                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| [RsaCtfTool](https://github.com/RsaCtfTool/RsaCtfTool) | RSA multi-tool                                                    |
| [Ciphey](https://github.com/Ciphey/Ciphey)             | Performs different ciphers / decodings en-masse                   |
| [CyberChef](https://gchq.github.io/CyberChef/)         | A web app for encryption, encoding, compression and data analysis |
| [Remorse](https://www.jbowman.com/remorse/)            | MORSE bruteforce if you don't know where spacing goes             |
| https://www.dcode.fr/                                  | GOAT of ciphers                                                   |
| https://quipqiup.com/                                  | Auto solve substitution ciphers                                   |
| [pkcrack](https://github.com/keyunluo/pkcrack)         | Crack ZIP archive passwords being on known plain-text             |

# Forensics

## Packet Captures

> Open the PCAP in Wireshark and see what traffic is happening. Quick win: "Export Objects", otherwise, check things like timing, packet data, etc.

| Repository                                                                                    | Description                               |
| --------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [Wireshark](https://www.wireshark.org/)                                                       | PCAP GUI                                  |
| [tshark](https://www.wireshark.org/docs/man-pages/tshark.html)                                | PCAP CLI                                  |
| [pyshark](https://github.com/KimiNewt/pyshark)                                                | Python package for interacting with PCAPs |
| [NTLMRawUnhide.py](https://github.com/mlgualtieri/NTLMRawUnHide/blob/master/NTLMRawUnHide.py) | Extract NTLMv2 hashes from a PCAP         |
| [ospf.py](https://github.com/landoncrabtree/ctf-toolbox/blob/main/forensics/ospf.py)          | Extract OSPF hashes from a PCAP           |

## Memory Dumps

> Vol3 Cheatsheet: https://blog.onfvp.com/post/volatility-cheatsheet/

| Repository                                                         | Description                                      |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| [volatility3](https://github.com/volatilityfoundation/volatility3) | An advanced memory forensics framework           |
| [vol3-plugins](https://github.com/spitfirerxf/vol3-plugins)        | Notepad, sticky notes, and evtx plugins for vol3 |

## Disk Images

> Use Autopsy or FTK Imager to mount and see the contents of the file system. Run `tree` to quickly see files/directories of interest

| Repository                                                                  | Description                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Autopsy](https://github.com/sleuthkit/autopsy)                             | Digital forensics platform and graphical interface for disk images |
| [FTK Imager](https://www.exterro.com/digital-forensics-software/ftk-imager) | Digital forensics platform and graphical interface for disk images |
| [Binwalk](https://github.com/ReFirmLabs/binwalk)                            | Carves files out of other files                                    |

## Corrupted Files

> Look at the bytes for any identifiers of common file types: `IEND`, `IDAT`, `PDF`, etc. Look up the `magic bytes` for that file type and recover.

| Repository                                 | Description                                  |
| ------------------------------------------ | -------------------------------------------- |
| [magika](https://github.com/google/magika) | Detect file content types with deep learning |
| [Imhex](https://github.com/WerWolv/ImHex)  | Hex Editor with patterns                     |

# Web Exploitation
| Repository                                                                              | Description                                                                                                                                         |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [burpsuite](https://portswigger.net/burp/communitydownload)                             | full web testing suite, including proxied requests                                                                                                  |
| [dotGit](https://github.com/davtur19/DotGit)                                            | A Firefox and Chrome extension that shows you if there is an exposed `.git` directory                                                               |
| [feroxbuster](https://github.com/epi052/feroxbuster)                                    | Web application directory/file fuzzer to find other pages or files worth looking at. Written in Rust.                                               |
| [flask-unsign](https://github.com/Paradoxis/Flask-Unsign)                               | Command line tool to fetch, decode, brute-force and craft session cookies of a Flask application                                                    |
| [gobuster](https://github.com/OJ/gobuster)                                              | Web application directory/file fuzzer to find other pages or files worth looking at. Also supports DNS busting (such as subdomains). Written in Go. |
| [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master) | Useful payloads for a variety of attacks such as SQLi, IDOR, XSS, etc.                                                                              |
| [sqlmap](https://github.com/sqlmapproject/sqlmap)                                       | Performs automated SQL injection tests on GET and POST requests.                                                                                    |
| [wpscan](https://github.com/wpscanteam/wpscan)                                          | Automatic WordPress scanner to identify information about a WordPress site and possible vulnerabilities.                                            |

# Reverse Engineering

## APK

> Convert APK to JAR and then decompile the JAR

| Repository                                    | Description                                  |
| --------------------------------------------- | -------------------------------------------- |
| [JADX](https://github.com/skylot/jadx)        | JAR, APK, DEX, AAR, AAB, and ZIP decompiler. |
| [dex2jar](https://github.com/pxb1988/dex2jar) | .APK to .JAR                                 |

## Binaries

> Run `strings` to quickly help determine the functionality of the program. If we see references of a specific compiler (ie: Rust, Go) make sure we set the language in Ghidra for best decompilation support. 

| Repository                                                                     | Description                                               |
| ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [Binary Ninja](https://binary.ninja/)                                          | Decompiler, disassembler, and debugger GUI.               |
| [Cerberus](https://github.com/h311d1n3r/Cerberus)                              | Unstrips Rust and Go binaries.                            |
| [cutter](https://github.com/rizinorg/cutter)                                   | Decompiler, disassembler, and debugger GUI based on Rizin |
| [Floss](https://github.com/mandiant/flare-floss)                               | Extract obfuscated strings from Windows binaries          |
| [dnSpy](https://github.com/dnSpy/dnSpy)                                        | .NET debugger and editor.                                 |
| [dotPeak](https://www.jetbrains.com/decompiler/)                               | .NET Decompiler and assembly browser                      |
| [GDB](https://www.sourceware.org/gdb/)                                         | CLI debugger for Linux executables.                       |
| [ghidra](https://github.com/NationalSecurityAgency/ghidra)                     | Decompiler and disassembler GUI                           |
| [Ghidra Go Scripts](https://github.com/getCUJO/ThreatIntel/pull/4)             | Scripts for helping with go decompilation                 |
| [IDA](https://www.hex-rays.com/products/ida/index.shtml)                       | Decompiler and disassembler GUI                           |
| [OllyDbg](https://www.ollydbg.de/)                                             | GUI debugger for Windows executables.                     |
| [PwnDbg](https://github.com/pwndbg/pwndbg)                                     | Plugin for GDB and LLDB offering advanced capabilities    |
| [redress](https://github.com/goretk/redress)                                   | Analyzes stripped Go binaries                             |
| [rizin](https://github.com/rizinorg/rizin)                                     | Disassembler and debugger CLI                             |
| [UPX](https://upx.github.io/)                                                  | Executable (un)packer - look for `UPX0` section           |
| [WinDBG](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/) | GUI debugger for Windows executables                      |
| [x64dbg](https://x64dbg.com/)                                                  | GUI debugger for Windows executables                      |
| [XPEViewer](https://github.com/horsicq/XPEViewer)                              | PE file viewer (headers, libraries, strings, etc)         |

## Python
| Repository                                                           | Description                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| [pycdc](https://github.com/zrax/pycdc)                               | Decompile .pyc files into Python source code.             |
| [pyinstxtractor](https://github.com/extremecoders-re/pyinstxtractor) | Extract .pyc files from PyInstaller compiled executables. |
| [PyLingual](https://pylingual.io/)                                   | Decompile .pyc files into Python source code.             |








