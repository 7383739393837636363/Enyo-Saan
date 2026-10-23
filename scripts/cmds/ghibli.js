const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ghibli",
                aliases: ["ghib", "ghibliart"],
                version: "1.7",
                author: "Saan", // credit Change dile thapramu kintu.
                countDown: 10,
                role: 0,
                description: {
                        en: "Transform images into Ghibli art style",
                        bn: "ছবিকে ঘিবলি আর্ট স্টাইলে রূপান্তর করুন",
                        vi: "Chuyển đổi hình ảnh sang phong cách nghệ thuật Ghibli"
                },
                category: "Image gen",
                guide: {
                        en: "{pn} [style number] (Reply to an image) or {pn} list",
                        bn: "{pn} [স্টাইল নম্বর] (ছবিতে রিপ্লাই দিন) অথবা {pn} list",
                        vi: "{pn} [số kiểu] (Phản hồi một hình ảnh) hoặc {pn} list"
                }
        },

        langs: {
                bn: {
                        list_header: "𝐆𝐡𝐢𝐛𝐥𝐢 𝐒𝐭𝐲𝐥𝐞𝐬 𝐋𝐢𝐬𝐭:\n\n",
                        no_image: "অনুগ্রহ করে একটি ছবিতে রিপ্লাই দিন।",
                        generating: "🔄 | আপনার ইমেজ তৈরি হচ্ছে... স্টাইল: %1",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "✅ 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐆𝐡𝐢𝐛𝐥𝐢 𝐀𝐫𝐭\n\n• 𝐒𝐭𝐲𝐥𝐞: %1\n• 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐒𝐮𝐜𝐜𝐞𝐬𝐬"
                },
                en: {
                        list_header: "𝐆𝐡𝐢𝐛𝐥𝐢 𝐒𝐭𝐲𝐥𝐞𝐬 𝐋𝐢𝐬𝐭:\n\n",
                        no_image: "Please reply to an image.",
                        generating: "🔄 | Generating your image... Style: %1",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "✅ 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐆𝐡𝐢𝐛𝐥𝐢 𝐀𝐫𝐭\n\n• 𝐒𝐭𝐲𝐥𝐞: %1\n• 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐒𝐮𝐜𝐜𝐞𝐬𝐬"
                },
                vi: {
                        list_header: "𝐃𝐚𝐧𝐡 𝐬á𝐜𝐡 𝐩𝐡𝐨𝐧𝐠 𝐜á𝐜𝐡 𝐆𝐡𝐢𝐛𝐥𝐢:\n\n",
                        no_image: "Vui lòng phản hồi một hình ảnh.",
                        generating: "🔄 | Đang tạo hình ảnh của bạn... Kiểu: %1",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "✅ 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐆𝐡𝐢𝐛𝐥𝐢 𝐀𝐫𝐭\n\n• 𝐒𝐭𝐲𝐥𝐞: %1\n• 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐒𝐮𝐜𝐜𝐞𝐬𝐬"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                const cacheDir = path.join(__dirname, "cache");
                const cachePath = path.join(cacheDir, `ghibli_${threadID}_${Date.now()}.png`);
                let waitMsg;

                try {
                        const baseUrl = await baseApiUrl();
                        const apiEndpoint = `${baseUrl}/api/ghibli`;

                        if (args[0] === "list") {
                                const res = await axios.get(`${apiEndpoint}/list`);
                                const styles = res.data.styles;
                                let text = getLang("list_header");
                                for (const key in styles) {
                                        text += `${key}: ${styles[key]}\n`;
                                }
                                return message.reply(text);
                        }

                        const replied = event.messageReply?.attachments?.[0];
                        if (!replied || replied.type !== "photo") {
                                return message.reply(getLang("no_image"));
                        }

                        const style = args[0] || "1";
                        const imageUrl = encodeURIComponent(replied.url);

                        api.setMessageReaction("⏳", messageID, () => { }, true);
                        waitMsg = await message.reply(getLang("generating", style));

                        const res = await axios({
                                url: `${apiEndpoint}?imageUrl=${imageUrl}&style=${style}`,
                                method: "GET",
                                responseType: "arraybuffer",
                                timeout: 180000
                        });

                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        fs.writeFileSync(cachePath, Buffer.from(res.data, "binary"));
                        
                        if (waitMsg) message.unsend(waitMsg.messageID);

                        const body = getLang("success", style);

                        return message.reply({
                                body: body,
                                attachment: fs.createReadStream(cachePath)
                        }, () => { 
                                api.setMessageReaction("🪽", messageID, () => { }, true);
                                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); 
                        });

                } catch (err) {
                        if (waitMsg) message.unsend(waitMsg.messageID);
                        api.setMessageReaction("❌", messageID, () => { }, true);
                        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                        return message.reply(getLang("error", err.message || "API Error"));
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
