const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ocr",
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                category: "tools",
                description: {
                        bn: "ছবি থেকে টেক্সট এক্সট্রাক্ট করুন (OCR)",
                        en: "Extract text from images (OCR)",
                        vi: "Trích xuất văn bản từ hình ảnh (OCR)"
                },
                guide: {
                        bn: '{pn}: একটি ছবিতে রিপ্লাই দিন টেক্সট পেতে।',
                        en: '{pn}: Reply to an image to get text.',
                        vi: '{pn}: Phản hồi một hình ảnh để lấy văn bản.'
                }
        },

        langs: {
                bn: {
                        replyOnly: "× বেবি, একটি ছবিতে রিপ্লাই দাও!",
                        noText: "× ছবি থেকে কোনো টেক্সট পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        replyOnly: "× Baby, please reply to an image!",
                        noText: "× No text found in the image.",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        replyOnly: "× Cưng ơi, vui lòng phản hồi một hình ảnh!",
                        noText: "× Không tìm thấy văn bản trong hình ảnh.",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (event.type !== "message_reply" || !event.messageReply.attachments.length || event.messageReply.attachments[0].type !== "photo") {
                        return message.reply(getLang("replyOnly"));
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const apiBase = await mahmud();
                        const imageUrl = event.messageReply.attachments[0].url;
                        const ocrPrompt = "Extract all text from this image accurately.";

                        const response = await axios.post(`${apiBase}/api/gemini`, {
                                prompt: ocrPrompt,
                                imageUrl: imageUrl
                        }, {
                                headers: { 
                                        "Content-Type": "application/json",
                                        "author": "MahMUD"
                                }
                        });

                        const resultText = response.data.response || getLang("noText");
                        
                        api.setMessageReaction("🪽", event.messageID, () => {}, true);
                        return message.reply(resultText);

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.response?.data?.error || err.message));
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
