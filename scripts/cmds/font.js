const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "font",
                aliases: ["style"],
                version: "2.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        en: "Convert your text into various stylish fonts",
                        vi: "Chuyển đổi văn bản của bạn thành nhiều phông chữ phong cách khác nhau"
                },
                category: "general",
                guide: {
                        en: '   {pn} <number> <text>: Get stylish text'
                                + '\n   {pn} list <page>: See all font styles',
                        vi: '   {pn} <số> <văn bản>: Nhận văn bản phong cách'
                                + '\n   {pn} list <page>: Xem tất cả danh sách phông chữ'
                }
        },

        langs: {
                en: {
                        noList: "× No font styles found.",
                        invalid: "× Invalid usage! Format: {pn} <number> <text>",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noList: "× Không tìm thấy kiểu phông chữ nào.",
                        invalid: "× Sử dụng sai! Định dạng: {pn} <số> <văn bản>",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        if (args[0] === "list") {
                                const page = args[1] && !isNaN(args[1]) ? args[1] : 1;
                                const response = await axios.get(`${await baseApiUrl()}/api/font/list?page=${page}`);
                                const fontList = response.data;
                                return fontList ? message.reply(fontList) : message.reply(getLang("noList"));
                        }

                        const [number, ...textParts] = args;
                        const text = textParts.join(" ");

                        if (!text || isNaN(number)) return message.reply(getLang("invalid"));
                        const response = await axios.get(`${await baseApiUrl()}/api/font?text=${encodeURIComponent(text)}&font=${number}`);
                        const convertedText = response.data.converted;
                        
                        if (!convertedText) return message.reply(getLang("noList"));
                        return message.reply(convertedText);

                } catch (err) {
                        console.error("Font Style Error:", err);
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
