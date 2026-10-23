const axios = require("axios");

const getBase = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "catbox",
                aliases: ["cb"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো মিডিয়া ফাইলকে লিঙ্কে রূপান্তর করুন",
                        en: "Convert any media file into a link",
                        vi: "Chuyển đổi bất kỳ tệp phương tiện nào thành liên kết"
                },
                category: "tools",
                guide: {
                        bn: '   {pn}: যেকোনো ছবি/ভিডিওতে রিপ্লাই দিয়ে ব্যবহার করুন',
                        en: '   {pn}: Reply to any image/video to get the link',
                        vi: '   {pn}: Phản hồi bất kỳ ảnh/video nào để lấy liên kết'
                }
        },

        langs: {
                bn: {
                        noMedia: "🐤 | বেবি, একটি ছবি বা ভিডিওতে রিপ্লাই দাও! 🖼️",
                        uploading: "⌛ | আপলোড হচ্ছে, একটু অপেক্ষা করো বেবি... <😘",
                        success: "Successfully Uploaded ✅\n\n🔗 𝐔𝐑𝐋: %1",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noMedia: "🐤 | Baby, please reply to a media file (image/video)! 🖼️",
                        uploading: "⌛ | Uploading, please wait a moment baby... <😘",
                        success: "Successfully Uploaded ✅\n\n🔗 𝐔𝐑𝐋: %1",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noMedia: "🐤 | Cưng ơi, vui lòng phản hồi một tệp ảnh hoặc video! 🖼️",
                        uploading: "⌛ | Đang tải lên, chờ chút nhé cưng... <😘",
                        success: "Tải lên thành công ✅\n\n🔗 𝐔𝐑𝐋: %1",
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
                        api.setMessageReaction("⌛", event.messageID, () => {}, true);
                        const waitMsg = await message.reply(getLang("uploading"));

                        const attachmentUrl = encodeURIComponent(event.messageReply.attachments[0].url);
                        const baseUrl = await getBase();
                        const apiUrl = `${baseUrl.replace(/\/$/, "")}/api/catbox?url=${attachmentUrl}`;

                        const response = await axios.get(apiUrl, { timeout: 100000 });

                        if (response.data.status && response.data.link) {
                                if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                                
                                return message.reply({
                                        body: getLang("success", response.data.link)
                                }, () => {
                                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                                });
                        } else {
                                throw new Error("API response status is false.");
                        }

                } catch (err) {
                        console.error("Catbox Error:", err);
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
