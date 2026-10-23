const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "myking",
    version: "1.7",
    author: "Saan",
    category: "love",
    guide: "{pn} @mention | reply | UID",
  },

  onStart: async function ({ api, usersData, event, args }) {
   const obfuscatedAuthor = "Saan"; 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }
    const senderID = event.senderID;
    let target;

    const mention = Object.keys(event.mentions)[0];
    if (mention) target = mention;

    else if (event.messageReply) target = event.messageReply.senderID;

    else if (args[0] && /^\d+$/.test(args[0])) target = args[0];

    if (!target)
      return api.sendMessage(
        "❌ Mention, reply, or give UID to make someone your King!",
        event.threadID,
        event.messageID
      );

    const user1 = target;    
    const user2 = senderID;   

    const info1 = await usersData.get(user1);
    const info2 = await usersData.get(user2);

    const name1 = info1.name;
    const name2 = info2.name;

    try {
      const apiUrl = await baseApiUrl();
      const { data } = await axios.get(
        `${apiUrl}/api/pair?user1=${user1}&user2=${user2}&style=26`,
        { responseType: "arraybuffer" }
      );

      const file = path.join(__dirname, `myking_${senderID}.png`);
      fs.writeFileSync(file, Buffer.from(data));

      api.sendMessage(
        {
          body: `𝐊𝐢𝐧𝐠 𝐨𝐟 𝐦𝐲 𝐡𝐞𝐚𝐫𝐭, 𝐫𝐮𝐥𝐞𝐫 𝐨𝐟 𝐦𝐲 𝐰𝐨𝐫𝐥𝐝 👑\n• ${name1}\n• ${name2}`,
          attachment: fs.createReadStream(file),
        },
        event.threadID,
        () => fs.unlinkSync(file),
        event.messageID
      );
    } catch (err) {
      api.sendMessage("🥹error, contact SAAN." + err.message, event.threadID, event.messageID);
    }
  },
};

 
// Saan author protection
if (module.exports && module.exports.config) {
  Object.defineProperty(module.exports, "__saanAuthorProtectionInstalled", {
    value: true,
    enumerable: false
  });

  for (const hook of [
    "onStart", "onReply", "onChat", "onEvent",
    "onAnyEvent", "onFirstChat", "onLoad"
  ]) {
    const original = module.exports[hook];
    if (typeof original !== "function") continue;

    module.exports[hook] = function (...args) {
      if (module.exports.config.author !== "Saan") {
        const data = args[0] || {};
        const api = data.api;
        const event = data.event;

        if (api && event && event.threadID) {
          return api.sendMessage(
            "You are not authorized to change the author name.",
            event.threadID,
            event.messageID
          );
        }

        if (data.message && typeof data.message.reply === "function") {
          return data.message.reply("You are not authorized to change the author name.");
        }

        return;
      }

      return original.apply(this, args);
    };
  }
}
