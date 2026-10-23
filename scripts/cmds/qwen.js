const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "qwen",
                aliases: ["qwen7b"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "Qwen AI এর সাথে বুদ্ধিমত্তার সাথে চ্যাট করুন",
                        en: "Chat intelligently with Qwen AI",
                        vi: "Trò chuyện thông minh với Qwen AI"
                },
                category: "ai",
                guide: {
                        bn: '   {pn} <প্রশ্ন>: আপনার প্রশ্নটি লিখুন',
                        en: '   {pn} <question>: Type your question',
                        vi: '   {pn} <câu hỏi>: Nhập câu hỏi của bạn'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, কিছু তো জিজ্ঞাসা করো!",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN|"
                },
                en: {
                        noInput: "× Baby, please ask something!",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, hãy hỏi điều gì đó!",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang, commandName }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const prompt = args.join(" ");
                if (!prompt) return message.reply(getLang("noInput"));

                return module.exports.handleQwen({ api, event, prompt, getLang, commandName });
        },

        onReply: async function ({ api, event, Reply, getLang, commandName }) {
                if (Reply.author !== event.senderID) return;
                const prompt = event.body;
                if (!prompt) return;

                return module.exports.handleQwen({ api, event, prompt, getLang, commandName });
        },

        handleQwen: async function ({ api, event, prompt, getLang, commandName }) {
                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const baseUrl = await baseApiUrl();                   
                        const response = await axios.get(`${baseUrl}/api/ai`, {
                                params: {
                                        prompt: prompt,
                                        ai: "qwen"
                                }
                        });

                        const replyText = response.data.response || "No response received.";
                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return api.sendMessage(replyText, event.threadID, (error, info) => {
                                if (!error) {
                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName,
                                                author: event.senderID
                                        });
                                }
                        }, event.messageID);

                } catch (err) {
                        console.error("Qwen Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        const errorMsg = err.response?.data?.error || err.message;
                        return api.sendMessage(getLang("error", errorMsg), event.threadID, event.messageID);
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
