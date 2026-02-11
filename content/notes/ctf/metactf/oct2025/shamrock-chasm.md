---
title: MetaCTF October 2025 Flash CTF Shamrock Chasm
draft: false
tags:
  - ctf
  - reverse-engineering
  - pyc
---
# Shamrock Chasm

> My friend is trying to develop a game and sent me his dev build, he said he hid a flag in it somewhere...

For this challenge, we're provided a binary called `shamrock`. My typical first instinct is to run `strings`, so let's do that:

```bash
strings shamrock -n 10

...
xnumpy-2.3.4.dist-info/entry_points.txt
xpygame/freesansbold.ttf
xpygame/pygame_icon.bmp
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/INSTALLER
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/LICENSE
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/METADATA
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/RECORD
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/REQUESTED
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/WHEEL
xsetuptools/_vendor/importlib_metadata-8.0.0.dist-info/top_level.txt
...

```

We instantly notice a bunch of references to Python. This is a very good indicator that it's a PyInstaller packed binary, which is basically a Python program packaged into an executable. We can use [pyinstxtractor](https://github.com/extremecoders-re/pyinstxtractor)  to grab the Python files out of it:

```bash
python3 pyinstxtractor.py ~/Downloads/shamrock

[+] Processing /Users/landoncrabtree/Downloads/shamrock
[+] Pyinstaller version: 2.1+
[+] Python version: 3.13
[+] Length of package: 62019108 bytes
[+] Found 284 files in CArchive
[+] Beginning extraction...please standby
[+] Possible entry point: pyiboot01_bootstrap.pyc
[+] Possible entry point: pyi_rth_inspect.pyc
[+] Possible entry point: pyi_rth_pkgutil.pyc
[+] Possible entry point: pyi_rth_multiprocessing.pyc
[+] Possible entry point: pyi_rth_setuptools.pyc
[+] Possible entry point: pyi_rth_pkgres.pyc
[+] Possible entry point: shamrock.pyc
[!] Warning: This script is running in a different Python version than the one used to build the executable.
[!] Please run this script in Python 3.13 to prevent extraction errors during unmarshalling
[!] Skipping pyz extraction
[+] Successfully extracted pyinstaller archive: /Users/landoncrabtree/Downloads/shamrock
```

This provides a bunch of `.pyc` files, which is compiled Python bytecode. Our file of interest is the `shamrock.pyc`, so we'll need a way to decompile it. There's two tools that are usually good: `pycdc` and `pylingual`. PyLingual is the newest one, and supports latest Python versions, which is necessary since this is Python 3.13 bytecode. However, both pycdc and PyLingual do not fully decompile, but PyLingual gets the _most_. Specifically, PyLingual is able to extract an `ENCRYPTED_FLAG` bytearray 

```python
ENCRYPTED_FLAG = b"\x89\x955W\xfa?\xd4\xf66\x84\xb3\xcc\x16\xcf<\xd7p\xfc\xbb#\x0ci\x00\xa1\x0b9w[?t\x05\x1an\x0cm\x13vy\x92<\xabS:\xc4\xdb\x85\xb1\x811@\xd0\x97T=i\xb5A!z\x81\x91\x00\xbd\xb7"
```

But, it doesn't find any references to it. If we manually look at the `shamrock.pyc` with `grep -ain "ENCRYPTED_FLAG shamrock.pyc -A3 -B3`

```
316:r�rIr!�bytesr�newMODE_ECBr�decrypt�ENCRYPTED_FLAG�decoderT�
```

We can obviously see some decryption logic using AES ECB, but we don't know the key. Another useful tool in this scenario is `pycdas`, which is a Python bytecode disassembler. This won't give us source-code, but can help us figure out how the program works. For example, we can run `pycdas shamrock.pyc | grep decrypt`, and find there exists a `attempt_flag_decrypt` function. If we want to analyze the entire function, the best way is to redirect the entire `pycdas` output to a file, and then open it in a text editor. 

