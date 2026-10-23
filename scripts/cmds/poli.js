const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "poli",
    author: "Saan",
    version: "1.7",
    cooldowns: 10,
    role: 0,
    category: "Image gen",
    guide: {
      en: "{p}poli <prompt>"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    if (args.length === 0) {
      return api.sendMessage("❌ | Please provide a prompt.", event.threadID, event.messageID);
    }

    const prompt = args.join(" ");
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    api.sendMessage("𝐖𝐚𝐢𝐭 𝐤𝐨𝐫𝐨 𝐣𝐚𝐧 <😘", event.threadID, event.messageID);

    try {
      const styles = ["ultra detailed", "4k resolution", "realistic lighting", "artstation", "digital painting"];
      const imagePaths = [];

      for (let i = 0; i < 4; i++) {
        const enhancedPrompt = `${prompt}, ${styles[i % styles.length]}`;

        const response = await axios.post(`${await baseApiUrl()}/api/poli/generate`, {
          prompt: enhancedPrompt
        }, {
          responseType: "arraybuffer",
          headers: {
            "author": module.exports.config.author
          }
        });

        const filePath = path.join(cacheDir, `generated_${Date.now()}_${i}.png`);
        fs.writeFileSync(filePath, response.data);
        imagePaths.push(filePath);
      }

      const attachments = imagePaths.map(p => fs.createReadStream(p));
      message.reply({
        body: "✅ | Here are images generated from your prompt:",
        attachment: attachments
      });

    } catch (error) {
      console.error("Image generation error:", error);
      message.reply("❌ | Couldn't generate images. Try again later.");
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
