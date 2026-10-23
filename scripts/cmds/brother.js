const fs = require("fs");
const axios = require("axios");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "brother",
                aliases: ["bro", "ভাই"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ভাই-বোনের মিষ্টি সম্পর্কের একটি ছবি তৈরি করুন",
                        en: "Create a sweet brother-sister relationship image",
                        vi: "Tạo hình ảnh tình cảm anh chị em ngọt ngào"
                },
                category: "love",
                guide: {
                        bn: '   {pn} <@tag/reply>: কাউকে ট্যাগ অথবা রিপ্লাই দিন',
                        en: '   {pn} <@tag/reply>: Tag or reply to someone',
                        vi: '   {pn} <@tag/reply>: Gắn thẻ hoặc phản hồi ai đó'
                }
        },

        langs: {
                bn: {
                        noTarget: "× বেবি, একজনকে ট্যাগ করো অথবা রিপ্লাই দাও! 🎀",
                        wait: "⌛ তোমার ছবিটি তৈরি করছি... একটু অপেক্ষা করো বেবি! <😘",
                        success: "𝐋𝐢𝐟𝐞'𝐬 𝐛𝐞𝐭𝐭𝐞𝐫 𝐰𝐢𝐭𝐡 𝐚 𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐛𝐲 𝐲𝐨𝐮𝐫 𝐬𝐢𝐝𝐞 🎀",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noTarget: "× Baby, please tag or reply to someone! 🎀",
                        wait: "⌛ Generating your image... Please wait a moment baby! <😘",
                        success: "𝐋𝐢𝐟𝐞'𝐬 𝐛𝐞𝐭𝐭𝐞𝐫 𝐰𝐢𝐭𝐡 𝐚 𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐛𝐲 𝐲𝐨𝐮𝐫 𝐬𝐢𝐝𝐞 🎀",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noTarget: "× Cưng ơi, hãy gắn thẻ hoặc phản hồi ai đó! 🎀",
                        wait: "⌛ Đang tạo hình ảnh cho cưng... Chờ chút nhé! <😘",
                        success: "𝐂𝐮𝐨̣̂𝐜 𝐬𝐨̂́𝐧𝐠 𝐭𝐨̂́𝐭 đ𝐞̣𝐩 𝐡𝐨̛𝐧 𝐤𝐡𝐢 𝐜𝐨́ 𝐚𝐧𝐡 𝐞𝐦 𝐛𝐞̂𝐧 𝐜𝐚̣𝐧𝐡 🎀",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const mention = Object.keys(event.mentions)[0] || (event.messageReply && event.messageReply.senderID);
                if (!mention) return message.reply(getLang("noTarget"));

                const user1 = mention;
                const user2 = event.senderID;
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                const imgPath = path.join(cacheDir, `brother_${user1}_${user2}.png`);

                try {
                        api.setMessageReaction("🎀", event.messageID, () => {}, true);
                        const waitMsg = await message.reply(getLang("wait"));

                        const baseUrl = await baseApiUrl();
                        const apiUrl = `${baseUrl}/api/bro&sis?user1=${user1}&user2=${user2}&style=1`;

                        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
                        fs.writeFileSync(imgPath, Buffer.from(response.data));

                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(imgPath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });

                } catch (err) {
                        console.error("Brother Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
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