```bash
   [Code]
                    File Name: shamrock.py
                    Object Name: attempt_flag_decrypt
                    Qualified Name: CloverPitGame.attempt_flag_decrypt
                    Arg Count: 1
                    Pos Only Arg Count: 0
                    KW Only Arg Count: 0
                    Stack Size: 7
                    Flags: 0x00000003 (CO_OPTIMIZED | CO_NEWLOCALS)
                    [Names]
                        'flag_found'
                        'int'
                        'count_666'
                        'count_jackpot'
                        'SYMBOL_VALUES'
                        'get'
                        'symbol_value_bonus'
                        'bytes'
                        'AES'
                        'new'
                        'MODE_ECB'
                        'unpad'
                        'decrypt'
                        'ENCRYPTED_FLAG'
                        'decode'
                        'Exception'
                        'startswith'
                        'endswith'
                        'result_message'
                        'flash_timer'
                        'range'
                        'slot_machine'
                        'spin_force_pattern_slow'
                        'GameState'
                        'SPINNING'
                        'state'
                        'controls_locked'
                        'owned_items'
                        'ITEMS'
                        'append'
                    [Locals+Names]
                        'self'
                        'b1'
                        'b2'
                        'cherry_val'
                        'b3'
                        'tail'
                        'key'
                        'cipher'
                        'pt'
                        'text'
                        '_'
                        'grid'
                    [Constants]
                        None
                        255
                        'CHERRY'
                        0
                        b'\x137\xca\xfe\xba\xbe\x06f\x00\x11"3D'
                        16
                        'utf-8'
                        'latin-1'
                        'ignore'
                        (
                            'errors'
                        )
                        'MetaCTF{'
                        '}'
                        300
                        3
                        5
                        'FLAG'
                        True
                        'FLAG_RELIC'
                        31337
                        'You decrypted the flag.'
                        'trophy'
                        (
                            'name'
                            'cost'
                            'desc'
                            'type'
                        )
                    [Disassembly]
                        0       RESUME                          0
                        2       LOAD_FAST                       0: self
                        4       LOAD_ATTR                       0: flag_found
                        24      TO_BOOL                         
                        32      POP_JUMP_IF_FALSE               1 (to 36)
                        36      RETURN_CONST                    0: None
                        38      NOP                             
                        40      LOAD_GLOBAL                     3: NULL + int
                        50      LOAD_FAST                       0: self
                        52      LOAD_ATTR                       4: count_666
                        72      CALL                            1
                        80      LOAD_CONST                      1: 255
                        82      BINARY_OP                       1 (&)
                        86      STORE_FAST                      1: b1
                        88      LOAD_GLOBAL                     3: NULL + int
                        98      LOAD_FAST                       0: self
                        100     LOAD_ATTR                       6: count_jackpot
                        120     CALL                            1
                        128     LOAD_CONST                      1: 255
                        130     BINARY_OP                       1 (&)
                        134     STORE_FAST                      2: b2
                        136     LOAD_GLOBAL                     8: SYMBOL_VALUES
                        146     LOAD_ATTR                       11: get
                        166     LOAD_CONST                      2: 'CHERRY'
                        168     LOAD_CONST                      3: 0
                        170     CALL                            2
                        178     LOAD_GLOBAL                     3: NULL + int
                        188     LOAD_FAST                       0: self
                        190     LOAD_ATTR                       12: symbol_value_bonus
                        210     LOAD_ATTR                       11: get
                        230     LOAD_CONST                      2: 'CHERRY'
                        232     LOAD_CONST                      3: 0
                        234     CALL                            2
                        242     CALL                            1
                        250     BINARY_OP                       0 (+)
                        254     STORE_FAST                      3: cherry_val
                        256     LOAD_FAST                       3: cherry_val
                        258     LOAD_CONST                      1: 255
                        260     BINARY_OP                       1 (&)
                        264     STORE_FAST                      4: b3
                        266     LOAD_CONST                      4: b'\x137\xca\xfe\xba\xbe\x06f\x00\x11"3D'
                        268     STORE_FAST                      5: tail
                        270     LOAD_GLOBAL                     15: NULL + bytes
                        280     LOAD_FAST_LOAD_FAST             18: b1, b2
                        282     LOAD_FAST                       4: b3
                        284     BUILD_LIST                      3
                        286     CALL                            1
                        294     LOAD_FAST                       5: tail
                        296     BINARY_OP                       0 (+)
                        300     STORE_FAST                      6: key
                        302     LOAD_GLOBAL                     16: AES
                        312     LOAD_ATTR                       18: new
                        332     PUSH_NULL                       
                        334     LOAD_FAST                       6: key
                        336     LOAD_GLOBAL                     16: AES
                        346     LOAD_ATTR                       20: MODE_ECB
                        366     CALL                            2
                        374     STORE_FAST                      7: cipher
                        376     LOAD_GLOBAL                     23: NULL + unpad
                        386     LOAD_FAST                       7: cipher
                        388     LOAD_ATTR                       25: decrypt
                        408     LOAD_GLOBAL                     26: ENCRYPTED_FLAG
                        418     CALL                            1
                        426     LOAD_CONST                      5: 16
                        428     CALL                            2
                        436     STORE_FAST                      8: pt
                        438     NOP                             
                        440     LOAD_FAST                       8: pt
                        442     LOAD_ATTR                       29: decode
                        462     LOAD_CONST                      6: 'utf-8'
                        464     CALL                            1
                        472     STORE_FAST                      9: text
                        474     LOAD_FAST                       9: text
                        476     LOAD_ATTR                       33: startswith
                        496     LOAD_CONST                      10: 'MetaCTF{'
                        498     CALL                            1
                        506     TO_BOOL                         
                        514     POP_JUMP_IF_FALSE               220 (to 956)
                        518     LOAD_FAST                       9: text
                        520     LOAD_ATTR                       35: endswith
                        540     LOAD_CONST                      11: '}'
                        542     CALL                            1
                        550     TO_BOOL                         
                        558     POP_JUMP_IF_FALSE               197 (to 954)
                        562     LOAD_FAST_LOAD_FAST             144: text, self
                        564     STORE_ATTR                      0: flag_found
                        574     LOAD_FAST_LOAD_FAST             144: text, self
                        576     STORE_ATTR                      18: result_message
                        586     LOAD_CONST                      12: 300
                        588     LOAD_FAST                       0: self
                        590     STORE_ATTR                      19: flash_timer
                        600     NOP                             
                        602     LOAD_GLOBAL                     41: NULL + range
                        612     LOAD_CONST                      13: 3
                        614     CALL                            1
                        622     GET_ITER                        
                        624     LOAD_FAST_AND_CLEAR             10: _
                        626     SWAP                            2
                        628     BUILD_LIST                      0
                        630     SWAP                            2
                        632     GET_ITER                        
                        634     FOR_ITER                        31 (to 698)
                        638     STORE_FAST                      10: _
                        640     LOAD_GLOBAL                     41: NULL + range
                        650     LOAD_CONST                      14: 5
                        652     CALL                            1
                        660     GET_ITER                        
                        662     LOAD_FAST_AND_CLEAR             10: _
                        664     SWAP                            2
                        666     BUILD_LIST                      0
                        668     SWAP                            2
                        670     GET_ITER                        
                        672     FOR_ITER                        5 (to 684)
                        676     STORE_FAST                      10: _
                        678     LOAD_CONST                      15: 'FLAG'
                        680     LIST_APPEND                     2
                        682     JUMP_BACKWARD                   7 (to 670)
                        686     END_FOR                         
                        688     POP_TOP                         
                        690     SWAP                            2
                        692     STORE_FAST                      10: _
                        694     LIST_APPEND                     2
                        696     JUMP_BACKWARD                   33 (to 632)
                        700     END_FOR                         
                        702     POP_TOP                         
                        704     STORE_FAST                      11: grid
                        706     STORE_FAST                      10: _
                        708     LOAD_FAST                       0: self
                        710     LOAD_ATTR                       42: slot_machine
                        730     LOAD_ATTR                       45: spin_force_pattern_slow
                        750     LOAD_FAST                       11: grid
                        752     CALL                            1
                        760     POP_TOP                         
                        762     LOAD_GLOBAL                     46: GameState
                        772     LOAD_ATTR                       48: SPINNING
                        792     LOAD_FAST                       0: self
                        794     STORE_ATTR                      25: state
                        804     LOAD_CONST                      16: True
                        806     LOAD_FAST                       0: self
                        808     STORE_ATTR                      26: controls_locked
                        818     LOAD_CONST                      17: 'FLAG_RELIC'
                        820     LOAD_FAST                       0: self
                        822     LOAD_ATTR                       54: owned_items
                        842     CONTAINS_OP                     1 (not in)
                        846     POP_JUMP_IF_FALSE               52 (to 952)
                        850     LOAD_CONST                      17: 'FLAG_RELIC'
                        852     LOAD_GLOBAL                     56: ITEMS
                        862     CONTAINS_OP                     1 (not in)
                        866     POP_JUMP_IF_FALSE               14 (to 896)
                        870     LOAD_FAST                       9: text
                        872     LOAD_CONST                      18: 31337
                        874     LOAD_CONST                      19: 'You decrypted the flag.'
                        876     LOAD_CONST                      20: 'trophy'
                        878     LOAD_CONST                      21: ('name', 'cost', 'desc', 'type')
                        880     BUILD_CONST_KEY_MAP             4
                        882     LOAD_GLOBAL                     56: ITEMS
                        892     LOAD_CONST                      17: 'FLAG_RELIC'
                        894     STORE_SUBSCR                    
                        898     LOAD_FAST                       0: self
                        900     LOAD_ATTR                       54: owned_items
                        920     LOAD_ATTR                       59: append
                        940     LOAD_CONST                      17: 'FLAG_RELIC'
                        942     CALL                            1
                        950     POP_TOP                         
                        952     RETURN_CONST                    0: None
                        954     RETURN_CONST                    0: None
                        956     RETURN_CONST                    0: None
                        958     RETURN_CONST                    0: None
                        960     PUSH_EXC_INFO                   
                        962     LOAD_GLOBAL                     30: Exception
                        972     CHECK_EXC_MATCH                 
                        974     POP_JUMP_IF_FALSE               20 (to 1016)
                        978     POP_TOP                         
                        980     LOAD_FAST                       8: pt
                        982     LOAD_ATTR                       29: decode
                        1002    LOAD_CONST                      7: 'latin-1'
                        1004    LOAD_CONST                      8: 'ignore'
                        1006    LOAD_CONST                      9: ('errors',)
                        1008    CALL_KW                         2
                        1010    STORE_FAST                      9: text
                        1012    POP_EXCEPT                      
                        1014    JUMP_BACKWARD_NO_INTERRUPT      272 (to 474)
                        1018    RERAISE                         0
                        1020    COPY                            3
                        1022    POP_EXCEPT                      
                        1024    RERAISE                         1
                        1026    SWAP                            2
                        1028    POP_TOP                         
                        1030    SWAP                            2
                        1032    STORE_FAST                      10: _
                        1034    RERAISE                         0
                        1036    SWAP                            2
                        1038    POP_TOP                         
                        1040    SWAP                            2
                        1042    STORE_FAST                      10: _
                        1044    RERAISE                         0
                        1046    PUSH_EXC_INFO                   
                        1048    LOAD_GLOBAL                     30: Exception
                        1058    CHECK_EXC_MATCH                 
                        1060    POP_JUMP_IF_FALSE               3 (to 1068)
                        1064    POP_TOP                         
                        1066    POP_EXCEPT                      
                        1068    JUMP_BACKWARD_NO_INTERRUPT      126 (to 818)
                        1070    RERAISE                         0
                        1072    COPY                            3
                        1074    POP_EXCEPT                      
                        1076    RERAISE                         1
                        1078    PUSH_EXC_INFO                   
                        1080    LOAD_GLOBAL                     30: Exception
                        1090    CHECK_EXC_MATCH                 
                        1092    POP_JUMP_IF_FALSE               3 (to 1100)
                        1096    POP_TOP                         
                        1098    POP_EXCEPT                      
                        1100    RETURN_CONST                    0: None
                        1102    RERAISE                         0
                        1104    COPY                            3
                        1106    POP_EXCEPT                      
                        1108    RERAISE                         1
```

