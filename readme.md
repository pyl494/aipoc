
# Getting Started:

- Download node.js
- Run _init.bat
- Run _start.bat. This runs the node server locally.

Each time you make a change to the server, you need to manually close the previous instance of _start.bat and run _start.bat again.

Currently this code is set up with TypeScript, rather than JavaScript. This could potentially help us as a group in detecting minor issues that could consume a lot of debugging time.

So, make your changes to 'index.ts' and then when you run _start.bat, the changes will be built into the 'build directory'

---

# Connecting to the Atlassian Cloud:

This step is not necessary unless you want to see what the app looks like while connected to Atlassian Cloud.

- Read from step 2: 
https://developer.atlassian.com/cloud/jira/platform/getting-started/
- Run _connect.bat. This connects the node server to the internet.
- From the _connect.bat window, take the "https://<random>.ngrok.io" address
- In Atlassian cloud "Upload App", enter: "https://<random>.ngrok.io/static/atlassian-connect.json"

