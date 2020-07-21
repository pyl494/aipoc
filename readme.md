
# TODO:

[x] animate show features expand
[] style spider graph
[x] tooltips
[] accessability

# Getting Started:

- Download node.js
- Run _init.bat
- Run _start.bat. This runs the node server locally.

Each time you make a change to the server, you need to manually close the previous instance of _start.bat and run _start.bat again.

---

# Connecting to the Atlassian Cloud:

To test on Atlassian cloud, you need to take the following steps.

- Read from step 2: 
https://developer.atlassian.com/cloud/jira/platform/getting-started/
- Run _connect.bat. This connects the node server to the internet.
- From the _connect.bat window, take the "https://<random>.ngrok.io" address
- In Atlassian Cloud Jira "Upload App", enter: "https://<random>.ngrok.io/jira"

Changes to atlassian-connect.json will require a uninstall / re-uploading of the addon on Atlassian Cloud.

