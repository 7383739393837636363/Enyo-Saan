const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "split",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "একটি ছবিকে দুই ভাগে বিভক্ত করুন",
                        en: "Split an image into two halves",
                        vi: "Chia một hình ảnh thành hai nửa"
                },
                category: "tools",
                guide: {
                        bn: '   {pn} (ছবিতে রিপ্লাই দিন)',
                        en: '   {pn} (reply to image)',
                        vi: '   {pn} (phản hồi hình ảnh)'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, একটি ছবিতে রিপ্লাই দাও!",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।",
                        done: "✅ এই নাও তোমার স্প্লিট করা ছবি:"
                },
                en: {
                        noInput: "× Baby, please reply to an image!",
                        error: "× API error: %1. Contact SAAN for help.",
                        done: "✅ Split Done! Here are the images:"
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng phản hồi một hình ảnh!",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ.",
                        done: "✅ Đã chia xong! Đây là ảnh của bạn:"
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
                        return message.reply(getLang("noInput"));
                }

                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

                const t = Date.now();
                const leftPath = path.join(cacheDir, `left_${event.senderID}_${t}.jpg`);
                const rightPath = path.join(cacheDir, `right_${event.senderID}_${t}.jpg`);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const imgUrl = event.messageReply.attachments[0].url;
                        const baseUrl = await baseApiUrl();                   
                        
                        const res = await axios.get(`${baseUrl}/api/split`, {
                                params: {
                                        url: imgUrl
                                }
                        });

                        if (res.data && (res.data.error || !res.data.success)) {
                                throw new Error(res.data.error || "API error");
                        }

                        const saveImg = (b64, p) => fs.writeFileSync(p, Buffer.from(b64.split(",")[1], "base64"));
                        saveImg(res.data.left, leftPath);
                        saveImg(res.data.right, rightPath);

                        await message.reply({
                                body: getLang("done"),
                                attachment: [fs.createReadStream(leftPath), fs.createReadStream(rightPath)]
                        });

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        [leftPath, rightPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));

                } catch (err) {
                        console.error("Split Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(leftPath)) fs.unlinkSync(leftPath);
                        if (fs.existsSync(rightPath)) fs.unlinkSync(rightPath);
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
