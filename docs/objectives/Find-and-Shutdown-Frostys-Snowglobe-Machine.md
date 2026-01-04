---
icon: material/text-box-outline
---

# Find and Shutdown Frostys Snowglobe Machine


![Find and Shutdown Frostys Snowglobe Machine](../img/objectives/Find_and_Shutdown_Frostys_Snowglobe_Machine/img_0.png)

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
Outside the datacenter we see white and black blocks/markings.<br/>
![Find and Shutdown Frostys Snowglobe Machine](../img/objectives/Find_and_Shutdown_Frostys_Snowglobe_Machine/img_1.png)<br/>

We use 0 for black and 1 for white. <br/>

black  0 <br/>
white  1 <br/>

We get the below for each row on the wall : <br/>

- 011010011 
- 01101101
- 01100001
- 01101110
- 01101111
- 010010111

<br/>

We convert binary to decimal to  ASCII. <br/>

| Binary      |  Decimal  | ASCII     |
| :---------- | :-------- | :-------- |
| 01101001    | 105       |   i       |
| 01101101    | 109       |   m       |
| 01100001    | 97        |   a       |
| 01101110    | 110       |   n       |
| 01101111    | 111       |   o       |
| 01001011    | 75        |   k       |

Combining the above characters as "imanok". <br/>
This is inverse of "konami". <br/>

[Konami Code](https://en.wikipedia.org/wiki/Konami_Code) is a famous cheat code from video-game history that unlocks special features—like extra lives, power-ups, or secret modes—when entered in a specific button sequence. <br/>

konami code is: <br>
``` 
Up, Up, Down, Down, Left, Right, Left, Right, B, A
```

We have "imanok", so for use the direction would be inverse: <br/>
```
A, B, Right, Left,Right, Left,Down, Down, Up, Up
```


!!! success "Answer"
    Completed in the game.

## Response
!!! quote "Goose James"
    You found the permanent assignments! CLUCK! <br/>
    See, I'm not crazy - the security really WAS misconfigured. Now maybe I can finally get some peace and quiet...
