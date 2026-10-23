const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "time",
    version: "1.7",
    author: "Saan",
    countDown: 2,
    role: 0,
    category: "utility",
    guide: "{pn} [country] | {pn} list\n\nExamples:\n{pn} bangladesh\n{pn} london\n{pn} list"
  },

  onStart: async function ({ message, args }) {
    const country = args[0]?.toLowerCase() || "bangladesh";

   try {
    const baseUrl = await baseApiUrl();

    if (country === "list") {
    const listRes = await axios.get(`${baseUrl}/api/time/list`, {
    headers: { "author": module.exports.config.author }
        });

     return listRes.data.message
   ? message.reply(listRes.data.message)
   : message.reply("⚠️ Unable to fetch country list.");
    }

      const timeRes = await axios.get(`${baseUrl}/api/time/${country}`, {
      headers: { "author": module.exports.config.author }
    });

      return timeRes.data.message
    ? message.reply(timeRes.data.message)
    : message.reply("⚠️ Unable to fetch time.");
    } catch (error) {
      return message.reply("🥹error, contact SAAN.");
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
