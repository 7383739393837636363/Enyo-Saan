const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud69;
};

module.exports = {
        config: {
                name: "facebookdl",
                aliases: ["fbdl"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "ফেসবুক ভিডিও ডাউনলোড করুন",
                        en: "Download videos from Facebook"
                },
                category: "media",
                guide: {
                        bn: '   {pn} <লিংক>: ফেসবুক ভিডিওর লিংক দিন'
                                + '\n   অথবা ভিডিও লিংকে রিপ্লাই দিয়ে {pn} লিখুন'
                                + '\n\nSupported Platforms:\n• Facebook / FB Watch',
                        en: '   {pn} <link>: Provide the Facebook video link'
                                + '\n   Or reply to a link with {pn}'
                                + '\n\nSupported Platforms:\n• Facebook / FB Watch'
                }
        },

        langs: {
                bn: {
                        noLink: "× বেবি, একটি সঠিক ফেসবুক ভিডিও লিংক দাও অথবা লিংকে রিপ্লাই করো!",
                        error: "× ভিডিও ডাউনলোড করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noLink: "× Baby, please provide a valid Facebook video link or reply to one!",
                        error: "× Download error: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const mahmud = args[0] || event.messageReply?.body;

                if (!mahmud || !mahmud.startsWith("http")) {
                        return message.reply(getLang("noLink"));
                }

                if (!(
                        mahmud.includes("facebook.com") || 
                        mahmud.includes("fb.watch") ||
                        mahmud.includes("fb.com")
                )) {
                        return message.reply(getLang("noLink"));
                }

                if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");
                const path = __dirname + `/cache/fbdl_${Date.now()}.mp4`;

                try {
                        api.setMessageReaction("🐤", event.messageID, () => {}, true);
                        
                        const base = await baseApiUrl();
                        const apiUrl = `${base}/api/download?url=${encodeURIComponent(mahmud)}`;
                        
                        const apiRes = await axios.get(apiUrl);
                        if (!apiRes.data || !apiRes.data.result) {
                                throw new Error("Failed to fetch video URL from API");
                        }

                        const videoUrl = apiRes.data.result;
                        const caption = apiRes.data.cp || "Downloaded Video"; 

                        const response = await axios({
                                method: 'get',
                                url: videoUrl,
                                responseType: 'arraybuffer'
                        });

                        fs.writeFileSync(path, Buffer.from(response.data, "binary"));

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);

                        return message.reply(
                                {
                                        body: caption,
                                        attachment: fs.createReadStream(path)
                                },
                                () => fs.unlinkSync(path)
                        );

                } catch (err) {
                        console.error("Error in facebookdl command:", err);
                        api.setMessageReaction("❎", event.messageID, () => {}, true);
                        if (fs.existsSync(path)) fs.unlinkSync(path);
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
