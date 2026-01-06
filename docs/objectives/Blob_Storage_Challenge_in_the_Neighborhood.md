---
icon: material/text-box-outline
---

# Blob Storage Challenge in the Neighborhood
![Neighborhood Watch Bypass](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_1.png){ width="500" height="350" }

**Difficulty**: :fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [Blob Storage Challenge in the Neighborhood](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termMSBlobstorage){:target="_blank" rel="noopener"}<br/>
**Area**: Near the pond<br/> 
**In-game avatar**: Goose Grace

## Objective

!!! question "Request"
    Help the Goose Grace near the pond find which Azure Storage account has been misconfigured to allow public blob access by analyzing the export file.

??? quote "Goose Grace"
    HONK!!! HONK!!!!
    The Neighborhood HOA uses Azure storage accounts for various IT operations.
    You've been asked to audit their storage security configuration to ensure no sensitive data is publicly accessible.
    Recent security reports suggest some storage accounts might have public blob access enabled, creating potential data exposure risks.

## High-Level Steps

1. **Enumerate** – List Azure storage accounts and review configuration.
2. **Identify** – Find storage accounts with public blob access enabled.
3. **Validate** – Access exposed blobs to confirm data exposure.

```mermaid
flowchart TD

  subgraph Row1["Enumerate"]
    direction LR
    A[List storage accounts]
    B[Review account settings]
    A --> B
  end

  subgraph Row2["Identify"]
    direction LR
    C[Detect public blob access]
    D[List containers and blobs]
    C --> D
  end

  subgraph Row3["Validate"]
    direction LR
    E[Download public blob]
    F[Confirm sensitive data exposure]
    G[Objective completed]
    E --> F --> G
  end

  Row1 --> Row2
  Row2 --> Row3
```

## Solution

### Goal 1 :
You may not know this but the Azure cli help messages are very easy to access. <br/>
First, try typing:
```
az help | less
```

![az help | less](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_2.png)

### Goal 2 :
Next, you've already been configured with credentials. 🔑
```
az account show | less
```
Pipe the output to | less so you can scroll.<br/>
Press 'q' to exit less.<br/>

![az account show | less](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_3.png)


### Goal 3 :
Now that you've run a few commands, Let's take a look at some Azure storage accounts.<br/>
Try: az storage account list | less <br/>
For more information:<br/>
https://learn.microsoft.com/en-us/cli/azure/storage/account?view=azure-cli-latest

```
az storage account list | less
```
![az storage account list | less](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_4.png)

### Goal 4 :
hmm... one of these looks suspicious 🚨, i think there may be a misconfiguration here somewhere.
Try showing the account that has a common misconfiguration: az storage account show --name xxxxxxxxxx | less

```
az storage account show --name neighborhood2 | less
```
The storage account named "neighborhood2" as "allowBlobPublicAccess" as true.

![az storage account list | less](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_5.png)

### Goal 5 :
Now we need to list containers in neighborhood2. After running the command what's interesting in the list?<br/>
For more information:<br/>
https://learn.microsoft.com/en-us/cli/azure/storage/container?view=azure-cli-latest#az-storage-container-list

```
az storage container list --account-name neighborhood2
```

![az storage container lists](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_6.png)

### Goal 6
Let's take a look at the blob list in the public container for neighborhood2.<br/>
For more information:
https://learn.microsoft.com/en-us/cli/azure/storage/blob?view=azure-cli-latest#az-storage-blob-list

```
az storage blob list --container-name public --account-name neighborhood2
```

![az storage blob list](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_7.png)


### Goal 7
Try downloading and viewing the blob file named admin_credentials.txt from the public container.<br/>
💡 hint: --file /dev/stdout should print in the terminal. Dont forget to use | less!
```
az storage blob download --container-name public --account-name neighborhood2 --name admin_credentials.txt --file /dev/stdout
```
![az storage blob download](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_8.png)


### Goal 8
Type finish to complete the objective

![finish](../img/objectives/Blob_Storage_Challenge_in_the_Neighborhood/Blob_Storage_Challenge_in_the_Neighborhood_9.png)


!!! success "Answer"
    Completed in the game.

## Response

!!! quote "Goose Grace"
   HONK HONK HONK! 'No sensitive data publicly accessible' they claimed. Meanwhile, literally everything was public! Good save, security expert!


## Learnings
1. A single configuration flag (`allowBlobPublicAccess` in this case) can completely change the security posture of a cloud service, even when everything else appears normal.
1. Enumerating cloud resources methodically made it clear how easy it is for sensitive data to become public without anyone actively exposing it.

## Prevention & Hardening Notes
1. Disable public blob access at the storage account level unless there is a clear and documented business requirement.
1. Regularly audit storage accounts and containers for public access and monitor for sensitive files being placed in publicly accessible locations.
