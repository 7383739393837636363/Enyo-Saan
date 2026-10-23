const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "xlnub",
    version: "1.7",
    author: "Saan",
    countDown: 10,
    role: 0,
    category: "Image gen",
    guide: "{pn} [prompt]"
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt to generate an image.", event.threadID, event.messageID);

    try {
      const waitingMessage = await message.reply(`🔄| Generate, your image,, please wait...`);

      const apiUrl = await baseApiUrl();
      if (!apiUrl) return api.sendMessage("Base API URL could not be loaded.", event.threadID, event.messageID);

      const res = await axios.post(`${apiUrl}/api/xlnub`, { prompt });

      if (!res.data?.imageUrl) return api.sendMessage("Failed to generate image.", event.threadID, event.messageID);

      const imageStream = await global.utils.getStreamFromURL(res.data.imageUrl);

      setTimeout(() => {
        api.unsendMessage(waitingMessage.messageID);
      }, 1000);

      const messageSent = await api.sendMessage({
        body: "✅ | Here's is your image",
        attachment: imageStream
      }, event.threadID, event.messageID);

      api.setMessageReaction("🪽", messageSent.messageID, () => {}, true);

    } catch (err) {
      return api.sendMessage("An error occurred while generating the image.", event.threadID, event.messageID);
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
