const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ss",
                version: "1.7",
                author: "Saan",
                role: 0,
                description: {
                        en: "Take a screenshot of a website",
                        bn: "যেকোনো ওয়েবসাইটের স্ক্রিনশট নিন",
                        vi: "Chụp ảnh màn hình của một trang web"
                },
                category: "tools",
                guide: {
                        en: "{pn} <link>",
                        bn: "{pn} <লিঙ্ক>",
                        vi: "{pn} <link>"
                },
                coolDowns: 10,
        },

        langs: {
                bn: {
                        noUrl: "• বেবি, একটি লিঙ্ক (URL) তো দাও! 😘",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "Here's your screenshot image <😘"
                },
                en: {
                        noUrl: "• Baby, please provide a URL! 😘",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "Here's your screenshot image <😘"
                },
                vi: {
                        noUrl: "• Cưng ơi, vui lòng cung cấp đường dẫn URL! 😘",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "Đây là ảnh chụp màn hình của bạn <😘"
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                const urlInput = args.join(" ");

                if (!urlInput) return api.sendMessage(getLang("noUrl"), threadID, messageID);

                try {
                        api.setMessageReaction("⏳", messageID, () => { }, true);

                        const apiUrlBase = await baseApiUrl();
                        const finalUrl = `${apiUrlBase}/api/ss?url=${encodeURIComponent(urlInput)}`;
                        
                        const attachment = await global.utils.getStreamFromURL(finalUrl);
                        
                        api.sendMessage({ 
                                body: getLang("success"), 
                                attachment 
                        }, threadID, (err) => {
                                if (!err) {
                                        api.setMessageReaction("🪽", messageID, () => { }, true);
                                }
                        }, messageID);

                } catch (error) {
                        api.setMessageReaction("❌", messageID, () => { }, true);
                        console.error("SS Error:", error);
                        api.sendMessage(getLang("error", error.message || "API Error"), threadID, messageID);
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
