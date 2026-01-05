---
icon: material/text-box-outline
---

# Santa's Gift-Tracking Service Port Mystery

![Santa's Gift-Tracking Service Port Mystery](../img/objectives/Santa_Gift-Tracking_Service_Port_Mystery/Santa_Gift-Tracking_Service_Port_Mystery_1.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star:<br/>

**Direct link**: [Objective 1 terminal](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termGiftTracking){:target="_blank" rel="noopener"}

## Objective

!!! question "Request"
   Chat with Yori near the apartment building about Santa's mysterious gift tracker and unravel the holiday mystery.

??? quote "Yori Kvitchko"
    I was Ed's lost intern back in 2015, but I was found!<br/>
    Think you can check out this terminal for me? I need to use cURL to access the gift tracker system, but it has me stumped.<br/>
    Please see what you can do!<br/>

## High-Level Steps

1. **Recon** – Enumerate listening ports and running services.
2. **Discovery** – Review documentation to identify the correct service access method.
3. **Access** – Connect to the service port to complete the objective.

```mermaid
flowchart LR

  subgraph Recon
    A[Enumerate listening ports<br/>ss -tlnp]
  end

  subgraph Discovery
    B[Review README.txt<br/>and available tools]
  end

  subgraph Access
    C[Connect to service<br/>via telnet on port 12321]
    D[Objective completed]
  end

  A --> B --> C --> D
```


## Solution

Initial console

![Santa's Gift-Tracking Service Port Mystery](../img/objectives/Santa_Gift-Tracking_Service_Port_Mystery/Santa_Gift-Tracking_Service_Port_Mystery_2.png){ width="1200" height="950" }

Show all the TCP ports and the processes.
```
ss -tlnp
```

![Show all the TCP ports and the processes.](../img/objectives/Santa_Gift-Tracking_Service_Port_Mystery/Santa_Gift-Tracking_Service_Port_Mystery_3.png){ width="1200" height="950" }

There is a README.txt which shows all the executables at our disposal.

```
ls -lah
cat README.txt
```

![There is a README.txt which shows all the executables at our disposal.](../img/objectives/Santa_Gift-Tracking_Service_Port_Mystery/Santa_Gift-Tracking_Service_Port_Mystery_4.png){ width="1200" height="950" }


We use telnet to connect to port 12321.

```
telnet 127.0.0.1 12321
```

We could connect to the port and the objective is completed.<br/>
![There is a README.txt which shows all the executables at our disposal.](../img/objectives/Santa_Gift-Tracking_Service_Port_Mystery/Santa_Gift-Tracking_Service_Port_Mystery_5.png){ width="1200" height="950" }


!!! success "Answer"
    Solved in the game.

## Response

!!! quote "Yori Kvitchko"
    Great work - thank you!<br/>
    Geez, maybe you can be my intern now!<br/>
