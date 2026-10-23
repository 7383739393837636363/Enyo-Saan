const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "gemini",
                version: "3.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                category: "ai",
                guide: {
                        vi: "   {pn} <câu hỏi>: Hỏi bất cứ điều gì với AI"
                                + "\n   Hoặc phản hồi reply một hình ảnh kèm theo câu hỏi",
                        en: "   {pn} <prompt>: Ask anything to AI"
                                + "\n   Or reply to an image with a prompt"
                }
        },

        langs: {
                en: {
                        noPrompt: "• Baby, please provide a question\n\nExample: {pn} Who are you?",
                        noResponse: "× No response received from AI.",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noPrompt: "• Cưng ơi, vui lòng nhập câu hỏi! Ví dụ: {pn} Bạn là ai?",
                        noResponse: "× Không nhận được phản hồi từ AI.",
                        error: "× Lỗi API: %1. Liên hệ SAAN để được trợ giúp."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const prompt = args.join(" ");
                if (!prompt) return message.reply(getLang("noPrompt"));

                let imageUrl = "";
                if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
                        const attachment = event.messageReply.attachments[0];
                        if (attachment.type === "photo") {
                                imageUrl = attachment.url;
                        }
                }

                return await handleGemini(api, event, prompt, imageUrl, this.config.name, getLang);
        },

        onReply: async function ({ api, event, Reply, args, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (Reply.author !== event.senderID) return;
                
                const prompt = args.join(" ");
                if (!prompt) return;

                let imageUrl = "";
                if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
                        const attachment = event.messageReply.attachments[0];
                        if (attachment.type === "photo") {
                                imageUrl = attachment.url;
                        }
                }

                return await handleGemini(api, event, prompt, imageUrl, this.config.name, getLang);
        }
};

async function handleGemini(api, event, prompt, imageUrl, commandName, getLang) {
        try {
                const response = imageUrl 
                        ? await axios.get(`${await baseApiUrl()}/api/gemini?chat=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`)
                        : await axios.get(`${await baseApiUrl()}/api/gemini?chat=${encodeURIComponent(prompt)}`);

                const replyText = response.data.response || response.data.reply || getLang("noResponse");

                api.sendMessage(replyText, event.threadID, (error, info) => {
                        if (!error) {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: commandName,
                                        author: event.senderID,
                                        messageID: info.messageID,
                                        type: "reply"
                                });
                        }
                }, event.messageID);

        } catch (err) {
                api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
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
