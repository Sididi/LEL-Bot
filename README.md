# LEL-Bot

### Discord Bot made for the LEL Event (League of Legends EPITECH LAN)

It allows you to run a bot which manages the registered teams for the event. It handles:
- Dynamic synchronization of the teams on Google Sheets
- Automatic creation of teams with commands (!captain / !player)
- Automatic handling of roles (Captain / Player / New role for the team)
- Automatic handling of Team permissions (w/ automatic channel creation)

-Made in discord.js-

### To use it

Create a config.json file at the root of the repository and fill it with these informations

```json
{ 
  "token": "botToken",
  "sheetsApiKey": "Google Sheet's API KEY",
  "prefix": "Bot's command prefix",
  "debug": false
}
```

You can change the value of debug depending on whether you want to run the bot in a debug channel or in the official one.  
Afterwards, change all the Ids for the roles/channels in index.js as they are hard-coded for the LEL#1 Server

Then run `npm i && node index.js`
