const axios = require("axios");

const getBaseApi = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "deepseek",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ডিপসিক এআই এর মাধ্যমে আপনার প্রশ্নের উত্তর পান",
                        en: "Get answers from DeepSeek AI"
                },
                category: "ai",
                guide: {
                        bn: '   {pn} <প্রশ্ন>: যেকোনো কিছু জিজ্ঞাসা করুন\n   রিপ্লাইয়ের মাধ্যমে কথোপকথন চালিয়ে যেতে পারবেন',
                        en: '   {pn} <prompt>: Ask anything to AI\n   You can continue chat by replying'
                }
        },

        langs: {
                bn: {
                        noPrompt: "⚠️ বেবি, কিছু তো জিজ্ঞাসা করো! উদাহরণ: {pn} তুমি কে?",
                        noResponse: "× এআই থেকে কোনো উত্তর পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noPrompt: "⚠️ Baby, please provide a prompt! Example: {pn} Who are you?",
                        noResponse: "× No response from AI.",
                        error: "× API error: %1. Contact SAAN for help."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const prompt = args.join(" ");
                if (!prompt) return message.reply(getLang("noPrompt"));

                return await handleDeepSeek(api, event, prompt, this.config.name, getLang);
        },

        onReply: async function ({ api, event, Reply, args, getLang }) {
                if (Reply.author !== event.senderID) return;

                const prompt = args.join(" ");
                if (!prompt) return;

                return await handleDeepSeek(api, event, prompt, this.config.name, getLang);
        }
};

async function handleDeepSeek(api, event, prompt, commandName, getLang) {
        try {
                const baseApi = await getBaseApi();
                const apiUrl = `${baseApi}/api/deepseek?prompt=${encodeURIComponent(prompt)}`;
                const response = await axios.get(apiUrl);
                const replyText = response.data.response || getLang("noResponse");

                api.sendMessage(replyText, event.threadID, (error, info) => {
                        if (!error) {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: commandName,
                                        author: event.senderID,
                                        messageID: info.messageID
                                });
                        }
                }, event.messageID);

        } catch (err) {
                console.error("DeepSeek Error:", err);
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
