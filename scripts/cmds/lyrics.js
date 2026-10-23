const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "lyrics",
                version: "2.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search and get the real lyrics of any song",
                        vi: "Tìm kiếm và lấy lời bài hát thực tế của bất kỳ bài hát nào"
                },
                category: "music",
                guide: {
                        en: '   {pn} [song name]: Search lyrics by song name' +
                                '\n   {pn} Oporadhi Arman Alif',
                        vi: '   {pn} [tên bài hát]: Tìm lời bài hát theo tên' +
                                '\n   {pn} Oporadhi Arman Alif'
                }
        },

        langs: {
                en: {
                        noQuery: "• Baby, please provide a song name to search.",
                        notFound: "× Lyrics not found for \"%1\". Try adding the artist name.",
                        success: "🎵 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠 𝐥𝐲𝐫𝐢𝐜𝐬 𝐛𝐚𝐛𝐲:\n\n• Artist name: %1\n• Song name: %2\n\n%3",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noQuery: "• Cưng ơi, vui lòng cung cấp tên bài hát để tìm kiếm.",
                        notFound: "× Không tìm thấy lời cho \"%1\". Hãy thử thêm tên nghệ sĩ.",
                        success: "🎵 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮'𝐫 𝐬𝐨𝐧𝐠 𝐥𝐲𝐫𝐢𝐜𝐬 𝐛𝐚𝐛𝐲:\n\n• Tên nghệ sĩ: %1\n• Tên bài hát: %2\n\n%3",
                        error: "× Lỗi: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const searchQuery = args.join(" ");
                if (!searchQuery) return api.sendMessage(getLang("noQuery"), event.threadID, event.messageID);

                api.setMessageReaction("⏳", event.messageID, () => {}, true);

                try {
                        const response = await axios.get(`${await baseApiUrl()}/api/lyrics?search=${encodeURIComponent(searchQuery)}`);

                        if (!response.data || !response.data.status || !response.data.data) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return api.sendMessage(getLang("notFound", searchQuery), event.threadID, event.messageID);
                        }

                        const { artist, song, lyrics } = response.data.data;

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return api.sendMessage(
                                getLang("success", artist, song, lyrics),
                                event.threadID,
                                event.messageID
                        );

                } catch (err) {
                        console.error("error", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        const errorMsg = err.response?.data?.message || err.message;
                        return api.sendMessage(getLang("error", errorMsg), event.threadID, event.messageID);
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
