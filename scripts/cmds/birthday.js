const axios = require("axios");

const mahmhd = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "birthday",
    aliases: ["wish"],
    version: "1.7",
    role: 0,
    author: "Saan",
    category: "love",
    countDown: 5,
    guide: { en: "{p}{n} @mention" },
  },

  onStart: async function ({ api, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) {
      return api.sendMessage("❌ You need to tag someone to wish!", event.threadID, event.messageID);
    }

    const taggedUserName = event.mentions[mention[0]].replace('@', '');

    try {
      const baseApi = await mahmhd();
      const apiUrl = `${baseApi}/api/wish/font3?taggedUserName=${encodeURIComponent(taggedUserName)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status === "success") {
        api.sendMessage(data.response, event.threadID, event.messageID);
      } else {
        api.sendMessage("❌ Failed to send the birthday wish. Please try again later.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage(`❌ Something went wrong: ${err.message}`, event.threadID, event.messageID);
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
