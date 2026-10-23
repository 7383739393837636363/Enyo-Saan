const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmhd = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "write",
                aliases: ["wr", "লিখুন"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ছবির ওপর রঙিন টেক্সট লিখুন",
                        en: "Write colored text on a replied image"
                },
                category: "image",
                guide: {
                        bn: '   {pn} <color_code> - <text>: ছবির রিপ্লাইয়ে লিখুন'
                                + '\n   {pn} list: কালার কোডগুলোর লিস্ট দেখুন'
                                + '\n   উদাহরণ: {pn} r - Hello Baby',
                        en: '   {pn} <color_code> - <text>: Reply to an image'
                                + '\n   {pn} list: See available color codes'
                                + '\n   Example: {pn} r - Hello Baby'
                }
        },

        langs: {
                bn: {
                        colorList: "🎨 সহজ কালার কোডসমূহ:\n%1\n\nকিছু না দিলে ডিফল্ট 'white' হবে।",
                        noReply: "× বেবি, একটি ছবিতে রিপ্লাই দিয়ে কমান্ডটি ব্যবহার করো!",
                        noText: "× ছবিতে কি লিখবো সেটা তো বলো! (যেমন: r - text)",
                        apiError: "⚠️ | রিমোট এপিআই এই মুহূর্তে বন্ধ আছে।",
                        error: "× টেক্সট লিখতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        colorList: "🎨 Available short codes:\n%1\n\nDefault is white if not specified.",
                        noReply: "× Baby, please reply to an image first!",
                        noText: "× Please provide text to write! (Example: r - text)",
                        apiError: "⚠️ | Remote API unavailable — try again later.",
                        error: "× Failed to write text: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const colorMap = {
                        b: "black", w: "white", r: "red", bl: "blue",
                        g: "green", y: "yellow", o: "orange", p: "purple", pk: "pink"
                };

                if (args[0]?.toLowerCase() === "list") {
                        const list = Object.entries(colorMap).map(([s, f]) => `${s} → ${f}`).join("\n");
                        return message.reply(getLang("colorList", list));
                }

                if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0].url) {
                        return message.reply(getLang("noReply"));
                }

                let input = args.join(" ").trim();
                let color = "white";
                let text = input;

                if (input.includes(" - ")) {
                        const parts = input.split(" - ");
                        color = colorMap[parts[0].trim().toLowerCase()] || parts[0].trim();
                        text = parts.slice(1).join(" - ").trim();
                }

                if (!text) return message.reply(getLang("noText"));

                const imageUrl = event.messageReply.attachments[0].url;
                const cacheDir = path.join(__dirname, "cache");
                const tempPath = path.join(cacheDir, `write_${Date.now()}.png`);

                try {
                        await fs.ensureDir(cacheDir);
                        const baseApi = await mahmhd();
                        if (!baseApi) return message.reply(getLang("apiError"));

                        const apiUrl = `${baseApi}/api/write?imageUrl=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(text)}&color=${encodeURIComponent(color)}`;
                        const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 20000 });

                        await fs.writeFile(tempPath, Buffer.from(response.data));

                        return message.reply({
                                attachment: fs.createReadStream(tempPath)
                        }, () => {
                                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                        });

                } catch (err) {
                        console.error("Write command error:", err);
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
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
