const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud; 
};

module.exports = {
        config: {
                name: "video",
                aliases: ["v"],
                version: "2.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Download video from YouTube (by name or link)",
                        vi: "Tải video từ YouTube (theo tên hoặc liên kết)"
                },
                category: "media",
                guide: {
                        en: '   {pn} <name or link>: Provide video name or link',
                        vi: '   {pn} <tên hoặc liên kết>: Cung cấp tên hoặc liên kết video'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, please provide a video name or link!",
                        noResult: "× No results found.",
                        success: "✅ 𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên hoặc liên kết video!",
                        noResult: "× Không tìm thấy kết quả.",
                        success: "✅ Video của cưng đây 😘\n\n• 𝐓𝐢êu đề: %1",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const input = args.join(" ");
                if (!input) return message.reply(getLang("noInput"));

                try {
                        api.setMessageReaction("🐤", event.messageID, () => {}, true);
                        
                        const apiUrl = await baseApiUrl();
                        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
                        let videoID;

                        if (checkurl.test(input)) {
                                videoID = input.match(checkurl)[1];
                        } else {
                                const searchRes = await axios.get(`${await baseApiUrl()}/api/ytb/search?q=${encodeURIComponent(input)}`);
                                const results = searchRes.data.results;
                                if (!results || results.length === 0) {
                                        api.setMessageReaction("🥹", event.messageID, () => {}, true);
                                        return message.reply(getLang("noResult"));
                                }
                                videoID = results[0].id;
                        }

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

                        const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=video`);
                        const { title, downloadLink } = res.data.data;

                        const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
                        const writer = fs.createWriteStream(filePath);
                        response.data.pipe(writer);

                        writer.on('finish', () => {
                                message.reply({
                                        body: getLang("success", title),
                                        attachment: fs.createReadStream(filePath)
                                }, () => {
                                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                                });
                        });

                        writer.on('error', (err) => {
                                throw err;
                        });

                } catch (err) {
                        console.error("error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message || "Download failed!"));
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
