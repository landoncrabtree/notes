---
title: MacOS Persistence
draft: false
tags:
---
I was recently performing some routine cleanup on my Macbook (macOS Sequoia 15.1), and specifically, was taking a look at the `System Preferences > Login Items & Extensions` pane to audit what applications I have enabled for startup. There was one item in there (Dropshelf) which I could _not_ find the `.plist` for. Usually, they're stored in `~/Library/LaunchAgents`, `/Library/LaunchAgents`, or `/Library/LaunchDaemons`. Trying to identify _where_ the items in this pane were being sourced from, led me to doing some research on macOS login items and background tasks, their purposes, their locations, and some cool tools to manage them from the CLI.

# macOS Persistence Types

The "Login Items & Extensions" pane is split into two sections: 1) "Open at Login" and 2) "Allow in the background". The "Open at Login" is pretty easy, it simply references a `.app` file that will be executed when the user logs in. The "Allow in the background" is a bit more ambiguous, but for the most part, they come from LaunchAgents and LaunchDaemons via `launchctl`. 

- LaunchAgent: Run in the context of a `user` and load when the user logs in to their account. 
- LaunchDaemon: Run in the context of the `system` and load at system startup-- independent of user sessions. 

Before macOS 13, `.plist` files were the only method of enabling background tasks and were loaded and launched via the `launchctl` (basically macOS's `systemctl`). However, in macOS versions >13, [Apple implemented "background task management"](https://support.apple.com/guide/deployment/manage-login-items-background-tasks-mac-depdca572563/web) (BTM) which is a file structure format for state management of background tasks. This is where the "Login Items & Extensions" pane pulls its data from. 

# macOS Persistence Locations

## Open at Login

"Open at Login" is sourced from Apple's "[background task management](https://support.apple.com/guide/deployment/manage-login-items-background-tasks-mac-depdca572563/web)" (BTM). In macOS <13, the BTM file is located at `~/Library/Application Support/com.apple.backgroundtaskmanagementagent/backgrounditems.btm` and can be parsed using [bgiparser](https://github.com/mnrkbys/bgiparser). In macOS >=13, BTM is located at `/private/var/db/com.apple.backgroundtaskmanagement` and can be dumped using the built-in `sfltool dumpbtm`. 

For example, let's look at `Raycast` which is in the "Open at Login" pane. 

![[Pasted image 20241230175542.png]]

We can use `sfltool dumpbtm | grep -n5 Raycast`:

```
735-                 UUID: 5C2D022A-88DF-40BF-BFA0-544FAABA3904
736:                 Name: Raycast
737:       Developer Name: Raycast Technologies Inc
738-      Team Identifier: SY64MV22J9
739-                 Type: app (0x2)
740-                Flags: [  ] (0)
741-          Disposition: [enabled, allowed, visible, notified] (0xb)
742-           Identifier: 2.com.raycast.macos
743:                  URL: file:///Applications/Raycast.app/
744-           Generation: 1
745-    Bundle Identifier: com.raycast.macos
```

If you want to remove "Open at Login" items, you must do it through the "Open at Login" pane, selecting the application and using the `-` icon. 

## Allow in the background

These items will (typically) be stored in either `~/Library/LaunchAgents`, `/Library/LaunchAgents`, `/Library/LaunchDaemons`, `/System/Library/LaunchDaemons`, or `/System/Library/LaunchAgents`. In these folders, you will find `.plist` files which are [loaded and launched](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html) via `launchctl`.

For example, `brew_autoupdate`:

![[Pasted image 20241230180152.png]]

We can use `launchctl dumpstate | grep -n5 brew_autoupdate`:

```
gui/501/com.github.domt4.homebrew-autoupdate = {
	active count = 0
	path = /Users/landoncrabtree/Library/LaunchAgents/com.github.domt4.homebrew-autoupdate.plist
	type = LaunchAgent
```

With this item, we see that it's loaded from `/Users/landoncrabtree/Library/LaunchAgents/com.github.domt4.homebrew-autoupdate.plist` and we can remove this background item either by toggling it within the "Allow in the background" pane or by removing the file, ie `rm -rf /Users/landoncrabtree/Library/LaunchAgents/com.github.domt4.homebrew-autoupdate.plist` and then performing a reboot. 

However, an interesting thing to note is that not all `launchctl` services require a `.plist`, nor do they need to be in a predefined path (ie: you can load a service from `~/Desktop/evil.plist` if you wanted). For example, take a look at `Dropshelf` which is in the "Allow in Background" pane. Similar to our `brew_autoupdate`, we would _hope_ to find the associated `.plist`:

![[Pasted image 20241230174639.png]]

Yet, `launchctl dumpstate | grep -n5 Dropshelf`:

```
gui/501/com.pilotmoon.Dropshelf.launcher = {
	active count = 0
	path = (submitted by smd.322)
	type = Submitted
	managed_by = com.apple.xpc.ServiceManagement
```


The `path` is "submitted by smd.322". As it turns out, apps can use the Service Management (SM) framework [API](https://developer.apple.com/documentation/servicemanagement/smappservice) to register LaunchAgents and LaunchDaemons directly, without needing to create an associated `.plist`. This makes it a bit more tricky from the experienced macOS user side of things, as it appears it is not possible to delete these services via CLI but rather just disable by toggling the item in the "Allow in the background" pane. 


(Side-note: I would think an associated plist (or other propriety smd file format) has to exist somewhere on the filesystem, but I haven't been able to locate it just yet. If you know where it is, feel free to reach out to `me@landon.pw` and I can update this post accordingly). 

