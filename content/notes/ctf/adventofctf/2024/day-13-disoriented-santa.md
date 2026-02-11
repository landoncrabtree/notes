---
title: AdventOfCTF 2024 Day 13:D Disoriented Santa
draft: false
tags:
  - ctf
---

# Day 13: Disoriented Santa

> Sorry that we woke you up at this hour, but Santa is missing. We suspect the K.U.N.A.L Secret Society kidnapped Santa when he was flying over Europe while scoping out for some children. Thankfully, Santa was equipped with a state-of-the-art GPS tracker circa 2008. Anyways, it gave us these clues:
> - Santa is trapped in a **history museum**.
> - The museum charges **3 EUR** for entry.
> - There is a **library** within **1 km** of the museum.
> Can you find the coordinates of the museum? The flag is in the format `csd{latitude,longitude}`, where each number is **rounded** (not truncated) to 3 decimal places. Numbers within an error of ±0.001 are accepted.

I started with some basic google dorking, but couldn't really get anywhere. This is when I took a hint and learned about overpass turbo and open street map. I was able to take the query provided and [modify it a bit](https://wiki.openstreetmap.org/wiki/Tag:museum%3Dhistory):

```
[out:json][timeout:25];

// Find all museums with charge 3 EUR
node["charge"="3 EUR"]["tourism"="museum"]->.museums;

// Find all libraries within 1 km of those museums
node["amenity"="library"](around.museums:1000)->.libraries;

// Find museums within 1 km of those libraries
node["charge"="3 EUR"]["tourism"="museum"]["museum"="history"](around.libraries:1000);

out body;
>;
out skel qt;
```

This first finds locations with `{charge: "3 EUR", tourism: "museum"}`. From there, we filter those that are within 1 kilometer (1,000 meters) of a library. Lastly, we then filter once again by adding the specific `museum=history` tag because there were a few results (roughly 10). I'm sure theres ways to optimize the query, but I had to do it this way because if I tried doing library->museum, it would timeout (I assume because of the amount of libraries in Europe?). So, I had to do museum -> library -> museum. 

`csd{48.204,7.364}`