const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud69;
};

module.exports = {
        config: {
                name: "alldl",
                aliases: ["download", "dl"],
                version: "2.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Download videos from any social media",
                        vi: "Tải xuống video từ bất kỳ mạng xã hội nào"
                },
                category: "media",
                guide: {
                        en: '   {pn} <link>: Provide the video link'
                                + '\n   Or reply to a link with {pn}'
                                + '\n\nSupported Platforms:\n• TikTok\n• YouTube / Shorts\n• Facebook / FB Watch\n• Instagram / Reels\n• Twitter (X)\n• Threads\n• Snapchat\n• Pinterest\n• Spotify\n• SoundCloud\n• Reddit\n• LinkedIn\n• CapCut\n• Dailymotion\n• Kwai / Kuaishou\n• Douyin\n• Bluesky\n• Tumblr',
                        vi: '   {pn} <link>: Cung cấp liên kết video'
                                + '\n   Hoặc trả lời một liên kết bằng {pn}'
                                + '\n\nSupported Platforms:\n• TikTok\n• YouTube / Shorts\n• Facebook / FB Watch\n• Instagram / Reels\n• Twitter (X)\n• Threads\n• Snapchat\n• Pinterest\n• Spotify\n• SoundCloud\n• Reddit\n• LinkedIn\n• CapCut\n• Dailymotion\n• Kwai / Kuaishou\n• Douyin\n• Bluesky\n• Tumblr'
                }
        },

        langs: {
                en: {
                        noLink: "× Baby, please provide a valid video link or reply to one!",
                        error: "× Download error: %1. Contact SAAN for help."
                },
                vi: {
                        noLink: "× Bé ơi, vui lòng cung cấp liên kết video hợp lệ hoặc trả lời một liên kết!",
                        error: "× Lỗi tải xuống: %1. Liên hệ SAAN để được giúp đỡ."
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
                        mahmud.includes("tiktok.com") ||
                        mahmud.includes("youtube.com") || 
                        mahmud.includes("youtu.be") ||
                        mahmud.includes("twitter.com") || 
                        mahmud.includes("x.com") ||
                        mahmud.includes("facebook.com") || 
                        mahmud.includes("fb.watch") ||
                        mahmud.includes("instagram.com") ||
                        mahmud.includes("tumblr.com") ||
                        mahmud.includes("threads.net") ||
                        mahmud.includes("spotify.com") ||
                        mahmud.includes("soundcloud.com") ||
                        mahmud.includes("snapchat.com") ||
                        mahmud.includes("reddit.com") ||
                        mahmud.includes("pinterest.com") || 
                        mahmud.includes("pin.it") ||
                        mahmud.includes("linkedin.com") ||
                        mahmud.includes("kuaishou.com") || 
                        mahmud.includes("kwai.com") ||
                        mahmud.includes("douyin.com") ||
                        mahmud.includes("dailymotion.com") || 
                        mahmud.includes("dai.ly") ||
                        mahmud.includes("capcut.com") ||
                        mahmud.includes("bsky.app")
                )) {
                        return message.reply(getLang("noLink"));
                }

                if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");
                const path = __dirname + `/cache/alldl_${Date.now()}.mp4`;

                try {
                        api.setMessageReaction("🐤", event.messageID, () => {}, true);
                        
                        const response = await axios.get(`${await baseApiUrl()}/api/download?url=${encodeURIComponent(mahmud)}`);
                        if (!response.data || !response.data.result) {
                                throw new Error("Failed to fetch video URL from API");
                        }

                        const videoUrl = response.data.result;
                        const caption = response.data.cp || "Downloaded Video"; 

                        const vidRes = await axios({
                                method: 'get',
                                url: videoUrl,
                                responseType: 'arraybuffer'
                        });

                        fs.writeFileSync(path, Buffer.from(vidRes.data, "binary"));

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);
                        return message.reply(
                                {
                                        body: caption,
                                        attachment: fs.createReadStream(path)
                                },
                                () => fs.unlinkSync(path)
                        );

                } catch (err) {
                        console.error("Error in alldl command:", err);
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
