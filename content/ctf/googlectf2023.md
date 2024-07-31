---
title: GoogleCTF 2023
draft: false
tags:
  - ctf
---
> Google will run the 2023 CTF competition in two parts: an online jeopardy-CTF competition, and a different on-site contest open only to the top 8 teams of the online jeopardy-CTF competition. "Capture The Flag" (CTF) competitions are not related to running outdoors or playing first-person shooters. Instead, they consist of a set of computer security puzzles (or challenges) involving reverse-engineering, memory corruption, cryptography, web technologies, and more. When players solve them they get a "flag", a secret string which can be exchanged for points. The more points a team earns, the higher up it moves in rank.

# Web Exploitation

## Under Construction

> We were building a web app but the new CEO wants it remade in php.

For this challenge, we are given two websites:

- https://under-construction-web.2023.ctfcompetition.com/
- https://under-construction-php-web.2023.ctfcompetition.com/

As well as the source code to the website backends. From this, we can see that the original website was written in Python3 using Flask, however, it is being converted to PHP.

The Flask app is a simple registration and login page, where users can create accounts:

I did a quick review of the two codebases, and determined the following:

- They are using the same SQL Database (I think?). Flask uses SQLAlchemy to interact with the database, and PHP uses PDO.
- Users register on the Flask app and the account gets created using SQLAlchemy. A request is then made internally to "account_migrator.php" which creates the same user account using PHP's PDO. This is why I say I think in the above bullet, because then two accounts are created with the same information. But from everything I read, both codebases use the same SQL host, DB, and user... so odd behavior but works I guess.

Scanning through the actual source code, we notice two important details:

```python
# File: /flask/authorized_routes.py
@authorized.route('/signup', methods=['POST'])
def signup_post():
    raw_request = request.get_data()
    username = request.form.get('username')
    password = request.form.get('password')
    tier = models.Tier(request.form.get('tier'))

    if(tier == models.Tier.GOLD):
        flash('GOLD tier only allowed for the CEO')
        return redirect(url_for('authorized.signup'))
```

```php
# File: /php/index.php
function getResponse()
{
    if (!isset($_POST['username']) || !isset($_POST['password'])) {
        return NULL;
    }

    $username = $_POST['username'];
    $password = $_POST['password'];

    if (!is_string($username) || !is_string($password)) {
        return "Please provide username and password as string";
    }

    $tier = getUserTier($username, $password);

    if ($tier === NULL) {
        return "Invalid credentials";
    }

    $response = "Login successful. Welcome " . htmlspecialchars($username) . ".";

    if ($tier === "gold") {
        $response .= " " . getenv("FLAG");
    }

    return $response;
}
```

So, to retrieve the flag, a user has to login with an account that has Gold tier. However, the signup endpoint on the Flask app seems to prohibit it.

My first train of thought was SSTI because we were using Flask. I looked into Jinja2 SSTI payloads, but none worked. I then considered SQL injection, but everything used prepared statements, so that was also a no-go. Then I began digging a bit deeper into the code, and saw something interesting:

```python
# File: /flask/authorized_routes.py
@authorized.route('/signup', methods=['POST'])
def signup_post():
    raw_request = request.get_data()
    ...
    requests.post(f"http://{PHP_HOST}:1337/account_migrator.php", 
        headers={"token": TOKEN, "content-type": request.headers.get("content-type")}, data=raw_request)
    return redirect(url_for('authorized.login'))
```

It's a little bit odd that the raw request is being sent in the POST to the account migrator and not a payload like

```json
{
    "username": "Landon",
    "password": "password",
    "tier": "blue"
}
```

Odd behavior is usually a great starting point and this required me to do a bit of testing and research. I tried a couple of funky parameter things using Burpsuite, like `?tier[]=blue&tier=gold` hoping that maybe be able to pass the check and then populate as gold, but this just threw internal server errors. However, as I was researching passing arrays as parameters, I found [this Stackoverflow post]([https://stackoverflow.com/questions/6243051/how-to-pass-an-array-within-a-query-string](https://stackoverflow.com/questions/6243051/how-to-pass-an-array-within-a-query-string)). Specifically,

> `?cars=Saab&cars=Audi` _(Bad way- PHP will only register last value)_

Interesting, so PHP reads the last value if there are duplicate keys. How does Flask handle duplicate keys? It retrieves the first value! This is known as [HTTP Parameter Pollution](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/04-Testing_for_HTTP_Parameter_Pollution). So now, let's try the following request:

```
POST username=Landon&password=password&tier=blue&tier=gold
```

When Flask receives this request, tier=blue, so the check validates. However, because it sends the raw request, the entire "username=Landon&password=password&tier=blue&tier=gold" gets sent to account_migrator.php. And as we found out, PHP will get the last value, so tier=gold when PHP creates the account. All we have to do is login to the newly created account to receive the flag.