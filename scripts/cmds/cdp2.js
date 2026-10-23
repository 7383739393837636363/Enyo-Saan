const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "copuledp2",
                aliases: ["cdp2"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "নিব্বা-নিব্বিদের জন্য রেন্ডম কাপল ডিপি পান (ভার্সন ২)",
                        en: "Fetch a random couple DP for nibba and nibbi (v2)"
                },
                category: "image",
                guide: {
                        bn: '   {pn}: রেন্ডম কাপল ডিপি (২) পেতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random couple DP (v2)'
                }
        },

        langs: {
                bn: {
                        notFound: "× কাপল ডিপি খুঁজে পাওয়া যায়নি। পরে চেষ্টা করো বেবি!",
                        success: "এই নাও তোমার কাপল ডিপি বেবি <😘",
                        error: "× ডিপি আনতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        notFound: "× Couldn't fetch couple DP. Try again later baby!",
                        success: "Here is your cdp baby <😘",
                        error: "× API error: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, message, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const baseUrl = await baseApiUrl();
                        const response = await axios.get(`${baseUrl}/api/cdp2`, {
                                headers: { "author": authorName }
                        });

                        if (response.data.error) {
                                return message.reply(response.data.error);
                        }

                        const { male, female } = response.data;
                        if (!male || !female) {
                                return message.reply(getLang("notFound"));
                        }

                        const attachments = [
                                await global.utils.getStreamFromURL(male),
                                await global.utils.getStreamFromURL(female)
                        ];

                        return message.reply({
                                body: getLang("success"),
                                attachment: attachments
                        });

                } catch (err) {
                        console.error("CDP2 Fetch Error:", err);
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
