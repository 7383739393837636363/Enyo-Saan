const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "draw",
    version: "1.7",
    author: "Saan",
    countDown: 5,
    role: 0,
    category: "image",
    guide: { en: "{p}draw [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = "Saan";
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ | You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "❌ | Example: draw cyberpunk samurai",
        event.threadID,
        event.messageID
      );
    }

    try {
      const apiUrl = await mahmud();
      const response = await axios.post(`${apiUrl}/api/draw`, { prompt });
      const attachment = await global.utils.getStreamFromURL(response.data.image);

      await api.sendMessage(
        { body: `🎨 | Prompt: ${prompt}`, attachment },
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error(error);
      api.sendMessage("🥹 Error, contact SAAN.", event.threadID, event.messageID);
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
