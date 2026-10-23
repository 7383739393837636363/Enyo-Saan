const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "marry",
                aliases: ["biye"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Generate a marriage image by mentioning someone",
                        vi: "Tạo hình ảnh kết hôn bằng cách gắn thẻ ai đó"
                },
                category: "love",
                guide: {
                        en: '   {pn} <@tag>: Tag someone to marry',
                        vi: '   {pn} <@tag>: Gắn thẻ ai đó để kết hôn'
                }
        },

        langs: {
                en: {
                        noTarget: "× Baby, please mention someone to marry! 💍",
                        success: "Here’s your marriage image baby! 🙈",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noTarget: "× Cưng ơi, hãy gắn thẻ ai đó để kết hôn đi! 💍",
                        success: "Ảnh kết hôn của cưng đây! 🙈",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const mentions = Object.keys(event.mentions);
                if (mentions.length === 0) return message.reply(getLang("noTarget"));

                const senderID = event.senderID;
                const targetID = mentions[0];
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                const imgPath = path.join(cacheDir, `marry_${senderID}_${targetID}.png`);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const response = await axios.post(`${await baseApiUrl()}/api/marry`, 
                                { senderID, targetID }, 
                                { responseType: "arraybuffer" }
                        );

                        fs.writeFileSync(imgPath, Buffer.from(response.data));

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(imgPath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });

                } catch (err) {
                        console.error("Marry Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        return message.reply(getLang("error", err.message));
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
