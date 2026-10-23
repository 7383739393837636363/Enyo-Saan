const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "anicdp",
                aliases: ["animecdp"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "র‍্যান্ডম এনিমে কাপল প্রোফাইল পিকচার পান",
                        en: "Get random anime couple profile pictures",
                        vi: "Lấy ảnh đại diện cặp đôi anime ngẫu nhiên"
                },
                category: "media",
                guide: {
                        bn: '   {pn}: র‍্যান্ডম এনিমে সিডিপি পেতে ব্যবহার করুন',
                        en: '   {pn}: Use to get random anime cdp',
                        vi: '   {pn}: Sử dụng để lấy cdp anime ngẫu nhiên'
                }
        },

        langs: {
                bn: {
                        wait: "⌛ | বেবি, তোমার জন্য এনিমে সিডিপি খুঁজছি...!!",
                        noResult: "× কোনো ছবি খুঁজে পাওয়া যায়নি!",
                        success: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐚𝐧𝐢𝐦𝐞 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        wait: "⌛ | Baby, searching for anime cdp for you...!!",
                        noResult: "× No images found!",
                        success: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐚𝐧𝐢𝐦𝐞 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        wait: "⌛ Cưng ơi, đang tìm ảnh cdp anime cho cưng...!!",
                        noResult: "× Không tìm thấy hình ảnh nào!",
                        success: "🎀 Ảnh cdp anime của cưng đây",
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

                        const apiBase = await mahmud();
                        const baseUrl = `${apiBase}/api/cdpvip2`;

                        const res = await axios.get(`${baseUrl}?category=anime`);
                        const groupImages = res.data?.group || [];

                        if (!groupImages.length) {
                                api.setMessageReaction("🥹", event.messageID, () => {}, true);
                                return message.reply(getLang("noResult"));
                        }

                        const streamAttachments = [];
                        for (const url of groupImages) {
                                try {
                                        const imgRes = await axios({
                                                url,
                                                method: "GET",
                                                responseType: "stream",
                                                headers: { "User-Agent": "Mozilla/5.0" }
                                        });
                                        streamAttachments.push(imgRes.data);
                                } catch (e) {
                                        console.warn(`Failed to load image: ${url}`);
                                }
                        }

                        if (!streamAttachments.length) throw new Error("All images failed to stream.");

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.reply({
                                body: getLang("success"),
                                attachment: streamAttachments
                        });

                } catch (err) {
                        console.error("AniCDP Error:", err);
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
