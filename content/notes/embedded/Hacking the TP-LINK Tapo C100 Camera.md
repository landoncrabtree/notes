---
title: Hacking the TP-LINK Tapo C100 Camera
draft: false
tags:
  - reverse-engineering
  - embedded
  - hardware-hacking
---
I recently won a $100 Amazon Giftcard from MetaCTF's July Flash CTF. I was trying to figure out: "What should I use it on?" and couldn't really think of anything I really needed. Then, I remembered last year when I participated in MITRE's eCTF, which is an embedded capture the flag. I had no prior hardware hacking / embedded system experience, and after the competition, I wanted a way to practice, but didn't have the proper equipment or tools. So, why not buy a hardware hacking starter kit?

# The Kit

My "hardware hacking starter kit" consists of the following items:

- [8ch USB Logic Analyzer (Salea clone)](https://www.amazon.com/HiLetgo-Analyzer-Ferrite-Channel-Arduino/dp/B077LSG5P2)
- [CH341A Flash Programmer](https://www.amazon.com/AiTrip-EEPROM-Programmer-CH341A-Adapter/dp/B07VNVVXW6?s=industrial)
- [DuPont Wire Kit (120pc)](https://www.amazon.com/Elegoo-EL-CP-004-Multicolored-Breadboard-arduino/dp/B01EV70C78?s=industrial)
- [FTDI FT232RNL USB to UART](https://www.amazon.com/DSD-TECH-SH-U09C5-Converter-Support/dp/B07WX2DSVB?s=industrial)
- [4.3" Digital Microscope](https://www.amazon.com/Microscope-SKYEAR-Microscope1000X-Magnification-Collection/dp/B0CBLN13YY?s=industrial)
- [Digital Multimeter](https://www.amazon.com/AstroAI-Multimeter-Voltmeter-Resistance-Continuity/dp/B0CLV8R7QF?s=industrial&th=1)

With this, I should be able to (1) analyze signals coming from pins (2) read/write flash memory (depending on the flash memory chip type) (3) get a UART shell (4) determine what pins are UART TX/RX/GND. A pretty barebones kit, but should work nonetheless. 

# The Target

The target was a [TP-Link Tapo model C100](https://www.amazon.com/Tapo-security-indoor-pet-camera/dp/B0866S3D82). I chose this for a couple reasons. Primarily, it was inexpensive and so if I break something, I can easily replace it. The other being that there's been a lot of research done on the C200 model, and so I figured I can use that as a reference point if I get stuck anywhere. 

# The Attack

## Opening the Case

With my new C100 in-hand, the first step was to open the case. This was relatively straight forward. I just had to place 4 guitar picks in between the black "lens" and the white plastic shell-- one on each side. Then, I just moved them up and down / side to side to try and open any clips that were keeping the housing together. After some movements, the lens shell popped off from the white casing, exposing the chip. 

![[c100_shell.png]]

Then, I had to disconnect the cable that connects to the speaker (top left) as the speaker is adhesived to the shell. Doing this and pressing in the clip next to the cable allows us to pull the chip out of the shell. 

![[c100_sound.png]]

In order to access the flash memory, we need to remove the camera lens, as it covers the flash. On the other side of the chip are two screws which hold the lens in place. We can remove the screws, unplug the lens connector, and get the chip fully isolated. 

![[c100_chip.png]]

## C100 Hardware

Next, I wanted to figure out what kind of hardware there was. I knew in general the flash memory would be SOP8/SOIC8 package, but other than that, I didn't know specifics of the C100. 

![[c100_hardware.png]]
The SOC is an [Ingenic T23](https://en.ingenic.com.cn/products-detail/id-22.html) and the flash memory is a bit harder to identify. From what I can tell, it's a [CFeon QX64A](https://www.rutronik24.com/product/esmt/en25qx64a104hip2c/17750750.html)(?). Because the flash memory is in SOP8/SOIC8 package, it _should_ work with our CH341A programmer.

## Dumping Flash

Next, I wanted to dump the flash. This took a bit of trial and error and a couple YouTube videos to showcase the CH341A and how it works. the TL;DR is that the red cable = pin 1, and so you need to line up the pin one on the clip with pin one on the chip. The CH341A also has different voltages, such as 5V, 3.3V, 1.8V, but as far as I can tell: it defaults to 5V, will level shift to 3.3V if it detects it's needed, and 1.8V requires an adapter. I was a bit worried here because a lot of the Amazon reviews mentioned 5V killing 3.3V chips, but it looks like that was an older model that didn't automatically level shift. Either way, I just lined up the pin one on the connector (red cable) with pin one on the chip (it has a circle), and then connected the connector to the CH341A chip. Another important note is to make sure you plug it into the SPI side (left side) of the CH341A and not the I2C (right side). 

![[c100_ch341a_pinout.png]]
![[c100_ch341a_connected.png]]

With the pins lined up correctly, we can then plug it into the USB port of our computer. At first, I tried macOS but got stuck in driver hell, so decided to switch to Kali Linux. On Kali, I first verified the device was showing up properly with `lsusb`:

```bash
lsusb

Bus 003 Device 019: ID 1a86:5512 QinHeng Electronics CH341 in EPP/MEM/I2C mode, EPP/I2C adapter
```

Then, we can use `flashrom` to read the contents. For sanity sake, I ran this three times (backup.bin, backup2.bin, and backup3.bin):

```bash
flashrom -p ch341a_spi -r backup.bin

flashrom 1.4.0 on Linux 6.12.25-amd64 (x86_64) flashrom is free software, get the source code at https://flashrom.org === SFDP has autodetected a flash chip which is not natively supported by flashrom yet. All standard operations (read, verify, erase and write) should work, but to support all possible features we need to add them manually. You can help us by mailing us the output of the following command to flashrom@flashrom.org: 'flashrom -VV [plus the -p/--programmer parameter]' Thanks for your help! === Found Unknown flash chip "SFDP-capable chip" (8192 kB, SPI) on ch341a_spi. === This flash part has status UNTESTED for operations: WP The test status of this chip may have been updated in the latest development version of flashrom. If you are running the latest development version, please email a report to flashrom@flashrom.org if any of the above operations work correctly for you with this flash chip. Please include the flashrom log file for all operations you tested (see the man page for details), and mention which mainboard or programmer you tested in the subject line. You can also try to follow the instructions here: https://www.flashrom.org/contrib_howtos/how_to_mark_chip_tested.html Thanks for your help!
```

Then, we can validate our dumps to ensure they're consistent. 

```bash
md5sum backup* 

df76c5e9eb29934031d3cb6501c4144f backup2.bin 
df76c5e9eb29934031d3cb6501c4144f backup3.bin 
1494d17a9066bdcc89ba1037a2cf9995 backup.bin
```

So, it looks like `backup.bin` might be corrupt, but backup2 and backup3 seem to be the proper flash dump. Next, I ran `binwalk` to get an idea of the layout:

```bash
binwalk backup2.bin

------------------------------------------------------------------------------------------------------------------------------
DECIMAL                            HEXADECIMAL                        DESCRIPTION
------------------------------------------------------------------------------------------------------------------------------
26624                              0x6800                             uImage firmware image, header size: 64 bytes, data
                                                                      size: 82133 bytes, compression: lzma, CPU: MIPS32, OS:
                                                                      Firmware, image type: Firmware Image, load address:
                                                                      0x80100000, entry point: 0x0, creation time: 2024-06-17
                                                                      11:22:53, image name: "u-boot-lzma.img"
196864                             0x30100                            gzip compressed data, operating system: Unix,
                                                                      timestamp: 2024-06-17 11:24:57, total size: 53568 bytes
327680                             0x50000                            uImage firmware image, header size: 64 bytes, data
                                                                      size: 66729 bytes, compression: lzma, CPU: MIPS32, OS:
                                                                      Firmware, image type: Firmware Image, load address:
                                                                      0x820A0000, entry point: 0x0, creation time: 2024-06-17
                                                                      11:22:25, image name: "u-boot-lzma.img"
459264                             0x70200                            uImage firmware image, header size: 64 bytes, data
                                                                      size: 1298384 bytes, compression: lzma, CPU: MIPS32,
                                                                      OS: Linux, image type: OS Kernel Image, load address:
                                                                      0x80010000, entry point: 0x8031E330, creation time:
                                                                      2024-06-17 11:24:47, image name: "mips Ingenic
                                                                      Linux-3.10.14"
1797686                            0x1B6E36                           XZ compressed data, total size: 30012 bytes
1827698                            0x1BE372                           XZ compressed data, total size: 31052 bytes
1858750                            0x1C5CBE                           XZ compressed data, total size: 30800 bytes
1889550                            0x1CD50E                           XZ compressed data, total size: 26280 bytes
1915830                            0x1D3BB6                           XZ compressed data, total size: 14656 bytes
1930486                            0x1D74F6                           XZ compressed data, total size: 17192 bytes
1947678                            0x1DB81E                           XZ compressed data, total size: 14900 bytes
1962578                            0x1DF252                           XZ compressed data, total size: 10256 bytes
1972834                            0x1E1A62                           XZ compressed data, total size: 22512 bytes
1995346                            0x1E7252                           XZ compressed data, total size: 10248 bytes
2005594                            0x1E9A5A                           XZ compressed data, total size: 21088 bytes
2026682                            0x1EECBA                           XZ compressed data, total size: 6064 bytes
2032746                            0x1F046A                           XZ compressed data, total size: 24208 bytes
2056954                            0x1F62FA                           XZ compressed data, total size: 20504 bytes
2077458                            0x1FB312                           XZ compressed data, total size: 24384 bytes
2101842                            0x201252                           XZ compressed data, total size: 26244 bytes
2128086                            0x2078D6                           XZ compressed data, total size: 25180 bytes
2153266                            0x20DB32                           XZ compressed data, total size: 24180 bytes
2177446                            0x2139A6                           XZ compressed data, total size: 28316 bytes
2205762                            0x21A842                           XZ compressed data, total size: 26020 bytes
2231782                            0x220DE6                           XZ compressed data, total size: 25176 bytes
2256958                            0x22703E                           XZ compressed data, total size: 16576 bytes
2273534                            0x22B0FE                           XZ compressed data, total size: 35604 bytes
2309138                            0x233C12                           XZ compressed data, total size: 21800 bytes
2330938                            0x23913A                           XZ compressed data, total size: 4604 bytes
2335542                            0x23A336                           XZ compressed data, total size: 18996 bytes
2354538                            0x23ED6A                           XZ compressed data, total size: 21652 bytes
2376190                            0x2441FE                           XZ compressed data, total size: 21024 bytes
2397214                            0x24941E                           XZ compressed data, total size: 21376 bytes
2418590                            0x24E79E                           XZ compressed data, total size: 17956 bytes
2436546                            0x252DC2                           XZ compressed data, total size: 22000 bytes
2458546                            0x2583B2                           XZ compressed data, total size: 37016 bytes
2495562                            0x26144A                           XZ compressed data, total size: 21956 bytes
2517518                            0x266A0E                           XZ compressed data, total size: 17040 bytes
2534558                            0x26AC9E                           XZ compressed data, total size: 16120 bytes
2550678                            0x26EB96                           XZ compressed data, total size: 7060 bytes
2557738                            0x27072A                           XZ compressed data, total size: 16020 bytes
2573758                            0x2745BE                           XZ compressed data, total size: 23056 bytes
2596814                            0x279FCE                           XZ compressed data, total size: 24236 bytes
2621050                            0x27FE7A                           XZ compressed data, total size: 23652 bytes
2644702                            0x285ADE                           XZ compressed data, total size: 26556 bytes
2671258                            0x28C29A                           XZ compressed data, total size: 21624 bytes
2692882                            0x291712                           XZ compressed data, total size: 24600 bytes
2717482                            0x29772A                           XZ compressed data, total size: 23036 bytes
2740518                            0x29D126                           XZ compressed data, total size: 27328 bytes
2767846                            0x2A3BE6                           XZ compressed data, total size: 22784 bytes
2790630                            0x2A94E6                           XZ compressed data, total size: 19700 bytes
2810330                            0x2AE1DA                           XZ compressed data, total size: 19580 bytes
2829910                            0x2B2E56                           XZ compressed data, total size: 17024 bytes
2846934                            0x2B70D6                           XZ compressed data, total size: 16984 bytes
2863918                            0x2BB32E                           XZ compressed data, total size: 20552 bytes
2884470                            0x2C0376                           XZ compressed data, total size: 22536 bytes
2907006                            0x2C5B7E                           XZ compressed data, total size: 27980 bytes
2934986                            0x2CC8CA                           XZ compressed data, total size: 23244 bytes
2958230                            0x2D2396                           XZ compressed data, total size: 21820 bytes
2980050                            0x2D78D2                           XZ compressed data, total size: 15392 bytes
2995442                            0x2DB4F2                           XZ compressed data, total size: 7056 bytes
3002498                            0x2DD082                           XZ compressed data, total size: 19808 bytes
3022306                            0x2E1DE2                           XZ compressed data, total size: 19644 bytes
3041950                            0x2E6A9E                           XZ compressed data, total size: 21884 bytes
3063834                            0x2EC01A                           XZ compressed data, total size: 22964 bytes
3086798                            0x2F19CE                           XZ compressed data, total size: 34616 bytes
3121414                            0x2FA106                           XZ compressed data, total size: 17448 bytes
3138862                            0x2FE52E                           XZ compressed data, total size: 14780 bytes
3153642                            0x301EEA                           XZ compressed data, total size: 4824 bytes
3158466                            0x3031C2                           XZ compressed data, total size: 19040 bytes
3177506                            0x307C22                           XZ compressed data, total size: 22628 bytes
3200134                            0x30D486                           XZ compressed data, total size: 21988 bytes
3222122                            0x312A6A                           XZ compressed data, total size: 23636 bytes
3245758                            0x3186BE                           XZ compressed data, total size: 22696 bytes
3268454                            0x31DF66                           XZ compressed data, total size: 1124 bytes
3269578                            0x31E3CA                           XZ compressed data, total size: 26400 bytes
3295978                            0x324AEA                           XZ compressed data, total size: 9704 bytes
3305682                            0x3270D2                           XZ compressed data, total size: 14944 bytes
3320626                            0x32AB32                           XZ compressed data, total size: 32800 bytes
3353426                            0x332B52                           XZ compressed data, total size: 784 bytes
3354210                            0x332E62                           XZ compressed data, total size: 17936 bytes
3372146                            0x337472                           XZ compressed data, total size: 25024 bytes
3397170                            0x33D632                           XZ compressed data, total size: 25140 bytes
3422310                            0x343866                           XZ compressed data, total size: 24472 bytes
3446782                            0x3497FE                           XZ compressed data, total size: 28164 bytes
3474946                            0x350602                           XZ compressed data, total size: 27360 bytes
3502306                            0x3570E2                           XZ compressed data, total size: 20920 bytes
3523226                            0x35C29A                           XZ compressed data, total size: 18724 bytes
3541950                            0x360BBE                           XZ compressed data, total size: 9124 bytes
3551074                            0x362F62                           XZ compressed data, total size: 11628 bytes
3562702                            0x365CCE                           XZ compressed data, total size: 15200 bytes
3577902                            0x36982E                           XZ compressed data, total size: 23956 bytes
3601860                            0x36F5C4                           XZ compressed data, total size: 1668 bytes
3603530                            0x36FC4A                           XZ compressed data, total size: 1652 bytes
3605184                            0x3702C0                           XZ compressed data, total size: 3724 bytes
3608910                            0x37114E                           XZ compressed data, total size: 580 bytes
3609492                            0x371394                           XZ compressed data, total size: 152 bytes
3609654                            0x371436                           XZ compressed data, total size: 884 bytes
3997696                            0x3D0000                           SquashFS file system, little endian, version: 4.0,
                                                                      compression: xz, inode count: 95, block size: 65536,
                                                                      image size: 3225548 bytes, created: 2024-06-17 11:24:55
7224524                            0x6E3CCC                           gzip compressed data, operating system: Unix,
                                                                      timestamp: 2024-06-17 11:24:57, total size: 53568 bytes
7798784                            0x770000                           JFFS2 filesystem, little endian, nodes: 18, total size:
                                                                      491532 bytes
```

Now, we're not sure of the exact partition layout, but a rough estimate could be

| Start    | End      | Name         |
| -------- | -------- | ------------ |
| 0x000000 | 0x04FFFF | factory_boot |
| 0x050000 | 0x06FFFF | boot         |
| 0x070000 | 0x3CFFFF | kernel       |
| 0x3D0000 | 0x76FFFF | rootfs       |
| 0x770000 | 0x7FFFFF | data         |
Lastly, we can use `binwalk` again to extract all of these. At this point, I switched back to macOS and had to use the new binwalk (rust based) instead of the standard Kali Python3 version. My syntax here may differ, but for completeness sake, I will provide both v2/v3 commands. Also make sure you install `jefferson` via `pip` and `unsquashfs`/`sasquatch` for jffs2 and squashfs extractor support.

```bash
binwalk -e --dd=".*" backup2.bin
binwalk -e backup2.bin
```

Again, the way binwalk works differs from v2 and v3. On v2, it's a flat file structure, on v3, it's directory based.. which kinda sucks. 

```bash
tree
.
├── 1B6E36
│   └── decompressed.bin
├── 1BE372
│   └── decompressed.bin
├── 1C5CBE
│   └── decompressed.bin
├── 1CD50E
│   └── decompressed.bin
├── 1D3BB6
│   └── decompressed.bin
├── 1D74F6
│   └── decompressed.bin
├── 1DB81E
│   └── decompressed.bin
├── 1DF252
│   └── decompressed.bin
├── 1E1A62
│   └── decompressed.bin
├── 1E7252
│   └── decompressed.bin
├── 1E9A5A
│   └── decompressed.bin
├── 1EECBA
│   └── decompressed.bin
├── 1F046A
│   └── decompressed.bin
├── 1F62FA
│   └── decompressed.bin
├── 1FB312
│   └── decompressed.bin
├── 201252
│   └── decompressed.bin
├── 2078D6
│   └── decompressed.bin
├── 20DB32
│   └── decompressed.bin
├── 2139A6
│   └── decompressed.bin
├── 21A842
│   └── decompressed.bin
├── 220DE6
│   └── decompressed.bin
├── 22703E
│   └── decompressed.bin
├── 22B0FE
│   └── decompressed.bin
├── 233C12
│   └── decompressed.bin
├── 23913A
│   └── decompressed.bin
├── 23A336
│   └── decompressed.bin
├── 23ED6A
│   └── decompressed.bin
├── 2441FE
│   └── decompressed.bin
├── 24941E
│   └── decompressed.bin
├── 24E79E
│   └── decompressed.bin
├── 252DC2
│   └── decompressed.bin
├── 2583B2
│   └── decompressed.bin
├── 26144A
│   └── decompressed.bin
├── 266A0E
│   └── decompressed.bin
├── 26AC9E
│   └── decompressed.bin
├── 26EB96
│   └── decompressed.bin
├── 27072A
│   └── decompressed.bin
├── 2745BE
│   └── decompressed.bin
├── 279FCE
│   └── decompressed.bin
├── 27FE7A
│   └── decompressed.bin
├── 285ADE
│   └── decompressed.bin
├── 28C29A
│   └── decompressed.bin
├── 291712
│   └── decompressed.bin
├── 29772A
│   └── decompressed.bin
├── 29D126
│   └── decompressed.bin
├── 2A3BE6
│   └── decompressed.bin
├── 2A94E6
│   └── decompressed.bin
├── 2AE1DA
│   └── decompressed.bin
├── 2B2E56
│   └── decompressed.bin
├── 2B70D6
│   └── decompressed.bin
├── 2BB32E
│   └── decompressed.bin
├── 2C0376
│   └── decompressed.bin
├── 2C5B7E
│   └── decompressed.bin
├── 2CC8CA
│   └── decompressed.bin
├── 2D2396
│   └── decompressed.bin
├── 2D78D2
│   └── decompressed.bin
├── 2DB4F2
│   └── decompressed.bin
├── 2DD082
│   └── decompressed.bin
├── 2E1DE2
│   └── decompressed.bin
├── 2E6A9E
│   └── decompressed.bin
├── 2EC01A
│   └── decompressed.bin
├── 2F19CE
│   └── decompressed.bin
├── 2FA106
│   └── decompressed.bin
├── 2FE52E
│   └── decompressed.bin
├── 30100
│   └── decompressed.bin
├── 301EEA
│   └── decompressed.bin
├── 3031C2
│   └── decompressed.bin
├── 307C22
│   └── decompressed.bin
├── 30D486
│   └── decompressed.bin
├── 312A6A
│   └── decompressed.bin
├── 3186BE
│   └── decompressed.bin
├── 31DF66
│   └── decompressed.bin
├── 31E3CA
│   └── decompressed.bin
├── 324AEA
│   └── decompressed.bin
├── 3270D2
│   └── decompressed.bin
├── 32AB32
│   └── decompressed.bin
├── 332B52
│   └── decompressed.bin
├── 332E62
│   └── decompressed.bin
├── 337472
│   └── decompressed.bin
├── 33D632
│   └── decompressed.bin
├── 343866
│   └── decompressed.bin
├── 3497FE
│   └── decompressed.bin
├── 350602
│   └── decompressed.bin
├── 3570E2
│   └── decompressed.bin
├── 35C29A
│   └── decompressed.bin
├── 360BBE
│   └── decompressed.bin
├── 362F62
│   └── decompressed.bin
├── 365CCE
│   └── decompressed.bin
├── 36982E
│   └── decompressed.bin
├── 36F5C4
│   └── decompressed.bin
├── 36FC4A
│   └── decompressed.bin
├── 3702C0
│   └── decompressed.bin
├── 37114E
│   └── decompressed.bin
├── 371394
│   └── decompressed.bin
├── 371436
│   └── decompressed.bin
├── 3D0000
│   └── squashfs-root
│       ├── bin
│       │   ├── dmesg -> busybox
│       │   ├── gdbserver
│       │   ├── getcpuinfo
│       │   ├── impdbg
│       │   ├── logcat
│       │   └── main
│       ├── config
│       │   └── auto_detect_sensor
│       │       ├── detect_i2c_install_sensor.sh
│       │       ├── modules
│       │       │   └── sensor_sc2336p_t23.ko
│       │       └── sensor_db.cfg
│       ├── etc
│       │   ├── OSD
│       │   │   ├── angle2560x1920.bin
│       │   │   ├── angle960P.bin
│       │   │   ├── logo1080P.bin
│       │   │   ├── logo2304x1296.bin
│       │   │   ├── logo2560x1440.bin
│       │   │   ├── logo2688x1520.bin
│       │   │   ├── logo360P.bin
│       │   │   ├── logo720P.bin
│       │   │   ├── time1080P.bin
│       │   │   ├── time2304x1296.bin
│       │   │   ├── time2560x1440.bin
│       │   │   ├── time360P.bin
│       │   │   └── time720P.bin
│       │   ├── data
│       │   │   └── dss_certificates
│       │   │       ├── StarfieldClass2CertificationAuthority.pem
│       │   │       └── dpss_public_key.pem
│       │   ├── default_isp
│       │   │   └── sc2336p-t23.bin
│       │   ├── dnsd.conf
│       │   ├── dsd_convert.json
│       │   ├── hw_id.bin
│       │   ├── isp_extra
│       │   │   └── sc2336p-factorymode-t23.bin
│       │   ├── plugins
│       │   │   ├── icassp8k_opt.bin
│       │   │   ├── icassp8k_opt_param.bin
│       │   │   └── icassp_opt.bin.dsc
│       │   ├── sensor -> /tmp/base-files/cfg
│       │   ├── uhttpd.crt
│       │   ├── uhttpd.key
│       │   └── webrtc_profile.ini
│       ├── lib
│       │   ├── audio
│       │   │   ├── Emergency.g711
│       │   │   ├── Red_Alert.g711
│       │   │   ├── Siren.g711
│       │   │   ├── motion_deteck_alarm.g711
│       │   │   ├── motion_deteck_cue.g711
│       │   │   ├── prompt_tone_failed.g711
│       │   │   ├── prompt_tone_sucess.g711
│       │   │   ├── register_success.g711
│       │   │   ├── reset_success.g711
│       │   │   ├── sd_abnormal.g711
│       │   │   ├── sd_not_formated.g711
│       │   │   ├── sweep_frequency.g711
│       │   │   ├── wlan_state_connect_suc.g711
│       │   │   ├── wlan_state_connecting.g711
│       │   │   ├── wlan_state_get_ip_fail.g711
│       │   │   ├── wlan_state_mode_switch_suc.g711
│       │   │   └── wlan_state_password_err.g711
│       │   ├── load_isp_data
│       │   └── modules
│       │       └── 3.10.14
│       │           ├── audio.ko
│       │           ├── esp32.ko
│       │           ├── jzmmc_v12.ko
│       │           ├── mmc_block.ko
│       │           ├── mmc_core.ko
│       │           ├── sinfo.ko
│       │           └── tx-isp-t23.ko
│       └── usr
│           ├── bin
│           │   ├── iperf
│           │   ├── is_cal_real.script
│           │   ├── song-16-gb2312.bin
│           │   └── tail -> ../../bin/busybox
│           ├── lib
│           │   ├── libaudioProcess.so
│           │   ├── libstdc++.so.6 -> libstdc++.so.6.0.21
│           │   ├── libstdc++.so.6.0.21
│           │   └── libudt.so
│           └── sbin
│               ├── chroot -> ../../bin/busybox
│               ├── dnsd -> ../../bin/busybox
│               ├── fatlabel
│               ├── fsck.fat
│               ├── hostapd
│               └── mkfs.fat
├── 50000
│   └── u-boot-lzma.img.bin
├── 6800
│   └── u-boot-lzma.img.bin
├── 6E3CCC
│   └── decompressed.bin
├── 70200
│   └── mips_Ingenic_Linux-3.10.14.bin
└── 770000
    └── jffs2-root
        └── jffs2
```

Either way, at this point, we've now extracted uboot, the kernel, rootfs, and an overlay. 

## Cracking the Hash

Before trying to get UART, we should be prepared for a password. From my prior reading on C200 hacking, the login was `root:slprealtek`. I also found some references to `slplzgjipc` and `slpmstar` as passwords from [this](https://github.com/nervous-inhuman/tplink-tapo-c200-re/discussions/6) GitHub discussion. Let's try to find the hash with a simple grep:

```bash
grep -arin "^root:" .

./1E1A62/decompressed.bin:365:root:$1$lI7mZm78$dA8pGGOerrGJXj7Tp2yQg/:0:0:root:/root:/bin/ash
./1E1A62/decompressed.bin:836:root:x:0:0:99999:7:::
```

Pretty easy: `$1$lI7mZm78$dA8pGGOerrGJXj7Tp2yQg/`. At first, I created a simple wordlist containing the previously seen before password candidates and used hashcat to try and crack it-- however, this didn't crack. So, it's using a (so far) undocumented password. Based on the past candidates, it looks like it uses the `slp` prefix and then `a-z`. I had a friend with an RTX 5070 Ti attempt to crack the hash using hashcat, since my Macbook probably would have taken a _while_. 

```bash
hashcat -m 500 '$1$lI7mZm78$dA8pGGOerrGJXj7Tp2yQg/' -a 3 'slp?1?1?1?1?1?1?1' --custom-charset1=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
    
$1$lI7mZm78$dA8pGGOerrGJXj7Tp2yQg/:slpingenic

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 500 (md5crypt, MD5 (Unix), Cisco-IOS $1$ (MD5))
Hash.Target......: $1$lI7mZm78$dA8pGGOerrGJXj7Tp2yQg/
Time.Started.....: Thu Aug 14 20:37:06 2025 (52 mins, 6 secs)
Time.Estimated...: Thu Aug 14 21:29:12 2025 (0 secs)
Kernel.Feature...: Optimized Kernel
Guess.Mask.......: slp?1?1?1?1?1?1?1 [10]
Guess.Charset....: -1 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz, -2 Undefined, -3 Undefined, -4 Undefined
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........: 29562.2 kH/s (8.48ms) @ Accel:32 Loops:1000 Thr:128 Vec:1
Speed.#2.........:   613.3 kH/s (6.18ms) @ Accel:1024 Loops:125 Thr:32 Vec:1
Speed.#*.........: 30175.4 kH/s
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 100396195840/1028071702528 (9.77%)
Rejected.........: 0/100396195840 (0.00%)
Restore.Point....: 100393615360/1028071702528 (9.77%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1000
Restore.Sub.#2...: Salt:0 Amplifier:0-1 Iteration:625-750
Candidate.Engine.: Device Generator
Candidates.#1....: slprNALIOM -> slpWpamiso
Candidates.#2....: slpkMpKIOM -> slpvUxKIOM
Hardware.Mon.#1..: Temp: 65c Fan: 56% Util: 97% Core:2775MHz Mem:14001MHz Bus:16
Hardware.Mon.#2..: Temp:  0c Fan:  0% Util: 85% Core: 600MHz Mem:2400MHz Bus:16

Started: Thu Aug 14 20:36:59 2025
Stopped: Thu Aug 14 21:29:14 2025
```

We get the password: `slpingenic`. To be fair, I probably could have reduced the alphabet to just lowercase instead of `A-z` and ran it myself, but I rather need to try to use hashcat once than twice :^).  And it only took 52 minutes-- not bad! (shoutout [carter](https://carterhaney.com/)). Another interesting thing here (which I should have realized earlier) is the password convention seems to follow `slp<name of processor>`. In C200, it's `slprealtek`, there was a reference to `mstar` which is another chip, and then in our case, `ingenic` which references in the Ingenic T23. 

## UART Shell

The next step is to pop a shell via UART. I kind of pushed this off to last, because well, we didn't know the password.. but also, it requires soldering which I had never done. 

![[c100_test_pads.png]]
We can identify 4 test pads: probably VCC/GND/TX/RX (in an unknown order). The first step is to identify which pin is which. In general, this can be determined using a multimeter in DC mode. 

```
VCC = Constant voltage (e.g. 3.3V)
GND = 0V 
RX = Constant for the most part
TX = Fluctuates at boot because logging over serial
```

We just need to test each pin's voltage during the boot process. I powered on my multimeter, set it to 20DC and attached the black probe to a ground (in this case, the copper around where the lens screws used to be) and attached red to each pin. From my testing:

```
PIN 1 = 3.28
PIN 2 = 0.00
PIN 3 = 3.27
PIN 4 = Fluctation, ends at 3.27
```

So, a probable guess would be VCC/GND/RX/TX. It's possible VCC and RX are swapped, but Usually RX and TX will be beside each other: RX/GND/VCC/TX ordering doesn't make too much sense. Now, we just need to solder some wires onto the test pads so we can connect our DuPont wires and our USB to UART adapter. My CH341A came with some pin headers, and so I figured I could snap them apart using scissors to get individual pins and solder those on. However, the black casing (2.54mm) was too wide for the pads and wouldn't allow me to align all 4 pins onto the pads. So, I used some pliers to crush the black plastic housing, and then grabbed the metal while using my fingers to pull down the black housing. 

![[c100_header_pins.png]]

This allowed me to turn my standard header pins into individual, bare pins. I'm not sure if this was the best method, or if there's some other preferred method to connecting to test pads, but oh well. If anyone knows the right answer, please reach out :). 

Unfortunately, at this point I had to break away from my beginner kit and add some additional items, including a soldering iron, solder, flux, desoldering braid, and other standard soldering station items. 

With my new soldering gear, I was ready to take on the task! ... Until, I accidentally pulled up one of the solder pads. And so, that idea failed and I had to buy another camera.

For attempt #2, I learned from my mistakes. The pin idea would have been nice, but trying to align something vertically on a really small pad is insanely hard-- especially for someone who has never soldered before. Instead, I decided to just use my male-to-male DuPont wires, cut off one end's connector, and strip a bit of the wire using 28 gauge wire strippers. Then, I was able to more easily solder onto the pads. Also, this time I used flux and it was almost an immediate difference how easy it was. Highly recommend. 

![[c100_soldered.png]]
It should be worth mentioning that when connecting to UART:

- ground = ground
- TX on the board = RX on the adapter
- RX on the board = TX on the adapter

Then, I was able to use `screen` with a baud rate 115200 to connect to UART :) 

```bash
screen /dev/ttyUSB0 115200

U-Boot SPL 2013.07 (Jun 17 2024 - 19:22:26)
Board info: T23N

apll_freq = 1200000000 
mpll_freq = 1176000000 
sdram init start
DDR clk rate 588000000
DDR_PAR of eFuse: 00000000 00000000
sdram init finished
image entry point: 0x80100000

U-Boot 2013.07 (Jun 17 2024 - 19:22:26)

Board: ISVP (Ingenic XBurst T23 SoC)
DRAM:  64 MiB
Top of RAM usable for U-Boot at: 84000000
Reserving 425k for U-Boot at: 83f94000
Reserving 32784k for malloc() at: 81f90000
Reserving 32 Bytes for Board Info at: 81f8ffe0
Reserving 124 Bytes for Global Data at: 81f8ff64
Reserving 128k for boot params() at: 81f6ff64
Stack Pointer at: 81f6ff48
Now running in RAM - U-Boot at: 83f94000
MMC:   msc: 0
the manufacturer 1c
SF: Detected EN25QX64A

*** Warning - bad CRC, using default environment

In:    serial
Out:   serial
Err:   serial
gpio_request lable = ir_cut gpio = 57
Net:   No ethernet found.
Autobooting in 1 seconds
Firmware check pass!
cmd_buf = sf probe;sf read 0x80600000 0x50000 0x20000
the manufacturer 1c
SF: Detected EN25QX64A

--->probe spend 4 ms
SF: 131072 bytes @ 0x50000 Read: OK
--->read spend 47 ms
ret = 0, dst_len = 167096
cmd_buf = go 0x820a0000
## Starting application at 0x820A0000 ...
Flush cache all before jump. 


U-Boot 2013.07 (Jun 17 2024 - 19:21:57)

Board: ISVP (Ingenic XBurst T23 SoC)
DRAM:  64 MiB
Top of RAM usable for U-Boot at: 84000000
Reserving 186k for U-Boot at: 83fd0000
Reserving 32784k for malloc() at: 81fcc000
Reserving 32 Bytes for Board Info at: 81fcbfe0
Reserving 124 Bytes for Global Data at: 81fcbf64
Reserving 128k for boot params() at: 81fabf64
Stack Pointer at: 81fabf48
Now running in RAM - U-Boot at: 83fd0000
MMC:   msc: 0
the manufacturer 1c
SF: Detected EN25QX64A

*** Warning - bad CRC, using default environment

In:    serial
Out:   serial
Err:   serial
gpio_request lable = ir_cut gpio = 57
VF: validateFirmwareWithRecover: copying flash to 0x22000000
the manufacturer 1c
SF: Detected EN25QX64A

--->probe spend 5 ms
SF: 8388608 bytes @ 0x0 Read: OK
--->read spend 2742 ms
VF: validateFirmwareWithRecover: ret=0(81fabe38)
VF: validateFirmwareWithRecover: validate local firmware...
TP Header at 22070000

set bootargs to earlyprintk console=ttyS1,115200n8 mem=42M@0x0 rmem=22M@0x2a00000 rootwait nprofile_irq_duration=on rootfstype=squashfs ro mtdparts=spi_nor.0  root=/dev/mtdblock6 rw spdev=/dev/mtdblock7 noinitrd init=/etc/preinit
the manufacturer 1c
SF: Detected EN25QX64A

--->probe spend 4 ms
SF: 2097152 bytes @ 0x70200 Read: OK
--->read spend 689 ms
## Booting kernel from Legacy Image at 80600000 ...
   Image Name:   mips Ingenic Linux-3.10.14
   Image Type:   MIPS Linux Kernel Image (lzma compressed)
   Data Size:    1298384 Bytes = 1.2 MiB
   Load Address: 80010000
   Entry Point:  8031e330
   Verifying Checksum ... OK
   Uncompressing Kernel Image ... OK

Starting kernel ...
```

From the resources I found on the C200 model, they mentioned two U-boot stages, and dropping a shell required typing `slp` on the **second** autoboot. I never encountered a second autoboot-- just one that booted into the kernel. 

## Device Rooted

There are two ways to get root. The first is through the normal boot process. It's a bit hectic, since you'll see random debugging messages, but if you wait until most of the booting process is done, you can press 'Enter' a couple of times to get a login prompt. We can use the credentials we found earlier: `root:slpingenic` to drop into a shell. 

```bash
un 17 19:24:47 login[117]: root login on 'ttyS1'



BusyBox v1.19.4 (2024-06-17 19:22:15 CST) built-in shell (ash)
Enter 'help' for a list of built-in commands.

    SSSSSSSSSSSSSSSS      LLLLLLLLLLLLLL              PPPPPPPPPPPPPPPPPPPPPP
  SSSSSSSSSSSSSSSSSS      LLLLLLLLLLLLLL              PPPPPPPPPPPPPPPPPPPPPPPP
SSSSSS        SSSSSSSS        LLLLLL                      PPPPPP        PPPPPPPP
SSSSSS          SSSSSS        LLLLLL                      PPPPPP          PPPPPP
SSSSSSSS          SSSS        LLLLLL                      PPPPPP          PPPPPP
  SSSSSSSSSSSSSS              LLLLLL                      PPPPPP        PPPPPPPP
    SSSSSSSSSSSSSSSS          LLLLLL                      PPPPPPPPPPPPPPPPPPPP
        SSSSSSSSSSSSSS        LLLLLL                      PPPPPPPPPPPPPPPP
SSSS          SSSSSSSSSS      LLLLLL            LL        PPPPPP
SSSSSS            SSSSSS      LLLLLL          LLLLLL      PPPPPP
SSSSSSSS          SSSSSS   [    5.782579] misc sinfo_release
   LLLLLL          LLLL        PPPPPP
  SSSSSSSS      SSSSSSSS      LLLLLL      LLLLLLLL        PPPPPP
  SSSSSSSSSSSSSSSSSSSS    LLLLLLLLLLLLLLLLLLLLLLLL    PPPPPPPPPPPPPP
  SSSS  SSSSSSSSSS        LLLLLLLLLLLLLLLLLLLLLL      PPPPPPPPPPPPPP
-------------------------------------------------------------------------------
SMARTs, the power to be your best! (torchlight: svn unknown)
-------------------------------------------------------------------------------

root@(c100v5):~# id
uid=0(root) gid=0(root) groups=0(root)
```

The second is by interrupting the U-boot process and overriding `bootargs` and dropping us into the kernel directory. From the boot logs, we can see:


```
Booting kernel from Legacy Image at 80600000 ... Starting kernel ... [ 0.000000] Memory: 38000k/43008k available (3160k kernel code, 5008k reserved, 619k data, 184k init, 0k highmem) [ 0.658685] 0x000000070200-0x0000001b0000 : "kernel" [ 0.663866] mtd: partition "kernel" doesn't start on an erase block boundary -- force read-only [ 0.889661] Freeing unused kernel memory: 184K (803c2000 - 803f0000)
```

The default `bootargs` is:

```bash
isvp_t23# printenv
baudrate=115200
bootargs=console=ttyS1,115200n8 mem=41M@0x0 rmem=23M@0x2900000 noinitrd init=/etc/preinit rootfstype=squashfs root=/dev/mtdblock6 rw
bootdelay=1
bootfile=uImage
ethaddr=00:00:23:34:45:68
gatewayip=192.168.0.1
ipaddr=192.168.0.60
loadaddr=0x80600000
loads_echo=1
netmask=255.255.255.0
serverip=192.168.1.100
stderr=serial
stdin=serial
stdout=serial
```

So, it's attempting to execute `/etc/preinit`. We can modify init to be `/bin/sh` using `setenv bootargs 'console=ttyS1,115200n8 mem=41M@0x0 rmem=23M@0x2900000 noinitrd rootfstype=squashfs root=/dev/mtdblock6 rw init=/bin/sh'`. Then, we just need to load the kernel:

```bash
isvp_t23# setenv bootargs 'console=ttyS1,115200n8 mem=41M@0x0 rmem=23M@0x2900000 noinitrd rootfstype=squashfs root=/dev/mtdblock6 rw init=/bin/sh'
isvp_t23# sf probe
the manufacturer 1c
SF: Detected EN25QX64A

--->probe spend 5 ms
isvp_t23# sf read ${loadaddr} 0x70200 0x200000
SF: 2097152 bytes @ 0x70200 Read: OK
--->read spend 688 ms
isvp_t23# bootm ${loadaddr}
## Booting kernel from Legacy Image at 80600000 ...
   Image Name:   mips Ingenic Linux-3.10.14
   Image Type:   MIPS Linux Kernel Image (lzma compressed)
   Data Size:    1298384 Bytes = 1.2 MiB
   Load Address: 80010000
   Entry Point:  8031e330
   Verifying Checksum ... OK
   Uncompressing Kernel Image ... OK

Starting kernel ...

[    0.000000] Linux version 3.10.14 (root@smartlifeci1) (gcc version 5.4.0 (Ingenic Ingenic r3.3.0-gcc540 Smaller Size 2023.05-22) ) #1 PREEMPT Mon Jun 17 19:24:44 CST 2024
[    0.000000] CPU0 RESET ERROR PC:8B130304
[    0.000000] CPU0 revision is: 00d00100 (Ingenic Xburst)
[    0.000000] FPU revision is: 00b70000
[    0.000000] cgu_vpu clk should be opened!

...

BusyBox v1.19.4 (2024-06-17 19:22:15 CST) built-in shell (ash)
Enter 'help' for a list of built-in commands.

/bin/sh: can't access tty; job control turned off
/ # [    1.370372] usb 1-1: new high-speed USB device number 2 using dwc2
ls
bin      etc      mnt       proc     root     sp_rom   tmp      var
dev      lib      moverlay  rom      msbin     sys      usr      www
/ # id
uid=0(root) gid=0(root)
/ # 
```

The preferred method would be the first shell that requires a password, as that one will boot with `/etc/preinit` and initialize all processes used by the camera. Otherwise, if your goal is to see (for example) processes, open ports, etc., you won't have that with overwriting the U-boot sequence. 

![[c100_shell_popped.png]]



