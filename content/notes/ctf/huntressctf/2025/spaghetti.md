---
title: HuntressCTF 2025 Spaghetti
draft: false
tags:
  - ctf
  - deobfuscation
---

# Spaghetti 

> You know, I've been thinking... at the end of the day, spaghetti is really just strings of pasta! Anyway, we saw this weird file running on startup. Can you figure out what this is? I'm sure you'll get more understanding of the questions below as you explore!

The file `sphaghetti` is a somewhat obfuscated PowerShell script. However, at a high level, it reads the file contents of `AYGIW.tmp` and converts the hexdump to a file, and executes it. So, the .tmp is basically a hexdump of an executable. We can dump the file ourself (for example, using CyberChef 'from hex' recipe), and then see that `file` returns a MS-DOS executable. Doing a simple `strings` on the dumped executable, will reveal the first flag: `flag{39544d3b5374ebf7d39b8c260fc4afd8}`

For the `My Oasis` flag, we can see there is a `$MyOasis4` variable, that calls `FonatozQZ` with a string looking like `~%~~~~~%~%%~~%~~~%%~~%~~~~%~%%~%~%~~%%~%~%%%~~~~~%~%~~~~~%%%~~%~~%%~~%~%~%%~~%%~~%%~~%~%~%%%~~%~~%%~~%~%~%%~`. We can basically comment out

```powershell
# $MyOasis4 | .('{x}{9}'.replace('9','0').replace('x','1')-f'lun','%%').replace('%%','I').replace('lun','EX')
```

to prevent it from executing, and then add a `Write-Host $MyOasis4` to see the decoded PowerShell. The part that matters is this commented code

```powershell
# $XPYMWR = [ZQCUW]::GetProcAddress($BBWHVWQ, "$([systeM.neT.webUtility]::HtMldECoDE('&#102;&#108;&#97;&#103;&#123;&#98;&#51;&#49;&#51;&#55;&#57;&#52;&#100;&#99;&#101;&#102;&#51;&#51;&#53;&#100;&#97;&#54;&#50;&#48;&#54;&#100;&#53;&#52;&#97;&#102;&#56;&#49;&#98;&#54;&#50;&#48;&#51;&#125;'))")
```

which is simply decoding the ASCII decimals: `flag{b313794dcef335da6206d54af81b6203}`

Lastly, for the MEMEMAN flag, we can look at the other invocation of the `FonatozQZ()` call and do the same logic. Comment out the part that executes it, add a `Write-Host`, and analyze the decoded PowerShell. 

```powershell
Add-MpPreference -ExclusionPath  C:\ProgramData\MEMEMAN\
# Add-MpPreference -ExclusionExtension "flag{60814731f508781b9a5f8636c817af9d}"
```