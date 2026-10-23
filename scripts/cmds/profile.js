const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "profile",
                aliases: ["pp", "dp", "pfp", "প্রোফাইল"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ব্যবহারকারীর প্রোফাইল পিকচার ডাউনলোড করুন",
                        en: "Fetch user's profile picture",
                        vi: "Tải ảnh đại diện của người dùng"
                },
                category: "utility",
                guide: {
                        bn: '   {pn}: নিজের প্রোফাইল পিকচার দেখুন'
                                + '\n   {pn} <@tag/reply/UID>: অন্যের প্রোফাইল পিকচার দেখুন',
                        en: '   {pn}: Fetch your profile picture'
                                + '\n   {pn} <@tag/reply/UID>: Fetch someone\'s profile picture',
                        vi: '   {pn}: Lấy ảnh đại diện của bạn'
                                + '\n   {pn} <@tag/reply/UID>: Lấy ảnh đại diện của người khác'
                }
        },

        langs: {
                bn: {
                        success: ">🎀 %1\nবেবি, এই নাও তোমার প্রোফাইল 😘",
                        error: "× প্রোফাইল পিকচার আনতে সমস্যা হয়েছে, Contact SAAN: %1",
                        invalid: "! সঠিক UID বা লিংক প্রদান করুন"
                },
                en: {
                        success: ">🎀 %1\n𝐁𝐚𝐛𝐲, 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 😘",
                        error: "× Could not fetch profile picture, Contact SAAN: %1",
                        invalid: "! Invalid UID or link"
                },
                vi: {
                        success: ">🎀 %1\nCưng ơi, ảnh đại diện của cưng đây 😘",
                        error: "× Không thể lấy ảnh đại diện, liên hệ SAAN: %1",
                        invalid: "! UID hoặc liên kết không hợp lệ"
                }
        },

        onStart: async function ({ api, message, args, event, getLang, usersData }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        let uid = event.senderID;

                        if (event.messageReply) {
                                uid = event.messageReply.senderID;
                        } else if (Object.keys(event.mentions).length > 0) {
                                uid = Object.keys(event.mentions)[0];
                        } else if (args[0]) {
                                if (!isNaN(args[0])) {
                                        uid = args[0];
                                } else if (args[0].includes("facebook.com/")) {
                                        const match = args[0].match(/(?:profile\.php\?id=|\/)([\d]+)/);
                                        if (match) uid = match[1];
                                }
                        }

                        if (!uid || isNaN(uid)) return message.reply(getLang("invalid"));

                        api.setMessageReaction("⌛", event.messageID, () => {}, true);

                        const baseUrl = await baseApiUrl();
                        const avatarURL = `${baseUrl}/api/pfp?mahmud=${uid}`;
                        const userName = await usersData.getName(uid);

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                        const cachePath = path.join(cacheDir, `pfp_${uid}.jpg`);

                        const response = await axios.get(avatarURL, { responseType: "arraybuffer" });
                        fs.writeFileSync(cachePath, Buffer.from(response.data));

                        return message.reply({
                                body: getLang("success", userName),
                                attachment: fs.createReadStream(cachePath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                        });

                } catch (err) {
                        console.error("Profile Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
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
