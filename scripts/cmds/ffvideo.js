const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const response = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return response.data.mahmud;
};

module.exports = {
        config: {
                name: "ffvideo",
                aliases: ["ffvid", "freefirevideo", "ফ্রিফায়ার"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "র‍্যান্ডম ফ্রি ফায়ার ভিডিও স্ট্যাটাস পান",
                        en: "Get a random Free Fire video status",
                        vi: "Lấy video trạng thái Free Fire ngẫu nhiên"
                },
                category: "media",
                guide: {
                        bn: '   {pn}: র‍্যান্ডম ফ্রি ফায়ার ভিডিও দেখতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random Free Fire video',
                        vi: '   {pn}: Sử dụng để lấy video Free Fire ngẫu nhiên'
                }
        },

        langs: {
                bn: {
                        wait: "🐤 | বেবি, তোমার জন্য ফ্রি ফায়ার ভিডিও খুঁজছি... <😘",
                        noResult: "× কোনো ভিডিও খুঁজে পাওয়া যায়নি!",
                        success: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞 𝐟𝐢𝐫𝐞 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        wait: "🐤 | Loading random Free Fire video... Please wait baby! <😘",
                        noResult: "× No videos found!",
                        success: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞 𝐟𝐢𝐫𝐞 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        wait: "🐤 | Đang tải video Free Fire cho cưng... Chờ chút nhé! <😘",
                        noResult: "× Không tìm thấy video nào!",
                        success: "✨ | Video Free Fire của cưng đây <😘",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                const filePath = path.join(cacheDir, `ffvid_${event.senderID}.mp4`);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const waitMsg = await message.reply(getLang("wait"));

                        const apiUrlBase = await mahmud();
                        const res = await axios.get(`${apiUrlBase}/api/album/mahmud/videos/freefire?userID=${event.senderID}`);

                        if (!res.data.success || !res.data.videos.length) {
                                if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                                return message.reply(getLang("noResult"));
                        }

                        const videos = res.data.videos;
                        const url = videos[Math.floor(Math.random() * videos.length)];

                        const videoStream = await axios({
                                url,
                                method: "GET",
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        const writer = fs.createWriteStream(filePath);
                        videoStream.data.pipe(writer);

                        writer.on("finish", () => {
                                if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                                return message.reply({
                                        body: getLang("success"),
                                        attachment: fs.createReadStream(filePath)
                                }, () => {
                                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                                });
                        });

                        writer.on("error", (err) => { throw err; });

                } catch (err) {
                        console.error("FFVideo Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
