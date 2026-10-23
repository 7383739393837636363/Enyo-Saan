const axios = require("axios");
 
const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "emojimix",
                aliases: ["mix", "ইমোজি"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "দুটি ইমোজি মিক্স করে নতুন স্টিকার তৈরি করুন",
                        en: "Mix two emojis to create a new sticker",
                        vi: "Trộn hai biểu tượng cảm xúc để tạo một nhãn dán mới"
                },
                category: "fun",
                guide: {
                        bn: '   {pn} <emoji1> <emoji2>\n   উদাহরণ: {pn} 🙂 😘',
                        en: '   {pn} <emoji1> <emoji2>\n   Example: {pn} 🙂 😘',
                        vi: '   {pn} <emoji1> <emoji2>\n   Ví dụ: {pn} 🙂 😘'
                }
        },

        langs: {
                bn: {
                        error: "× দুঃখিত বেবি, %1 এবং %2 মিক্স করা সম্ভব নয়। 🥺",
                        success: "✨ | এই নাও তোমার মিক্স ইমোজি: %1 + %2",
                        invalid: "• দয়া করে দুটি ইমোজি দিন\n\nউদাহরণ: {pn} 😘 🙂"
                },
                en: {
                        error: "× Sorry baby, emoji %1 and %2 can't be mixed. 🥺",
                        success: "✨ | Emoji %1 and %2 mixed successfully!",
                        invalid: "• Please provide two emojis\n\nExample: {pn} 😘 🙂"
                },
                vi: {
                        error: "❌ Xin lỗi, biểu tượng cảm xúc %1 và %2 không thể trộn lẫn.",
                        success: "✨ | Đã trộn biểu tượng cảm xúc %1 và %2 thành công!",
                        invalid: "• Vui lòng cung cấp hai biểu tượng cảm xúc\n\nVí dụ: {pn} 😘 🙂"
                }
        },

        onStart: async function ({ api, message, event, args, getLang }) {
                const authorName = "Saan"; 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const prefix = global.utils.getPrefix(event.threadID);
                const [emoji1, emoji2] = args;

                if (!emoji1 || !emoji2) {
                        const invalidMsg = getLang("invalid").replace(/{pn}/g, prefix + this.config.name);
                        return api.sendMessage(invalidMsg, event.threadID, event.messageID);
                }

                try {
                        api.setMessageReaction("✨", event.messageID, () => {}, true);
                        const image = await generateEmojimix(emoji1, emoji2);

                        if (!image) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return api.sendMessage(getLang("error", emoji1, emoji2), event.threadID, event.messageID);
                        }

                        return api.sendMessage({
                                body: getLang("success", emoji1, emoji2),
                                attachment: image
                        }, event.threadID, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                        }, event.messageID);

                } catch (e) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", emoji1, emoji2), event.threadID, event.messageID);
                }
        }
};

async function generateEmojimix(emoji1, emoji2) {
        try {
                const baseUrl = await baseApiUrl();
                const apiUrl = `${baseUrl}/api/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
                const response = await axios.get(apiUrl, {
                        headers: { "Author": "MahMUD" },
                        responseType: "stream"
                });

                if (response.data.error) return null;
                return response.data;
        } catch (error) {
                return null;
        }
}

 
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
