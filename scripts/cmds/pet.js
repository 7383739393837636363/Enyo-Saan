const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "pet",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "পেট ইফেক্ট জেনারেট করুন",
                        en: "Generate pet GIF effect image",
                        vi: "Tạo hiệu ứng pet"
                },
                category: "fun",
                guide: {
                        bn: '   {pn} @mention: নির্দিষ্ট কাউকে মেনশন করুন' +
                                '\n   {pn} [reply]: রিপ্লাই দিয়ে ইফেক্ট তৈরি করুন' +
                                '\n   {pn} [UID]: ইউজার আইডি দিন',
                        en: '   {pn} @mention: Generate with mentioned user' +
                                '\n   {pn} [reply]: Generate with replied user' +
                                '\n   {pn} [UID]: Provide a user ID',
                        vi: '   {pn} @mention: Tạo với người được nhắc' +
                                '\n   {pn} [reply]: Tạo với người đã trả lời' +
                                '\n   {pn} [UID]: Cung cấp UID'
                }
        },

        langs: {
                bn: {
                        provide: "• দয়া করে কাউকে মেনশন, মেসেজ রিপ্লাই অথবা UID দিন।",
                        success: "🐾 | এই নাও তোমার পেট ইফেক্ট!",
                        error: "× API error: %1. Contact SAAN for help."
                },
                en: {
                        provide: "• Please mention, message reply or provide a UID.",
                        success: "🐾 | Here's your pet effect!",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        provide: "• Vui lòng gắn thẻ, trả lời tin nhắn hoặc cung cấp UID.",
                        success: "🐾 | Hiệu ứng pet của bạn đây!",
                        error: "× API error: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const { mentions, type, messageReply } = event;
                        let uid;

                        if (Object.keys(mentions).length > 0) {
                                uid = Object.keys(mentions)[0];
                        } else if (type === "message_reply") {
                                uid = messageReply.senderID;
                        } else if (args[0]) {
                                uid = args[0];
                        } else {
                                return message.reply(getLang("provide"));
                        }

                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const response = await axios.get(`${await baseApiUrl()}/api/pet?uid=${uid}`, {
                                responseType: "stream"
                        });
                        const stream = response.data;

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return message.reply({
                                body: getLang("success"),
                                attachment: stream
                        });

                } catch (err) {
                        console.error("Pet Error:", err);
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
