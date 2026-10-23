const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "hadis",
                aliases: ["hadith", "হাদিস"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "র‍্যান্ডম বাংলা হাদিস এবং এর উৎস জানুন",
                        en: "Get a random Bangla Hadis with its source",
                        vi: "Lấy một câu Hadis ngẫu nhiên bằng tiếng Bangla"
                },
                category: "Islamic",
                guide: {
                        bn: '   {pn}: একটি র‍্যান্ডম হাদিস পেতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random Hadis',
                        vi: '   {pn}: Sử dụng để lấy một câu Hadis ngẫu nhiên'
                }
        },

        langs: {
                bn: {
                        wait: "⌛ বেবি, একটি হাদিস সংগ্রহ করছি... একটু অপেক্ষা করো! <🖤",
                        error: "× হাদিস সংগ্রহ করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        wait: "⌛ Baby, fetching a Hadis for you... Please wait! <🖤",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "⌛ Cưng ơi, đang lấy một câu Hadis... Chờ chút nhé! <🖤",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        api.setMessageReaction("⌛", event.messageID, () => {}, true);
                        
                        const baseUrl = await mahmud();
                        const res = await axios.get(`${baseUrl}/api/hadis`);
                        
                        if (!res.data || !res.data.text) throw new Error("Hadis content not found.");

                        const { text, source } = res.data;
                        const msg = `${text}\n`
                                  + `• ${source || "Unknown"} 🖤`;

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.reply(msg);

                } catch (err) {
                        console.error("Hadis Error:", err);
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
