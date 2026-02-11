---
title: HuntressCTF 2025 Maximum Sound
draft: false
tags:
  - ctf
  - radio
---

# Maximum Sound

> Dang, this track really hits the target! It sure does get loud though, headphone users be warned!!

At first, I tried the typical audio steg solves: mostly LSB and spectrogram analysis. Having no luck, and noticing how "robotic" the audio sounds, I figured it was a matter of decoding the audio (sort of like morse, but obviously not morse in this scenario). It honestly took me a bit to analyze different signals, but eventually, I remembered SSTV. Listening to an SSTV sample and comparing it to ours-- it is an instant match. We can use `sstv -d maximum_sound.wav -o result.png` to decode it, and we get what looks like a QR code. However, it's not a QR code and most decoders will fail. That's because it's [MaxiCode](https://en.wikipedia.org/wiki/MaxiCode) (now, hence the name **Maxi**mum sound?). If we crop the image to just the QR code, we can then use zxing (https://zxing.org/w/decode.jspx) to decode the MaxiCode and get the flag: `flag{d60ea9faec46c2de1c72533ae3ad11d7}`