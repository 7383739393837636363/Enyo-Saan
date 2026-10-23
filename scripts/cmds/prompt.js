const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "prompt",
                aliases: ["p"],
                version: "3.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Generate AI image prompt for Midjourney, Flux, DALL-E, SD, Ideogram, Firefly, Gemini, or GPT",
                        vi: "Tạo lời nhắc hình ảnh cho Midjourney, Flux, DALL-E, SD, Ideogram, Firefly, Gemini, hoặc GPT"
                },
                category: "ai",
                guide: {
                        en: "   {pn} [--mj|--flux|--dalle|--sd|--ideo|--ff|--gemini|--gpt] [text]: Reply to an image to generate prompt"
                                + "\n   Example:"
                                + "\n    {pn}"
                                + "\n    {pn} --flux"
                                + "\n    {pn} --dalle cat with hat",
                        vi: "   {pn} [--mj|--flux|--dalle|--sd|--ideo|--ff|--gemini|--gpt] [văn bản]: Phản hồi hình ảnh để tạo lời nhắc"
                }
        },

        langs: {
                en: {
                        noImg: "× Baby, please reply to an image.",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noImg: "× Cưng ơi, vui lòng phản hồi một hình ảnh để sử dụng",
                        error: "× Lỗi: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!(event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo")) {
                        return message.reply(getLang("noImg"));
                }

                let model = "mj";
                let hasFlag = true;

                switch (args[0]?.toLowerCase()) {
                        case "--flux":
                        case "-flux":
                        case "flux":
                                model = "flux";
                                break;
                        case "--dalle":
                        case "-dalle":
                        case "--dall":
                        case "-dall":
                        case "dalle":
                                model = "dalle";
                                break;
                        case "--sd":
                        case "-sd":
                        case "sd":
                        case "sdxl":
                                model = "sd";
                                break;
                        case "--ideo":
                        case "-ideo":
                        case "--ideogram":
                        case "-ideogram":
                        case "ideogram":
                                model = "ideogram";
                                break;
                        case "--ff":
                        case "-ff":
                        case "--firefly":
                        case "-firefly":
                        case "firefly":
                                model = "firefly";
                                break;
                        case "--gemini":
                        case "-gemini":
                        case "gemini":
                                model = "gemini";
                                break;
                        case "--gpt":
                        case "-gpt":
                        case "gpt":
                                model = "gpt";
                                break;
                        case "--mj":
                        case "-mj":
                        case "mj":
                        case "midjourney":
                                model = "mj";
                                break;
                        default:
                                hasFlag = false;
                                break;
                }

                const input = hasFlag ? args.slice(1).join(" ") : args.join(" ");
                const imageUrl = event.messageReply.attachments[0].url;

                try {
                        api.setMessageReaction("⌛", event.messageID, () => {}, true);

                        const response = await axios.get(`${await mahmud()}/api/prompt?prompt=${encodeURIComponent(input.trim())}&url=${encodeURIComponent(imageUrl)}&model=${model}`
                        );

                        const replyText = response.data.response || response.data.error || "No response";
                        message.reply(replyText);
                        return api.setMessageReaction("🪽", event.messageID, () => {}, true);

                } catch (err) {
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
