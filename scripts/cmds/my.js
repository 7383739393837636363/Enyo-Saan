const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
 * @author Saan
 * @author: do not delete it
 */

module.exports = {
  config: {
    name: "my",
    version: "1.7",
    author: "Saan",
    category: "love",
    guide:
      "{pn} boy @tag | {pn} girl @tag | {pn} queen @tag | {pn} king @tag | {pn} bf @tag | {pn} gf @tag | {pn} list"
  },

  onStart: async function ({ api, usersData, event, args }) {
    const obfuscated = "Saan"; if (module.exports.config.author !== obfuscated) {
    return api.sendMessage("You are not authorized to change the author name.", event.threadID);
  }

    const senderID = event.senderID;const type = (args[0] || "").toLowerCase();
    if (type === "list") {
    return api.sendMessage(
        `#boy use:
         • my gf
         • my girl
         • my queen
 
        #girl use:
        • my bf
        • my boy
        • my king`,
        event.threadID,
        event.messageID
      );
    }

    if (!["boy", "girl", "bf", "gf", "king", "queen"].includes(type)) {
      return api.sendMessage("Use: my boy/girl/queen/king/bf/gf @tag | reply | uid\nUse: my list", event.threadID, event.messageID ); }
      const mention = Object.keys(event.mentions)[0];
      let target = mention || (event.messageReply && event.messageReply.senderID) || (args[1] && /^\d+$/.test(args[1]) ? args[1] : null);if (!target)
      return api.sendMessage("Tag, reply, or give UID.", event.threadID, event.messageID);

    const captionText = {
      boy: "𝐓𝐇𝐀𝐓'𝐒 𝐌𝐘 𝐁𝐎𝐘 🖤",
      girl: "𝐓𝐇𝐀𝐓'𝐒 𝐌𝐘 𝐆𝐈𝐑𝐋 🖤",
      bf: "𝐌𝐲 𝐁𝐨𝐲𝐟𝐫𝐢𝐞𝐧𝐝 💙",
      gf: "𝐌𝐲 𝐆𝐢𝐫𝐥𝐟𝐫𝐢𝐞𝐧𝐝 ❤️",
      king: "𝐊𝐢𝐧𝐠 𝐨𝐟 𝐦𝐲 𝐡𝐞𝐚𝐫𝐭 👑",
      queen: "𝐐𝐮𝐞𝐞𝐧 𝐨𝐟 𝐦𝐲 𝐡𝐞𝐚𝐫𝐭 👸"
    };

    if (["boy", "girl", "bf", "gf", "king", "queen"].includes(type)) {
       let user1, user2;
   
       if (type === "boy" || type === "bf" || type === "king") { user1 = target; user2 = senderID;  }
       if (type === "girl" || type === "gf" || type === "queen") { user1 = senderID; user2 = target;
      }

      try {
        const info1 = await usersData.get(user1);
        const info2 = await usersData.get(user2);
        const apiUrl = await baseApiUrl();
       
        let apiLink;
        if (type === "boy" || type === "girl") {
        apiLink = `${apiUrl}/api/myboy?user1=${user1}&user2=${user2}`;
        } else {
        apiLink = `${apiUrl}/api/pair?user1=${user1}&user2=${user2}&style=${
        type === "king" || type === "queen" ? 26 : 40 }`;
       }

        const { data } = await axios.get(apiLink, { responseType: "arraybuffer"});
        const file = path.join(__dirname,`cache/my_${type}_${user1}_${user2}.png` );fs.writeFileSync(file, Buffer.from(data));
        const messageBody = `${captionText[type]}\n• ${info1.name}\n• ${info2.name}`;

        api.sendMessage(
          {
            body: messageBody,
            attachment: fs.createReadStream(file)
          },
          event.threadID,
          () => fs.unlinkSync(file),
          event.messageID
        );
      } catch (err) {
        api.sendMessage("🥹error, contact SAAN. " + err.message, event.threadID);
      }
    }
  }
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
