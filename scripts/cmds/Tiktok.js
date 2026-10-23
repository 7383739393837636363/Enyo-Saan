const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "tiktok",
                aliases: ["tt", "tik"],
                version: "3.8",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search and download TikTok edit videos",
                        vi: "Tìm kiếm và tải xuống các video chỉnh sửa TikTok"
                },
                category: "media",
                guide: {
                        en: '   {pn} <keyword>: Enter keyword to search (Ex: {pn} naruto)',
                        vi: '   {pn} <từ khóa>: Nhập từ khóa để tìm kiếm (VD: {pn} naruto)'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, what do you want to search? 🔍\nExample: {pn} naruto",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐓𝐢𝐤𝐓𝐨𝐤 𝐄𝐝𝐢𝐭 𝐕𝐢𝐝𝐞𝐨.\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, cưng muốn tìm kiếm gì? 🔍\nVí dụ: {pn} naruto",
                        success: "• 𝐕𝐢𝐝𝐞𝐨 𝐜𝐡𝐢̉𝐧𝐡 𝐬𝐮̛̉𝐚 𝐓𝐢𝐤𝐓𝐨𝐤 𝐜𝐮̉𝐚 𝐜𝐮̛𝐧𝐠 ᵭ𝐚̂𝐲.\n• 𝐓𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦: %1",
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
                        console.error("TikTok Error:", err);
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
