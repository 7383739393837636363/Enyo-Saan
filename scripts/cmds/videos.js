const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud; 
};

module.exports = {
        config: {
                name: "videos",
                version: "2.10",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search videos from YouTube and download your choice",
                        vi: "Tìm kiếm video từ YouTube và tải xuống theo lựa chọn của bạn"
                },
                category: "media",
                guide: {
                        en: '   {pn} <name>: Enter name to search videos',
                        vi: '   {pn} <tên>: Nhập tên để tìm kiếm video'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, please provide a video name.",
                        noResult: "× No results found.",
                        select: "𝐒𝐞𝐥𝐞𝐜𝐭 𝐚 𝐯𝐢𝐝𝐞𝐨:\n\n%1• Reply with the number to download",
                        success: "✅ 𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên video.",
                        noResult: "× Không tìm thấy kết quả.",
                        select: "𝐒𝐞𝐥𝐞𝐜𝐭 𝐚 𝐯𝐢𝐝𝐞𝐨:\n\n%1• Phản hồi bằng số để tải xuống",
                        success: "✅ Video của cưng đây 😘\n\n• 𝐓𝐢êu đề: %1",
                        error: "× API error: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, event, args, message, getLang, commandName }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const keyWord = args.join(" ");
                if (!keyWord) return message.reply(getLang("noInput"));

                try {
                        api.setMessageReaction("🐤", event.messageID, () => {}, true);

                        const res = await axios.get(`${await baseApiUrl()}/api/ytb/search?q=${encodeURIComponent(keyWord)}`);
                        const result = res.data.results ? res.data.results.slice(0, 6) : [];

                        if (!result || result.length === 0) {
                                api.setMessageReaction("🥹", event.messageID, () => {}, true);
                                return message.reply(getLang("noResult"));
                        }

                        let listMsg = "";
                        const attachments = [];
                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                        for (let i = 0; i < result.length; i++) {
                                const info = result[i];
                                const channelName = typeof info.channel === 'object' ? info.channel.name : info.channel;
                                listMsg += `${i + 1}. ${info.title}\nTime: ${info.time} | Channel: ${channelName || 'N/A'}\n\n`;
                                
                                const thumbPath = path.join(cacheDir, `thumb_${event.senderID}_${Date.now()}_${i}.jpg`);
                                const thumbRes = await axios.get(info.thumbnail, { responseType: "arraybuffer" });
                                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                                attachments.push(fs.createReadStream(thumbPath));
                        }

                        return message.reply({
                                body: getLang("select", listMsg),
                                attachment: attachments
                        }, (err, info) => {
                                attachments.forEach(stream => { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); });
                                
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName,
                                        author: event.senderID,
                                        result,
                                        menuMessageID: info.messageID
                                });
                        });

                } catch (err) {
                        console.error("Search Error:", err);
                        return message.reply(getLang("error", err.message));
                }
        },

        onReply: async function ({ event, api, Reply, getLang, message }) {
                const { result, author, menuMessageID } = Reply;
                if (event.senderID !== author) return;

                const targetMessageID = menuMessageID || Reply.messageID;

                const choice = parseInt(event.body);
                if (isNaN(choice) || choice <= 0 || choice > result.length) {
                        return api.unsendMessage(targetMessageID);
                }

                api.unsendMessage(targetMessageID);
                api.setMessageReaction("⌛", event.messageID, () => {}, true);

                const videoID = result[choice - 1].id;

                try {
                        const res = await axios.get(`${await baseApiUrl()}/api/ytb/get?id=${videoID}&type=video`);
                        const { title, downloadLink } = res.data.data;

                        const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
                        const stream = response.data;
                        stream.path = `video_${Date.now()}.mp4`;

                        return message.reply({
                                body: getLang("success", title),
                                attachment: stream
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
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
