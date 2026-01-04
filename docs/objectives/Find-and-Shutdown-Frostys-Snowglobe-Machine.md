---
icon: material/text-box-outline
---

# Find and Shutdown Frostys Snowglobe Machine


![Owner](../img/objectives/Owner/Owner_0.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star:<br/>


## Objective

!!! question "Request"
   You've heard murmurings around the city about a wise, elderly gnome having a change of heart. <br/>
   He must have information about where Frosty's Snowglobe Machine is.<br/> 
   You should find and talk to the gnome so you can get some help with how to make your way through the Data Center's labrynthian halls.<br/>

    Once you find the Snowglobe Machine, figure out how to shut it down and melt Frosty's cold, nefarious plans.

??? quote "Elder Gnome"
    A change of heart, I have had, yes. Among the gnomes plotting to freeze the neighborhood, I once was. Wrong, we are. Help you now, I shall.<br/>
    The route to the old secret lab inside the Data Center, begins on the far East wing inside the building, it does. Pitch dark, the hallways leading to it probably are, hmm.<br/>
    A code outside the building, the employees who once worked there left, yes. A reminder of the route, it serves. Search in the vicinity of the Data Center for this code, perhaps you can.<br/>

## Solution
    black  0
    white  1

    
    011010011
    01101101
    01100001
    01101110
    01101111
    010010111

    Step 2: Convert binary → ASCII
    01101001  → 105 → 'i'
    01101101  → 109 → 'm'
    01100001  →  97 → 'a'
    01101110  → 110 → 'n'
    01101111  → 111 → 'o'
    01001011  →  75 → 'K'

    konami code is 
    Up, Up, Down, Down, Left, Right, Left, Right, B, A

    We have imanok, so for use teh direction would be
    B, A, B, Right, Left,Right, Left,Down, Down, Up, Up
### Goal 1
```
az account list --query "[].name"
```
![Owner](../img/objectives/Owner/Owner_1.png)

### Goal 2
You can do some more advanced queries using conditional filtering with custom output. <br/>
$ az account list --query "[?state=='Enabled'].{Name:name, ID:id}"<br/>
Cool! 😎  [?condition] filters what you want, {custom:fields} makes clean output ✨<br/>

```
az account list --query "[?state=='Enabled'].{Name:name, ID:id}"
```

![Owner](../img/objectives/Owner/Owner_2.png)


### Goal 3
Let's take a look at the Owner's of the first listed subscription 🔍. Pass in the first subscription id. <br>
Try: az role assignment list --scope "/subscriptions/{ID of first Subscription}" --query [?roleDefinition=='Owner'] <br>

```
az role assignment list --scope "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64" --query [?roleDefinition=='Owner']
```
![Owner](../img/objectives/Owner/Owner_3.png)

### Goal 4
Ok 🤔 — there is a group present for the Owners permission; however, we've been assured this is a 🔐 PIM enabled group.<br/>
Currently, no PIM activations are present. 🚨<br/>
Let's run the previous command against the other subscriptions to see what we come up with.


This below subscription has a group which is not PIM-Owner. Rather, there is a group named "IT-Admins"

```
az role assignment list --scope "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617" --query [?roleDefinition=='Owner']
```
![Owner](../img/objectives/Owner/Owner_5.png)



### Goal 4
Looks like you are on to something here! 🕵️  We were assured that only the 🔐 PIM group was present for each subscription.<br/>
🔎 Let's figure out the membership of that group.<br/>
Hint: use the az ad member list command. Pass the group id instead of the name.<br/>
Remember: | less lets you scroll through long output

```
az ad member list --group "6b982f2f-78a0-44a8-b915-79240b2b4796"
```
![Owner](../img/objectives/Owner/Owner_7.png)

### Goal 5
Well 😤, that's annoying. Looks like we have a nested group! <br/>
Let's run the command one more time against this group.<br/>

```
az ad member list --group "631ebd3f-39f9-4492-a780-aef2aec8c94e"
```
![Owner](../img/objectives/Owner/Owner_8.png)

### Goal 6
elevated access instead of permanent assignments. <br/>
Permanent Owner roles create persistent attack paths and violate least-privilege principles.<br/>
Challenge Complete! To finish, type: finish

```
finish
```

This completes the challenge.<br/>
![Owner](../img/objectives/Owner/Owner_8.png)

!!! success "Answer"
    Completed in the game.

## Response
!!! quote "Goose James"
    You found the permanent assignments! CLUCK! <br/>
    See, I'm not crazy - the security really WAS misconfigured. Now maybe I can finally get some peace and quiet...
