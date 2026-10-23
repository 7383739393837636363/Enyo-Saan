const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "cat",
    version: "1.7",
    author: "Saan",
    countDown: 10,
    role: 0,
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api }) {
    try {
      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/api/catimg/random-cats`);
      const images = res.data?.images;
      
      if (!images || images.length === 0) 
        return message.reply("No cat images found from API.");

      const attachments = await Promise.all(images.map(url => getStreamFromURL(url)));
      
      await api.sendMessage({
        body: "🐱 | | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐜𝐚𝐭 𝐢𝐦𝐚𝐠𝐞𝐬",
        attachment: attachments
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      message.reply("An error occurred while fetching cat images.");
    }

    async function getStreamFromURL(url) {
      const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      return response.data;
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
