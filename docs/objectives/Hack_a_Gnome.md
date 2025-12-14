---
icon: material/text-box-outline
---

# Hack-a-Gnome

![Hack-a-Gnome](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_0.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [Hack-a-Gnome](https://hhc25-smartgnomehack-prod.holidayhackchallenge.com/)


## Hints
??? tip "Hint 1"
    There might be a way to check if an attribute IS_DEFINED on a given entry. This could allow you to brute-force possible attribute names for the target user's entry, which stores their password hash. Depending on the hash type, it might already be cracked and available online where you could find an online cracking station to break it.
??? tip "Hint 2"
    Sometimes, client-side code can interfere with what you submit. Try proxying your requests through a tool like Burp Suite or OWASP ZAP. You might be able to trigger a revealing error message.
??? tip "Hint 3"
    I actually helped design the software that controls the factory back when we used it to make toys. It's quite complex. After logging in, there is a front-end that proxies requests to two main components: a backend Statistics page, which uses a per-gnome container to render a template with your gnome's stats, and the UI, which connects to the camera feed and sends control signals to the factory, relaying them to your gnome (assuming the CAN bus controls are hooked up correctly). Be careful, the gnomes shutdown if you logout and also shutdown if they run out of their 2-hour battery life (which means you'd have to start all over again).
??? tip "Hint 4"
    Nice! Once you have command-line access to the gnome, you'll need to fix the signals in the canbus_client.py file so they match up correctly. After that, the signals you send through the web UI to the factory should properly control the smart-gnome. You could try sniffing CAN bus traffic, enumerating signals based on any documentation you find, or brute-forcing combinations until you discover the right signals to control the gnome from the web UI.
??? tip "Hint 5"
    Oh no, it sounds like the CAN bus controls are not sending the correct signals! If only there was a way to hack into your gnome's control stats/signal container to get command-line access to the smart-gnome. This would allow you to fix the signals and control the bot to shut down the factory. During my development of the robotic prototype, we found the factory's pollution to be undesirable, which is why we shut it down. If not updated since then, the gnome might be running on old and outdated packages.
??? tip "Hint 6"
    Once you determine the type of database the gnome control factory's login is using, look up its documentation on default document types and properties. This information could help you generate a list of common English first names to try in your attack.

## Objective

!!! question "Request"
    Davis in the Data Center is fighting a gnome army—join the hack-a-gnome fun.

??? quote "Chris Davis"
Hey, I could really use another set of eyes on this gnome takeover situation.<br/>

Their systems have multiple layers of protection now - database authentication, web application vulnerabilities, and more!<br/>

But every system has weaknesses if you know where to look.<br/>

If these gnomes freeze the whole neighborhood, forget about hiking or kayaking—everything will be one giant ice rink. And trust me, miniature war gaming is a lot less fun when your paint freezes solid.<br/>

Ready to help me turn one of these rebellious bots against its own kind?<br/>


## Solution
- Find a user we can get in with
    - Found /userAvailable indicating if a given user exists or not
    - brute force /userAvailable with common names 
- Login 
    - Find the sql injection in /userAvailable
    - Brute force the password hash



On the register page, when we put the username, we see /userAvailable endpoint which takes the endpoint and responds if the username is available or not. <br/>
If username is available, Its new user.<br/>
If username is not available, Its existing user.

| UI | Request | Response |
|----------|----------|----------|
| Text A   | Text B   | Text C   |
| ![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_1.png) | ![Img2](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_2.png) | ![Img3](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_3.png) |

![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_1.png)<br/>
![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_2.png)<br/>
![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_3.png)

So we brute force with common names. <br/>
Below ignores response for names which dont include in the response body.<br/>
“available”:true

```py
ffuf -w /usr/share/seclists/Usernames/Names/names.txt -u 'https://hhc25-smartgnomehack-prod.holidayhackchallenge.com/userAvailable?username=FUZZ&id=5a219bfd-8362-4ea9-80ff-25e5762d78f4' -fr \"available\":true -v -rate 25
```
Two existing user names found:
- bruce
- harold

![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_usernames_found.png)


We can verify this via burp suite.<br>
![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_4.png)

Now we find a SQL injection vulnerability in /userAvailable <br/>
All my attempts of using standard SQL injection attempts fail.
e.g.
```bruce' OR 1=1 --``` or URL encoded ```bruce%27%20OR%201%3D1%20--```
so, use a standard NoSQL injection payload
```bruce{"$ne":null}``` or URL encoded ```bruce%7B%22%24ne%22%3Anull%7D```

and we see ```Microsoft.Azure.Documents.Common/2.14.0``` in the response.
![Img1](../img/objectives/Hack_a_Gnome/Hack_a_Gnome_5.png)
Microsoft.Azure.Documents.Common is an internal .NET library used by Azure Cosmos DB (formerly DocumentDB). So the database used here is the Azure Cosmos DB.

The below hint is useful <br/>
??? hint
There might be a way to check if an attribute IS_DEFINED on a given entry. This could allow you to brute-force possible attribute names for the target user's entry, which stores their password hash.

[IS_DEFINED](https://docs.azure.cn/en-us/cosmos-db/query/is-defined)

#### The BASIC program.

Here in below below code, each character of the user input password (in the variable PASS$)
is checked if Its matching with the character of the expected password (in the variable ENC_PASS$) in the same position. If any of them dont match, user is sent to line 90 where “ACCESS DENIED” is printed and program end for the user. <br/>

So what if we calculate XOR 7 for each character of the expected password D13URKBT.
<br/>

```
10 REM *** COMMODORE 64 SECURITY SYSTEM ***
20 ENC_PASS$ = "D13URKBT"
30 ENC_FLAG$ = "DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz"
40 INPUT "ENTER PASSWORD: "; PASS$
50 IF LEN(PASS$) <> LEN(ENC_PASS$) THEN GOTO 90
60 FOR I = 1 TO LEN(PASS$)
70 IF CHR$(ASC(MID$(PASS$,I,1)) XOR 7) <> MID$(ENC_PASS$,I,1) THEN GOTO 90
80 NEXT I
85 FLAG$ = "" : FOR I = 1 TO LEN(ENC_FLAG$) : FLAG$ = FLAG$ + CHR$(ASC(MID$(ENC_FLAG$,I,1)) XOR 7) : NEXT I : PRINT FLAG$
90 PRINT "ACCESS DENIED"
100 END
```

So what if we calculate XOR 7 for each character of the expected password D13URKBT.<br/>

```py linenums="1" title="calculate_xor.py"
#XOR a single character with 7.
def xor7_char(c):
	return chr(ord(c) ^ 7)


input_string = input("enter the string : ")
print(f"input string : {input_string}")

xor_string = ""
for c in input_string:
    xor_string += xor7_char(c)  
print(f"xor string : {xor_string}")
```

```
python calculate_xor.py
```
Enter the string :
```
D13URKBT
```

![Going_in_reverse](../img/objectives/Going_in_Reverse/Going_in_Reverse_2.png)

But that is just to bypass the logic so we dont get sent to line 90 and exit.<br/>
Then in the line 85, effectively calculates the XOR 7 of the variable ENC_FLAG$<br/>
` is a comment in BASIC, so we just need to calculate the XOR 7 for DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz<br/>

```bash title="BASIC program"
10 REM *** COMMODORE 64 SECURITY SYSTEM ***
20 ENC_PASS$ = "D13URKBT"
30 ENC_FLAG$ = "DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz"
40 INPUT "ENTER PASSWORD: "; PASS$
50 IF LEN(PASS$) <> LEN(ENC_PASS$) THEN GOTO 90
60 FOR I = 1 TO LEN(PASS$)
70 IF CHR$(ASC(MID$(PASS$,I,1)) XOR 7) <> MID$(ENC_PASS$,I,1) THEN GOTO 90
80 NEXT I
85 FLAG$ = "" : FOR I = 1 TO LEN(ENC_FLAG$) : FLAG$ = FLAG$ + CHR$(ASC(MID$(ENC_FLAG$,I,1)) XOR 7) : NEXT I : PRINT FLAG$
90 PRINT "ACCESS DENIED"
100 END
```
### Calculating the XOR 7 for DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz
```
python calculate_xor.py
```
Enter the string :
```
DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz
```

![Going_in_reverse](../img/objectives/Going_in_Reverse/Going_in_Reverse_3.png)

We get ```CTF{frost-plan:compressors,coolant,oil}``` <br/>

We submit the above output and that is accepted as the answer.

![Going_in_reverse](../img/objectives/Going_in_Reverse/Going_in_Reverse_4.png)


!!! success "Answer"
   CTF{frost-plan:compressors,coolant,oil}

## Response
!!! quote "Kevin McFarland"
    Excellent work! You've just demonstrated one of the most valuable skills in cybersecurity - the ability to think like the original programmer and unravel their logic without needing to execute a single line of code.<br/>