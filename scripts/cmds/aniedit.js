const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "aniedit",
                aliases: ["aedit"],
                version: "2.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search and download any anime edit video",
                        vi: "Tìm kiếm và tải xuống bất kỳ video chỉnh sửa anime nào"
                },
                category: "anime",
                guide: {
                        en: '   {pn} <keyword>: (Ex: {pn} Goku Ultra)',
                        vi: '   {pn} <từ khóa>: (VD: {pn} Goku Ultra)'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, what anime edit video are you looking for?",
                        success: "• 𝐇𝐄𝐑𝐄'𝐒 𝐘𝐎𝐔𝐑 𝐀𝐍𝐈𝐌𝐄 𝐄𝐃𝐈𝐓𝐙 𝐕𝐈𝐃𝐄𝐎\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, cưng đang tìm video anime edit nào?",
                        success: "• 𝐕𝐢𝐝𝐞𝐨 𝐀𝐧𝐢𝐦𝐞 𝐄𝐝𝐢𝐭 𝐜𝐮̉𝐚 𝐜𝐮̛𝐧𝐠 đ𝐚̂𝐲\n• 𝐓𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦: %1",
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
                        console.error("AniEdit Error:", err);
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
