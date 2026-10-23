const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "meme",
                aliases: ["memes", "মিম"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "র‍্যান্ডম মজার মিম ইমেজ পান",
                        en: "Get random funny meme images",
                        vi: "Lấy hình ảnh meme vui nhộn ngẫu nhiên"
                },
                category: "fun",
                guide: {
                        bn: '   {pn}: একটি র‍্যান্ডম মিম দেখতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random meme',
                        vi: '   {pn}: Sử dụng để lấy một meme ngẫu nhiên'
                }
        },

        langs: {
                bn: {
                        noResult: "× কোনো মিম খুঁজে পাওয়া যায়নি!",
                        success: "🐸 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐦𝐞𝐦𝐞 𝐛𝐚𝐛y",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noResult: "× Could not fetch meme!",
                        success: "🐸 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐦𝐞𝐦𝐞 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noResult: "× Không tìm thấy meme nào!",
                        success: "🐸 | Meme của cưng đây",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const apiUrlBase = await mahmud();
                        const res = await axios.get(`${apiUrlBase}/api/meme`);
                        const imageUrl = res.data?.imageUrl;

                        if (!imageUrl) return message.reply(getLang("noResult"));

                        const stream = await axios({
                                method: "GET",
                                url: imageUrl,
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        return message.reply({
                                body: getLang("success"),
                                attachment: stream.data
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                        });

                } catch (err) {
                        console.error("Meme Error:", err);
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
