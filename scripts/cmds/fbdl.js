const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
    const base = await axios.get(
        "https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json"
    );
    return base.data.mahmud69;
};

module.exports = {
    config: {
        name: "facebookdl",
        aliases: ["fbdl"],
        version: "1.8",
        author: "Saan",
        countDown: 10,
        role: 0,
        description: {
            bn: "ফেসবুক ভিডিও ডাউনলোড করুন",
            en: "Download videos from Facebook"
        },
        category: "media",
        guide: {
            bn: "{pn} <লিংক>: ফেসবুক ভিডিওর লিংক দিন\nঅথবা ভিডিও লিংকে রিপ্লাই দিয়ে {pn} লিখুন",
            en: "{pn} <link>: Download a Facebook video\nOr reply to a video link with {pn}"
        }
    },

    langs: {
        bn: {
            noLink: "× বেবি, একটি সঠিক ফেসবুক ভিডিও লিংক দাও অথবা লিংকে রিপ্লাই করো!",
            error: "× ভিডিও ডাউনলোড করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
        },
        en: {
            noLink: "× Baby, please provide a valid Facebook video link or reply to one!",
            error: "× Download error: %1. Contact SAAN for help."
        }
    },

    onStart: async function ({ api, message, args, event, getLang }) {
        const authorName = "Saan";

        if (this.config.author !== authorName) {
            return api.sendMessage(
                "You are not authorized to change the author name.",
                event.threadID,
                event.messageID
            );
        }

        const link = args.join(" ") || event.messageReply?.body;

        if (
            !link ||
            !/https?:\/\//i.test(link) ||
            !/(facebook\.com|fb\.watch|fb\.com)/i.test(link)
        ) {
            return message.reply(getLang("noLink"));
        }

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        const filePath = path.join(
            cacheDir,
            `fbdl_${Date.now()}.mp4`
        );

        try {
            api.setMessageReaction("🐤", event.messageID, () => {}, true);

            const base = await baseApiUrl();
            const apiUrl =
                `${base}/api/download?url=${encodeURIComponent(link)}`;

            const apiRes = await axios.get(apiUrl, {
                timeout: 60000
            });

            if (!apiRes.data || !apiRes.data.result) {
                throw new Error("Failed to fetch video URL from API");
            }

            const videoUrl = apiRes.data.result;

            const response = await axios.get(videoUrl, {
                responseType: "arraybuffer",
                timeout: 120000,
                maxContentLength: 100 * 1024 * 1024
            });

            fs.writeFileSync(filePath, Buffer.from(response.data));

            api.setMessageReaction("🪽", event.messageID, () => {}, true);

            return message.reply(
                {
                    body:
                        "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘\n\n" +
                        "• 𝐀𝐝𝐦𝐢𝐧: 𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
                    attachment: fs.createReadStream(filePath)
                },
                (err) => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    if (err) console.error("Facebook video send error:", err);
                }
            );
        } catch (err) {
            console.error("Error in facebookdl command:", err);

            api.setMessageReaction("❎", event.messageID, () => {}, true);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            return message.reply(
                getLang("error", err.message || "Unknown error")
            );
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
                    return data.message.reply(
                        "You are not authorized to change the author name."
                    );
                }

                return;
            }

            return original.apply(this, args);
        };
    }
                }
