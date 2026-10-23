const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
const response = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return response.data.mahmud;
};

/**
* @author Saan
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "flower",
    version: "1.7",
    role: 0,
    author: "Saan",
    category: "media",
    guide: {
      en: "Use {pn} to get a random Flower video."
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const loadingMessage = await message.reply("🐤 | 𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗿𝗮𝗻𝗱𝗼𝗺 𝗙𝗹𝗼𝘄𝗲𝗿...𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..!!");

      setTimeout(() => {
        api.unsendMessage(loadingMessage.messageID);
      }, 5000);

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/album/mahmud/videos/flower?userID=${event.senderID}`);
      if (!res.data.success || !res.data.videos.length)
        return api.sendMessage("❌ | No videos found.", event.threadID, event.messageID);

      const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
      const filePath = path.join(__dirname, "temp_video.mp4");

      const video = await axios({
        url,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const writer = fs.createWriteStream(filePath);
      video.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐥𝐨𝐰𝐞𝐫 𝐯𝐢𝐝𝐞𝐨",
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", () => {
        api.sendMessage("❌ | Download error.", event.threadID, event.messageID);
      });
    } catch (e) {
      console.error("ERROR:", e);
      api.sendMessage("🥹error, contact SAAN.", event.threadID, event.messageID);
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
