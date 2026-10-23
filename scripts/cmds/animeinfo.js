const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "animeinfo",
                aliases: ["aniinfo"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "যেকোনো এনিমে সম্পর্কে বিস্তারিত তথ্য জানুন",
                        en: "Get detailed information about any anime",
                        vi: "Lấy thông tin chi tiết về bất kỳ bộ anime nào"
                },
                category: "anime",
                guide: {
                        bn: '   {pn} <এনিমে নাম>: বিস্তারিত জানতে নাম লিখুন',
                        en: '   {pn} <anime name>: Provide the anime name to get details',
                        vi: '   {pn} <tên anime>: Cung cấp tên anime để lấy chi tiết'
                }
        },

        langs: {
                bn: {
                        noInput: "⚠️ বেবি, একটি এনিমে এর নাম তো দাও!",
                        notFound: "❌ দুঃখিত বেবি, এই এনিমে তথ্য খুঁজে পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noInput: "⚠️ Baby, please enter an anime name!",
                        notFound: "❌ Sorry baby, anime info not found.",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "⚠️ Cưng ơi, vui lòng nhập tên anime!",
                        notFound: "❌ Xin lỗi cưng, không tìm thấy thông tin anime này.",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args[0]) return message.reply(getLang("noInput"));

                try {
                        const baseUrl = await mahmud();
                        const animeName = args.join(" ");
                        const url = `${baseUrl}/api/animeinfo?animeName=${encodeURIComponent(animeName)}`;
                        
                        const res = await axios.get(url);
                        const { formatted_message, data } = res.data;

                        if (!res.data || !data) return message.reply(getLang("notFound"));

                        const attachment = await global.utils.getStreamFromURL(data.image_url);

                        return message.reply({
                                body: formatted_message,
                                attachment: attachment
                        });

                } catch (err) {
                        console.error("Anime Info Error:", err);
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
