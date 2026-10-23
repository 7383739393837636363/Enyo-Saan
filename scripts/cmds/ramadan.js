const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "ramadan",
                aliases: ["ifter", "iftar", "sehri", "রমজান"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "রমজানের সেহরি ও ইফতারের সময়সূচী এবং কার্ড তৈরি করুন",
                        en: "Ramadan Sehri & Iftar schedule with image card",
                        vi: "Lịch Sehri & Iftar tháng Ramadan với thẻ hình ảnh"
                },
                category: "Islamic",
                guide: {
                        bn: '   {pn} <শহর> <স্টাইল>: (যেমন: {pn} dhaka 2)',
                        en: '   {pn} <city> <style>: (Ex: {pn} dhaka 2)',
                        vi: '   {pn} <thành phố> <phong cách>: (VD: {pn} dhaka 2)'
                }
        },

        langs: {
                bn: {
                        success: "🌙 %1 রমজানুল মোবারক 🌙\n• শহর: %2\n• হিজরি: %3\n\n✨ আজকের সময়সূচী:\n• সেহরি: %4\n• ইফতার: %5\n\n⏳ সময় বাকি:\n• সেহরি: %6\n• ইফতার: %7\n\n📆 আগামীকাল (%8):\n• সেহরি: %9\n• ইফতার: %10\n\n⏰ বর্তমান সময়: %11",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        success: "🌙 %1 RAMADAN KAREEM 🌙\n• City: %2\n• Hijri: %3\n\n✨ Today's Schedule:\n• Sehri: %4\n• Iftar: %5\n\n⏳ Time Remaining:\n• To Sehri: %6\n• To Iftar: %7\n\n📆 Tomorrow (%8):\n• Sehri: %9\n• Iftar: %10\n\n⏰ Current Time: %11",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        success: "🌙 %1 RAMADAN KAREEM 🌙\n• Thành phố: %2\n• Hijri: %3\n\n✨ Lịch trình hôm nay:\n• Sehri: %4\n• Iftar: %5\n\n⏳ Thời gian còn lại:\n• Đến Sehri: %6\n• Đến Iftar: %7\n\n📆 Ngày mai (%8):\n• Sehri: %9\n• Iftar: %10\n\n⏰ Giờ hiện tại: %11",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID, senderID } = event;
                let city = args[0] || "Dhaka";
                let style = "1";

                if (args.includes("--style")) {
                        const styleIndex = args.indexOf("--style");
                        style = args[styleIndex + 1] || "1";
                        city = args.slice(0, styleIndex).join(" ") || "Dhaka";
                } else if (args[1]) {
                        style = args[1];
                }

                const cacheDir = path.join(__dirname, "cache");
                const cachePath = path.join(cacheDir, `ramadan_${senderID}_${Date.now()}.png`);

                try {
                        api.setMessageReaction("⏳", messageID, () => {}, true);
                        
                        const baseUrl = await baseApiUrl();
                        const res = await axios.get(`${baseUrl}/api/ramadan`, { params: { city, style } });
                        const data = res.data;

                        if (typeof data === "string") {
                                throw new Error(data);
                        }

                        const bodyMsg = getLang("success", 
                                data.today.ramadan, data.city, data.today.hijri,
                                data.today.sehri, data.today.iftar,
                                data.sahriRemain, data.iftarRemain,
                                data.tomorrow.date, data.tomorrow.sehri, data.tomorrow.iftar,
                                data.currentTime
                        );

                        await fs.ensureDir(cacheDir);
                        const imageBuffer = Buffer.from(data.image, "base64");
                        await fs.writeFile(cachePath, imageBuffer);

                        return message.reply({
                                body: bodyMsg,
                                attachment: fs.createReadStream(cachePath)
                        }, () => {
                                api.setMessageReaction("🪽", messageID, () => {}, true);
                                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                        });

                } catch (err) {
                        console.error("Ramadan Error:", err);
                        api.setMessageReaction("❌", messageID, () => {}, true);
                        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                        const errorDetail = err.response?.data?.error || err.message;
                        return message.reply(getLang("error", errorDetail));
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
