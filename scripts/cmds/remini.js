const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "remini",
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "Remini AI এর মাধ্যমে ছবির কোয়ালিটি উন্নত করুন",
                        en: "Enhance or restore image quality using Remini AI",
                        vi: "Nâng cao chất lượng hình ảnh bằng Remini AI"
                },
                category: "tools",
                guide: {
                        bn: '   {pn} [url]: ছবির লিংকের মাধ্যমে Enhance করুন\n   অথবা ছবির রিপ্লাইয়ে {pn} লিখুন',
                        en: '   {pn} [url]: Enhance image via URL\n   Or reply to an image with {pn}',
                        vi: '   {pn} [url]: Nâng cấp ảnh qua URL\n   Hoặc phản hồi ảnh bằng {pn}'
                }
        },

        langs: {
                bn: {
                        noImage: "• বেবি, একটি ছবিতে রিপ্লাই দাও অথবা ছবির লিংক দাও! 😘",
                        wait: "𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noImage: "• Baby, please reply to an image or provide a link! 😘",
                        wait: "𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noImage: "• Cưng ơi, hãy phản hồi một bức ảnh hoặc gửi link! 😘",
                        wait: "𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× Lỗi: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let imgUrl;
                if (event.messageReply?.attachments?.[0]?.type === "photo") {
                        imgUrl = event.messageReply.attachments[0].url;
                } else if (args[0]) {
                        imgUrl = args.join(" ");
                }

                if (!imgUrl) return api.sendMessage(getLang("noImage"), event.threadID, event.messageID);

                const waitMsg = await api.sendMessage(getLang("wait"), event.threadID, event.messageID);
                api.setMessageReaction("⏳", event.messageID, () => {}, true);

                try {
                        const baseUrl = await mahmud();
                        const apiUrl = `${baseUrl}/api/hd/mahmud?imgUrl=${encodeURIComponent(imgUrl)}`;
                        
                        const res = await axios.get(apiUrl, { responseType: "stream" });

                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return api.sendMessage({
                                body: getLang("success"),
                                attachment: res.data
                        }, event.threadID, event.messageID);

                } catch (err) {
                        console.error("Error in remini command:", err);
                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
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
