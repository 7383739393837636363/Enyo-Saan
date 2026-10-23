const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "anipic",
                aliases: ["animepic"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "বিভিন্ন ক্যাটাগরির এনিমে ছবি পান",
                        en: "Get anime pictures from various categories",
                        vi: "Lấy hình ảnh anime từ các danh mục khác nhau"
                },
                category: "anime",
                guide: {
                        bn: '   {pn} <category>: (যেমন: {pn} gojo)',
                        en: '   {pn} <category>: (Ex: {pn} gojo)',
                        vi: '   {pn} <category>: (VD: {pn} gojo)'
                }
        },

        langs: {
                bn: {
                        noCategory: "× বেবি, একটি ক্যাটাগরি বেছে নাও:\n• %1",
                        invalid: "× ভুল ক্যাটাগরি! এগুলো থেকে একটি বেছে নাও:\n%1",
                        success: "এখানে তোমার %1 ছবি বেবি <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noCategory: "× Baby, please select a category:\n• %1",
                        invalid: "× Invalid category! Choose one from:\n%1",
                        success: "Here's your %1 image baby <😘",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noCategory: "× Cưng ơi, hãy chọn một danh mục:\n• %1",
                        invalid: "× Danh mục không hợp lệ! Chọn một trong:\n%1",
                        success: "Ảnh %1 của cưng đây <😘",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const categories = ["gojo", "naruto", "goku", "luffy", "itachi", "madara", "ichigo", "aizen"];
                const category = args[0]?.toLowerCase();

                if (!category) {
                        return message.reply(getLang("noCategory", categories.join("\n• ")));
                }

                if (!categories.includes(category)) {
                        return message.reply(getLang("invalid", categories.join(", ")));
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const baseURL = await mahmud();
                        const imageStream = await axios({
                                method: "GET",
                                url: `${baseURL}/api/anipic?category=${category}`,
                                responseType: "stream",
                                headers: { "User-Agent": "Mozilla/5.0" }
                        });

                        return message.reply({
                                body: getLang("success", category),
                                attachment: imageStream.data
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                        });

                } catch (err) {
                        console.error("AniPic Error:", err);
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
