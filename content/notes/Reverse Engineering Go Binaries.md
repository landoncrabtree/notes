---
title: How to publish Obsidian notes with Quartz on GitHub Pages
draft: false
tags:
  - reverse-engineering
---
References: 
- https://cujo.com/blog/reverse-engineering-go-binaries-with-ghidra-part-2-type-extraction-windows-pe-files-and-golang-versions/
- https://github.com/getCUJO/ThreatIntel/pull/4

Reversing golang binaries can often be tedious, as it's compiled statically and there can be hundreds of builtin functions that make finding the functions of interest like finding a needle in a haystack. Luckily, there are some helpful Ghidra scripts that can help in reversing Go. 