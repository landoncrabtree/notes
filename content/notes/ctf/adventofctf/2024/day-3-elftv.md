---
title: "AdventOfCTF 2024 Day 3: ElfTV"
draft: false
tags:
  - ctf
---

# Day 3: ElfTV

> Santa’s ElfTV license key checker got leaked! Finally, a break for a broke elf like you, starving for that sweet, sweet elf dopamine. The catch? You’ve got to reverse-engineer Santa’s “state-of-the-art” security to unlock it. Think you’re smarter than the guy who still uses reindeer for transportation? Prove it and claim your ElfTV fix!!!!

We're provided a Rust program that does some checks on a string to see if it's a valid key. Looking at the function:

```rust
fn validate_license_key(key: &str) -> bool {
    if !key.starts_with("XMAS") {
        //println!("Key does not start with XMAS");
        return false;
    }

    if key.len() != 12 {
        println!("Key does not have 12 characters");
        return false;
    }

    // Get key[4:9]
    let ascii_sum: u32 = key.chars().skip(4).take(5).map(|c| c as u32).sum();
    if ascii_sum != 610 {
        // println!("Key does not have ascii sum of 610");
        return false;
    }

    let fib_482 = supasecurefibberdachicheckerthing(483)[482];
    let fib_last_3 = fib_482 % 1000;
    //println!("Fib last 3: {}", fib_last_3);

    let key_last_3: u16 = match key[9..12].parse() {
        Ok(num) => num,
        Err(_) => {
            //println!("Key does not have correct last 3 digits");
            return false;
        }
    };

    // Check key[9:12] == fib_last_3
    if key_last_3 != fib_last_3 as u16 {
        //println!("Key does not have correct last 3 digits");
        return false;
    }

    true
}
```

We can determine the following:
* Key must be 12 characters
* Key 0-3 = `XMAS`
* Key 4-8 = ASCII sum of 610
* Key 9-11 = Last three characters of the 482nd Fibonacci sequence

I first calculated an ASCII sum of 5 characters that equals 610, and one possibility is `}}}}n`. Next, I added some debugging print statements to the Rust program to figure out where the key was failing (if at all) and to also quickly determine the last 3 of `fib_482`. I compiled it with `rustc source.c`, passed in a fake key: `XMAS}}}}n000` and can determine that it is expecting `782` as the last three. With this, we have everything we need: `XMAS`, `}}}}n`, and `782`. We can connect to the remote nc server and submit our key: `csd{Ru57y_L1c3N53_k3Y_CH3Ck3r}`