This is the entire disassembly of the function. To be honest, I didn't 100% know what I was looking at, but Sonnet 4.5 did a pretty good job at constructing it:

```python
b1 = int(self.count_666) & 255
b2 = int(self.count_jackpot) & 255
cherry_val = SYMBOL_VALUES.get('CHERRY', 0) + int(self.symbol_value_bonus.get('CHERRY', 0))
b3 = cherry_val & 255
tail = b'\x137\xca\xfe\xba\xbe\x06f\x00\x11"3D'
key = bytes([b1, b2, b3]) + tail
cipher = AES.new(key, AES.MODE_ECB)
pt = unpad(cipher.decrypt(ENCRYPTED_FLAG), 16)
text = pt.decode('utf-8')
```

So, we have 13 bytes already from `tail`, and we just need the 3 bytes from `b1`, `b2,` and `b3`. Luckily, this is only 256^3 possibilities, which is bruteforceable.

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

ENCRYPTED_FLAG = b"\x89\x955W\xfa?\xd4\xf66\x84\xb3\xcc\x16\xcf<\xd7p\xfc\xbb#\x0ci\x00\xa1\x0b9w[?t\x05\x1an\x0cm\x13vy\x92<\xabS:\xc4\xdb\x85\xb1\x811@\xd0\x97T=i\xb5A!z\x81\x91\x00\xbd\xb7"
TAIL = b'\x137\xca\xfe\xba\xbe\x06f\x00\x11"3D'


