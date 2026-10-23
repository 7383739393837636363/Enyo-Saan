const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "audio",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        en: "Download any song directly from YouTube",
                        bn: "যেকোনো গান সরাসরি ডাউনলোড করুন",
                        vi: "Tải bất kỳ bài hát nào trực tiếp từ YouTube"
                },
                category: "music",
                guide: {
                        en: '   {pn} <song name>\n   Example: {pn} stay justin bieber',
                        bn: '   {pn} <গানের নাম>\n   উদাহরণ: {pn} tui chinli na amay',
                        vi: '   {pn} <tên bài hát>\n   Ví dụ: {pn} see you again'
                }
        },

        langs: {
                bn: {
                        error: "❌ An error occurred: contact SAAN to help %1",
                        noResult: "⭕ | দুঃখিত বেবি, \"%1\" এর জন্য কিছু খুঁজে পাইনি।",
                        success: "✅ | এই নাও তোমার গান: %1"
                },
                en: {
                        error: "❌ An error occurred: contact SAAN to help %1",
                        noResult: "⭕ | Sorry baby, I couldn't find anything for \"%1\"",
                        success: "✅ | Here is your song: %1"
                },
                vi: {
                        error: "❌ Đã xảy ra lỗi: liên hệ SAAN để được hỗ trợ %1",
                        noResult: "⭕ | Xin lỗi bé, không tìm thấy kết quả cho \"%1\"",
                        success: "✅ | Đây là bài hát của bạn: %1"
                }
        },

        onStart: async function ({ api, args, message, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                const input = args.join(" ");

                if (!input) return api.sendMessage("• Baby, please provide a song name.", threadID, messageID);

                try {
                        const apiUrl = await baseApiUrl();
                        api.setMessageReaction("⏳", messageID, () => { }, true);

                        const res = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(input)}`);
                        const results = res.data.results;

                        if (!results || results.length === 0) {
                                api.setMessageReaction("❌", messageID, () => { }, true);
                                return api.sendMessage(getLang("noResult", input), threadID, messageID);
                        }

                        const videoID = results[0].id;
                        const title = results[0].title;

                        api.setMessageReaction("⌛", messageID, () => { }, true);
                        await handleDownload(api, threadID, messageID, videoID, apiUrl, title, getLang);

                } catch (e) {
                        api.setMessageReaction("❌", messageID, () => { }, true);
                        return api.sendMessage(getLang("error", e.message), threadID, messageID);
                }
        }
};

async function handleDownload(api, threadID, messageID, videoID, apiUrl, title, getLang) {
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const filePath = path.join(cacheDir, `music_${Date.now()}.mp3`);

        try {
                const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=audio`);
                const { downloadLink } = res.data.data;

                const response = await axios({ 
                        url: downloadLink, 
                        method: 'GET', 
                        responseType: 'stream',
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                });

                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', () => {
                        api.sendMessage({
                                body: getLang("success", title),
                                attachment: fs.createReadStream(filePath)
                        }, threadID, (err) => {
                                if (err) api.sendMessage(getLang("error", "File too large!"), threadID, messageID);
                                api.setMessageReaction("🪽", messageID, () => { }, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        }, messageID);
                });

                writer.on('error', (e) => {
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        api.sendMessage(getLang("error", e.message), threadID, messageID);
                });

        } catch (e) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                api.sendMessage(getLang("error", "Download failed!"), threadID, messageID);
        }
}

 
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
