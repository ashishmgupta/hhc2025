---
icon: material/text-box-outline
---

# IDORable Bistro

![IDORable Bistro](../img/objectives/Dosis_Network_Down/Dosis_Network_Down_0.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [IDORable Bistro](https://dosis-network-down.holidayhackchallenge.com/)


## Hints
??? tip "Version"
   I can't believe nobody created a backup account on our main router...the only thing I can think of is to check the version number of the router to see if there are any...ways around it...
??? tip "UCI"
    You know...if my memory serves me correctly...there was a lot of fuss going on about a UCI (I forgot the exact term...) for that router.


## Objective

!!! question "Request"
   Drop by JJ's 24-7 for a network rescue and help restore the holiday cheer. <br/>
   What is the WiFi password found in the router's config?

??? quote "Janusz Jasinski"
Alright then. Those bloody gnomes 'ave proper messed about with the neighborhood's wifi - changed the admin password, probably mucked up all the settings, the lot.<br/>
Now I can't get online and it's doing me 'ead in, innit?<br/>
We own this router, so we're just takin' back what's ours, yeah?<br/>
You reckon you can 'elp me 'ack past whatever chaos these little blighters left be'ind?

## Solution
The challenge website notes the router firmware version and the hardware version at the bottom.
```
https://dosis-network-down.holidayhackchallenge.com/ 
```

![IDORable Bistro](../img/objectives/Dosis_Network_Down/Dosis_Network_Down_1.png)

TP-Link Archer AX21 (AX1800) firmware versions before 1.1.4 Build 20230219 contained a command injection vulnerability in the country form of the /cgi-bin/luci;stok=/locale endpoint on the web management interface. <br/>
Specifically, the country parameter of the write operation was not sanitized before being used in a call to popen(), allowing an unauthenticated attacker to inject commands, which would be run as root, with a simple POST request.<br/>
Ref : <br/>
[nvd.nist.gov](https://nvd.nist.gov/vuln/detail/cve-2023-1389 )<br/>



https://github.com/Voyag3r-Security/CVE-2023-1389/blob/main/archer-rev-shell.py


Browsing the above URL reveals the below API<br/>
```
https://its-idorable.holidayhackchallenge.com/api/receipt?id=103
```

Just going to the API URL shows the API output in JSON format.<br/>

![IDORable Bistro](../img/objectives/IDORable_Bistro/IDORable_Bistro_3.png)

Changing to a different receipt ID shows different output which proves the API has IDOR vulnerability. <br/>
```
https://its-idorable.holidayhackchallenge.com/api/receipt?id=104
```
![IDORable Bistro](../img/objectives/IDORable_Bistro/IDORable_Bistro_4.png)


Trying to fuzz the API url with the receipt id from 1 - 200 for “frozen” in the API response and we get a hit.<br/>

Below fuzzes the URL id from 1 to 200 looking for "frozen" in the part of response (because the hint notes that the gnome asked for the "frozen" sushi).<br/>
```
seq 1 200 | ffuf -w - -u "https://its-idorable.holidayhackchallenge.com/api/receipt?id=FUZZ" -mr "frozen"
```

We get a hit for receipt id 139.<br/>
![IDORable Bistro](../img/objectives/IDORable_Bistro/IDORable_Bistro_5.png)

Manually looking at the API response for receipt id 139.<br/>
```
https://its-idorable.holidayhackchallenge.com/api/receipt?id=139
```
![IDORable Bistro](../img/objectives/IDORable_Bistro/IDORable_Bistro_6.png)

We have the name : Bartholomew Quibblefrost


!!! success "Answer"
   Bartholomew Quibblefrost

## Response
!!! quote "Josh Wright"
    Excellent work! You've demonstrated textbook penetration testing skills across every challenge - your discipline and methodology are impeccable!.<br/>
