const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "namaz",
                aliases: ["prayer", "salah", "নামাজ"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "আপনার শহরের নামাজের সময়সূচী জানুন",
                        en: "Get prayer times for your city",
                        vi: "Xem thời gian cầu nguyện cho thành phố của bạn"
                },
                category: "Islamic",
                guide: {
                        bn: '   {pn} <শহরের নাম>: (যেমন: {pn} Dhaka)',
                        en: '   {pn} <city>: (Ex: {pn} Dhaka)',
                        vi: '   {pn} <thành phố>: (VD: {pn} Dhaka)'
                }
        },

        langs: {
                bn: {
                        noData: "× দুঃখিত বেবি, %1 শহরের নামাজের সময় পাওয়া যায়নি। 🕌",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noData: "× Sorry baby, prayer times for %1 were not found. 🕌",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noData: "× Xin lỗi cưng, không tìm thấy thời gian cầu nguyện cho %1. 🕌",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const city = args.join(" ") || "Dhaka";

                try {
                        
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const baseUrl = await baseApiUrl();
                        const apiUrl = `${baseUrl}/api/namaz/font3/${encodeURIComponent(city)}`;

                        const response = await axios.get(apiUrl, {
                                headers: { "author": authorName }
                        });

                        if (response.data?.error) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return message.reply(response.data.error);
                        }

                        if (response.data?.message) {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return message.reply(response.data.message);
                        }

                        api.setMessageReaction("❓", event.messageID, () => {}, true);
                        return message.reply(getLang("noData", city));

                } catch (err) {
                        console.error("Namaz Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        const errorMsg = err.response?.data?.error || err.message;
                        return message.reply(getLang("error", errorMsg));
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
