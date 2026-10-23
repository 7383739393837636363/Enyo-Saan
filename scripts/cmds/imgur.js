const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "imgur",
                aliases: ["i"],
                version: "1.8",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো ছবি বা ভিডিওকে Imgur লিঙ্কে রূপান্তর করুন",
                        en: "Convert any image or video into an Imgur link",
                        vi: "Chuyển đổi bất kỳ hình ảnh hoặc video nào thành liên kết Imgur"
                },
                category: "tools",
                guide: {
                        bn: '   {pn}: মিডিয়া ফাইলে রিপ্লাই দিয়ে ব্যবহার করুন',
                        en: '   {pn}: Reply to a media file to get the link',
                        vi: '   {pn}: Phản hồi tệp phương tiện để lấy liên kết'
                }
        },

        langs: {
                bn: {
                        noMedia: "× বেবি, একটি ছবি বা ভিডিওতে রিপ্লাই দাও!",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN|"
                },
                en: {
                        noMedia: "× Baby, please reply to a media file!",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noMedia: "× Cưng ơi, hãy phản hồi một tệp phương tiện!",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (event.type !== "message_reply" || !event.messageReply.attachments.length) {
                        return message.reply(getLang("noMedia"));
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const attachmentUrl = event.messageReply.attachments[0].url;
                        const baseUrl = await baseApiUrl();
                        
                        const response = await axios.get(`${baseUrl}/api/imgur`, {
                                params: {
                                        url: attachmentUrl
                                }
                        });

                        const replyLink = response.data.link || "No link received.";
                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return message.reply(replyLink);

                } catch (err) {
                        console.error("Imgur Error:", err);
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
