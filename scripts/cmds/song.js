const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "song",
                version: "2.8",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Download songs/audio from YouTube",
                        vi: "Tải nhạc từ YouTube"
                },
                category: "music",
                guide: {
                        en: '   {pn} [song name or link]\n   Example: {pn} stay justin bieber',
                        vi: '   {pn} [tên bài hát hoặc link]\n   Ví dụ: {pn} see you again'
                }
        },

        langs: {
                en: {
                        error: "× API error: %1. Contact SAAN for help.",
                        noResult: "⭕ | No search results match the keyword %1",
                        choose: "Song Results:\n\n%1\nReply with a number to download.",
                        success: "✅ | Successfully Downloaded: %1"
                },
                vi: {
                        error: "× API error: %1. Contact SAAN for help.",
                        noResult: "⭕ | Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
                        choose: "Danh sách bài hát:\n\n%1\nReply với số để tải xuống.",
                        success: "✅ | Tải xuống thành công: %1"
                }
        },

        onStart: async function ({ api, args, message, event, commandName, getLang }) {
                const authorName = "Saan"; 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID, senderID } = event;
                const input = args.join(" ");

                if (!input) return api.sendMessage("• Please provide a song name or send link.", threadID, messageID);

                const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

                if (checkurl.test(input)) {
                        const videoID = input.match(checkurl)[1];
                        api.setMessageReaction("⌛", messageID, () => {}, true);
                        return handleDownload(api, threadID, messageID, videoID, getLang);
                }

                try {
                        api.setMessageReaction("⏳", messageID, () => {}, true);
                        const res = await axios.get(`${await baseApiUrl()}/api/ytb/search?q=${encodeURIComponent(input)}`);
                        const results = res.data.results.slice(0, 6);
                        
                        if (!results || results.length === 0) return api.sendMessage(getLang("noResult", input), threadID, messageID);

                        let msg = "";
                        const attachments = [];
                        const cacheDir = path.join(__dirname, 'cache');
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                        for (let i = 0; i < results.length; i++) {
                                msg += `${i + 1}. ${results[i].title}\nTime: ${results[i].time}\n\n`;
                                const thumbPath = path.join(cacheDir, `thumb_${senderID}_${Date.now()}_${i}.jpg`);
                                const thumbRes = await axios.get(results[i].thumbnail, { responseType: 'arraybuffer' });
                                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                                attachments.push(fs.createReadStream(thumbPath));
                        }

                        return api.sendMessage({
                                body: getLang("choose", msg),
                                attachment: attachments
                        }, threadID, (err, info) => {
                                attachments.forEach(stream => { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); });
                                global.GoatBot.onReply.set(info.messageID, { 
                                        commandName, 
                                        author: senderID, 
                                        results,
                                        menuMessageID: info.messageID
                                });
                        }, messageID);

                } catch (e) {
                        return api.sendMessage(getLang("error", e.message), threadID, messageID);
                }
        },

        onReply: async function ({ event, api, Reply, getLang }) {
                const { results, author, menuMessageID } = Reply;
                if (event.senderID !== author) return;
                
                const targetMessageID = menuMessageID || Reply.messageID;
                
                const choice = parseInt(event.body);
                if (isNaN(choice) || choice <= 0 || choice > results.length) {
                        return api.unsendMessage(targetMessageID);
                }
                
                const videoID = results[choice - 1].id;
                
                api.unsendMessage(targetMessageID);
                api.setMessageReaction("⌛", event.messageID, () => {}, true);
               
                await handleDownload(api, event.threadID, event.messageID, videoID, getLang);
        }
};

async function handleDownload(api, threadID, messageID, videoID, getLang) {
        try {
                const res = await axios.get(`${await baseApiUrl()}/api/ytb/get?id=${videoID}&type=audio`);
                const { title, downloadLink } = res.data.data;
                
                const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
                const stream = response.data;
                stream.path = `music_${Date.now()}.mp3`;

                api.sendMessage({
                        body: getLang("success", title),
                        attachment: stream
                }, threadID, () => {
                        api.setMessageReaction("✅", messageID, () => {}, true);
                }, messageID);
        } catch (e) {
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