def try_decrypt(b1, b2, b3):
    key = bytes([b1, b2, b3]) + TAIL

    try:
        cipher = AES.new(key, AES.MODE_ECB)
        pt = unpad(cipher.decrypt(ENCRYPTED_FLAG), 16)
        text = pt.decode("utf-8")

        if text.startswith("MetaCTF{") and text.endswith("}"):
            return text
    except:
        pass

    return None


print("[*] Starting bruteforce...")
print(f"[*] Total combinations: {256**3:,}")

count = 0
for b1 in range(256):
    for b2 in range(256):
        for b3 in range(256):
            count += 1
            if count % 100000 == 0:
                print(f"[*] Tried {count:,} / 16,777,216 ({count / 167772.16:.1f}%)")

            result = try_decrypt(b1, b2, b3)
            if result:
                print(f"[+] Full key: {bytes([b1, b2, b3]) + TAIL}")
                print(f"[+] Flag: {result}")
                exit(0)
```

```
[+] FLAG FOUND!
[+] Key bytes: [19, 55, 66]
[+] Full key: b'\x137B\x137\xca\xfe\xba\xbe\x06f\x00\x11"3D'
[+] Flag: MetaCTF{r3al_sl07s_h4v3_n3gat1v3_ev_d0n7_be_7rick3d}
```




