const axios = require("axios");

const baseApiUrl = async () => {
const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
return base.data.mahmud69;
};

module.exports = {
config: {
name: "autodl",
version: "3.8",
author: "Saan Exhausted",
countDown: 0,
role: 0,
description: {
en: "Auto download video from TikTok, Facebook, Instagram, YouTube, and more",
vi: "Tự động tải xuống video từ Tiktok, Facebook, Instagram, YouTube và nhiều hơn nữa"
},
category: "media",
guide: {
en: '   {pn} <video_link>: Automatically download videos from TikTok, YouTube, Twitter/X, Facebook, Instagram, Tumblr, Threads, Spotify, SoundCloud, Snapchat, Reddit, Pinterest, LinkedIn, Kuaishou, Kwai, Douyin, Dailymotion, CapCut, Bluesky, Terabox, Likee, Apple Music, and SnackVideo'
+ '\n   (Or use by replying to a message containing a link)'
+ '\n   {pn} list: Show all supported platforms',
vi: '   {pn} <video_link>: Tự động tải video từ TikTok, YouTube, Twitter/X, Facebook, Instagram, Tumblr, Threads, Spotify, SoundCloud, Snapchat, Reddit, Pinterest, LinkedIn, Kuaishou, Kwai, Douyin, Dailymotion, CapCut, Bluesky, Terabox, Likee, Apple Music và SnackVideo'
+ '\n   (Hoặc sử dụng bằng cách trả lời tin nhắn chứa liên kết)'
+ '\n   {pn} list: Hiển thị tất cả nền tảng được hỗ trợ'
}
},

langs: {
    en: {
        defaultCaption: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘\n\n• 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐒𝐀𝐀𝐍 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐄𝐃",
        error: "× Failed to download video."
    },
    vi: {
        defaultCaption: "Video Đã Tải Xuống\n\n• Author: SAAN EXHAUSTED",
        error: "× Không thể tải xuống video."
    }
},

onStart: async function ({ api, event, args }) {
    if (args[0] && args[0].toLowerCase() === "list") {
        return api.sendMessage(
            (await axios.get(`${await baseApiUrl()}/api/download/list`)).data,
            event.threadID,
            event.messageID
        );
    }
},

onChat: async function ({ api, event, getLang }) {
    const textInput = event.body ? event.body.trim() : "";

    try {
        const exactUrlMatch = textInput.match(/^https?:\/\/[^\s]+$/i);
        if (!exactUrlMatch) return;

        const url = exactUrlMatch[0];

        const supportedPlatforms = [
            "tiktok.com",
            "youtube.com",
            "youtu.be",
            "twitter.com",
            "x.com",
            "facebook.com",
            "fb.com",
            "fb.watch",
            "instagram.com",
            "instagr.am",
            "tumblr.com",
            "threads.net",
            "threads.com",
            "spotify.com",
            "spotify.link",
            "soundcloud.com",
            "snapchat.com",
            "snap.com",
            "reddit.com",
            "redd.it",
            "pinterest.com",
            "pin.it",
            "linkedin.com",
            "lnkd.in",
            "kuaishou.com",
            "kwai.com",
            "douyin.com",
            "dailymotion.com",
            "dai.ly",
            "capcut.com",
            "capcut.net",
            "bsky.app",
            "bsky.social",
            "terabox.com",
            "likee.video",
            "music.apple.com",
            "snackvideo.com",
            "sck.io"
        ];

        if (!supportedPlatforms.some(platform => url.includes(platform))) {
            return;
        }

        api.setMessageReaction("🐰", event.messageID, () => {}, true);

        const response = await axios.get(
            `${await baseApiUrl()}/api/download?url=${encodeURIComponent(url)}`
        );

        if (!response.data || !response.data.result) {
            throw new Error("Failed to download video");
        }

        const videoUrl = response.data.result;

        const videoStream = await global.utils.getStreamFromURL(
            videoUrl,
            "video.mp4"
        );

        api.setMessageReaction("🪽", event.messageID, () => {}, true);

        const isFacebook =
            url.includes("facebook.com") ||
            url.includes("fb.com") ||
            url.includes("fb.watch");

        const platform = isFacebook ? "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤" : "𝐕𝐢𝐝𝐞𝐨";

        const caption =
            `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 ${platform} 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘\n\n` +
            `• 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐒𝐀𝐀𝐍 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐄𝐃`;

        api.sendMessage(
            {
                body: caption,
                attachment: videoStream
            },
            event.threadID,
            event.messageID
        );

    } catch (error) {
        console.error("AutoDL Error:", error);
        api.setMessageReaction("❎", event.messageID, () => {}, true);
    }
}

};
