const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "edit",
                aliases: ["imgedit"],
                version: "1.7",
                author: "Saan", // credit Change dile thapramu kintu.
                countDown: 10,
                role: 0,
                description: {
                        bn: "এআই এর মাধ্যমে আপনার ছবি এডিট করুন",
                        en: "Edit your image using AI prompt",
                        vi: "Chỉnh sửa hình ảnh của bạn bằng lời nhắc AI"
                },
                category: "image",
                guide: {
                        bn: '   {pn} <প্রম্পট>: ছবির রিপ্লাই দিয়ে এডিট প্রম্পট লিখুন'
                                + '\n   উদাহরণ: {pn} change hair color to red',
                        en: '   {pn} <prompt>: Reply to an image with edit instructions'
                                + '\n   Example: {pn} add sunglasses to face',
                        vi: '   {pn} <lời nhắc>: Phản hồi ảnh kèm hướng dẫn chỉnh sửa'
                                + '\n   Ví dụ: {pn} đổi màu tóc thành đỏ'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, একটি ছবিতে রিপ্লাই দিয়ে বলো কি এডিট করতে হবে! 🪄",
                        wait: "🔄 | তোমার ছবি এডিট করা হচ্ছে, একটু অপেক্ষা করো বেবি...",
                        success: "✅ | তোমার এডিট করা ছবি তৈরি: \"%1\"",
                        error: "× এডিট করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noInput: "× Baby, please reply to a photo with your prompt to edit it! 🪄",
                        wait: "🔄 | Editing your image, please wait...",
                        success: "✅ Here's your Edited image\nPrompt: %1",
                        error: "× Failed to edit: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng phản hồi ảnh kèm lời nhắc chỉnh sửa! 🪄",
                        wait: "🔄 | Đang chỉnh sửa ảnh, vui lòng chờ chút nhé...",
                        success: "✅ | Ảnh đã chỉnh sửa cho: \"%1\"",
                        error: "× Lỗi chỉnh sửa: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const prompt = args.join(" ");
                const repliedImage = event.messageReply?.attachments?.[0];

                if (!prompt || !repliedImage || repliedImage.type !== "photo") {
                        return message.reply(getLang("noInput"));
                }

                const cacheDir = path.join(__dirname, "cache");
                const imgPath = path.join(cacheDir, `${Date.now()}_edit.jpg`);
                await fs.ensureDir(cacheDir);

                const waitMsg = await message.reply(getLang("wait"));

                try {
                        const res = await axios.post(
                                `${await baseApiUrl()}/api/edit`,
                                { prompt, imageUrl: repliedImage.url },
                                { responseType: "arraybuffer" }
                        );

                        await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

                        await message.reply({
                                body: getLang("success", prompt),
                                attachment: fs.createReadStream(imgPath)
                        });

                } catch (err) {
                        console.error("Edit Command Error:", err);
                        return message.reply(getLang("error", err.message));
                } finally {
                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                        setTimeout(() => {
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        }, 10000);
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
