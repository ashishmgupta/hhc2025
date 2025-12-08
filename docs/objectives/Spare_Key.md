---
icon: material/text-box-outline
---

# Spare Key
![Spare key](../img/objectives/Spare_Key/Spare_Key_1.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star::fontawesome-regular-star:<br/>
**Direct link**: [Spare Key](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termMSSpareKey)

## Objective

!!! question "Request"
    Help Goose Barry near the pond identify which identity has been granted excessive Owner permissions at the subscription level, violating the principle of least privilege.

??? quote "Goose Barry"
    You want me to say what exactly? Do I really look like someone who says MOOO?
    The Neighborhood HOA hosts a static website on Azure Storage.
    An admin accidentally uploaded an infrastructure config file that contains a long-lived SAS token.
    Use Azure CLI to find the leak and report exactly where it lives.

## Solution
### Goal 1
Let's start by listing all resource groups. <br/>
$ az group list -o table<br/>
This will show all resource groups in a readable table format.

```
az group list -o table
```

![Spare key](../img/objectives/Spare_Key/Spare_Key_2.png)

### Goal 2
az storage account list --resource-group rg-the-neighborhood -o table <br/>
This shows what storage accounts exist and their types.<br/>

```
 az storage account list --resource-group rg-the-neighborhood -o table
```
 
![Spare key](../img/objectives/Spare_Key/Spare_Key_3.png)


### Goal 3
Someone mentioned there was a website in here.<br/>
maybe a static website?<br/>
try:$ az storage blob service-properties show --account-name <insert_account_name> --auth-mode login<br/>


```
az storage blob service-properties show --account-name neighborhoodhoa --auth-mode login
```

![Spare key](../img/objectives/Spare_Key/Spare_Key_4.png)


### Goal 4
Let's see what 📦 containers exist in the storage account.<br/>
💡 Hint: You will need to use az storage container list.<br/>
We want to list the container and its public access levels.
```
az storage container list --account-name neighborhoodhoa --auth-mode login
```
![Spare key](../img/objectives/Spare_Key/Spare_Key_5.png)


### Goal 5
Examine what files are in the static website container<br/>
💡 hint: when using --container-name you might need '<name>'<br/>
Look 👀 for any files that shouldn't be publicly accessible!<br/>

Looking at the the container named "public"
```
az storage blob list --account-name neighborhoodhoa --auth-mode login --container-name public
```
![Spare key](../img/objectives/Spare_Key/Spare_Key_6.png)

Looking at the the container named "$web"
```
az storage blob list --account-name neighborhoodhoa --auth-mode login --container-name '$web' --output table
```
![Spare key](../img/objectives/Spare_Key/Spare_Key_7.png)

### Goal 6
Take a look at the files here, what stands out?<br/>
Try examining a suspect file 🕵️:<br/>
💡 hint: --file /dev/stdout | less will print to your terminal 💻.<br/>

```
az storage blob download --account-name neighborhoodhoa --auth-mode login --container-name '$web' --name iac/terraform.tfvars --file tfvars.txt --debug
```

![Spare key](../img/objectives/Spare_Key/Spare_Key_8.png)

### Goal 7
⚠️   Accidentally uploading config files to $web can leak secrets. 🔐 <br/>
Challenge Complete! To finish, type: finish
![Spare key](../img/objectives/Spare_Key/Spare_Key_9.png)

!!! success "Answer"
    Completed in the game.

## Response

!!! quote "Goose Barry"
    There it is. A SAS token with read-write-delete permissions, publicly accessible. <br/>At least someone around here knows how to do a proper security audit.
