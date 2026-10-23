const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "4k",
                aliases: ["hd", "enhance", "upscale"],
                version: "3.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Enhance or restore image quality to 4K using AI",
                        vi: "Nâng cao chất lượng hình ảnh lên 4K bằng AI"
                },
                category: "tools",
                guide: {
                        en: '   {pn} [url]: Upscale image via URL' +
                                '\n   {pn} [reply]: Reply to an image to upscale',
                        vi: '   {pn} [url]: Nâng cấp ảnh qua URL' +
                                '\n   {pn} [reply]: Phản hồi ảnh để nâng cấp'
                }
        },

        langs: {
                en: {
                        noImage: "• Baby, please reply to an image or provide a link.",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noImage: "• Cưng ơi, hãy phản hồi một bức ảnh hoặc gửi link.",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮'𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× Lỗi: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let imgUrl;
                if (event.messageReply?.attachments?.[0]?.type === "photo") {
                        imgUrl = event.messageReply.attachments[0].url;
                } else if (args[0]) {
                        imgUrl = args.join(" ");
                }

                if (!imgUrl) return api.sendMessage(getLang("noImage"), event.threadID, event.messageID);

                api.setMessageReaction("😘", event.messageID, () => {}, true);

                try {
                        const response = await axios.get(`${await baseApiUrl()}/api/enhance?imgUrl=${encodeURIComponent(imgUrl)}`, {
                                method: "GET",
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);

                        return api.sendMessage({
                                body: getLang("success"),
                                attachment: response.data
                        }, event.threadID, event.messageID);

                } catch (err) {
                        console.error("error", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
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
