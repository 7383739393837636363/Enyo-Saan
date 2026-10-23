const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "tikedit",
                version: "3.8",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search and download any edit video from TikTok",
                        vi: "Tìm kiếm và tải xuống bất kỳ video chỉnh sửa nào từ TikTok"
                },
                category: "media",
                guide: {
                        en: '   {pn} <keyword>: (Ex: {pn} naruto edit)',
                        vi: '   {pn} <từ khóa>: (VD: {pn} naruto edit)'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, please provide a search keyword! 🔍\nExample: {pn} naruto edit",
                        success: "Here's your TikTok edit for \"%1\":",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, hãy nhập từ khóa tìm kiếm! 🔍\nVD: {pn} naruto edit",
                        success: "Đây là video TikTok cho \"%1\":",
                        error: "× API error: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const search = args.join(" ");
                if (!search) return message.reply(getLang("noInput"));

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const videoUrl = `${await baseApiUrl()}/api/tiksr?sr=${encodeURIComponent(search)}`;
                        const stream = await global.utils.getStreamFromURL(videoUrl);

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);

                        return message.reply({
                                body: getLang("success", search),
                                attachment: stream
                        });

                } catch (err) {
                        console.error("TikTok Search Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
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
