module.exports = {
        config: {
                name: "inbox",
                aliases: ["in", "ইনবক্স"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ইউজারকে ইনবক্সে মেসেজ পাঠান",
                        en: "Send a message to the user's inbox",
                        vi: "Gửi tin nhắn vào hộp thư đến của người dùng"
                },
                category: "system",
                guide: {
                        bn: '   {pn}',
                        en: '   {pn}',
                        vi: '   {pn}'
                }
        },

        langs: {
                bn: {
                        reply: "বেবি তোমার ইনবক্স চেক করো 🐤",
                        inboxMsg: "হাই বেবি 😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        reply: "Baby, check your inbox 🐤",
                        inboxMsg: "Hi baby 😘",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        reply: "Cưng ơi, kiểm tra hộp thư đến nhé 🐤",
                        inboxMsg: "Chào cưng 😘",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        
                        await message.reply(getLang("reply"));

                        await api.sendMessage(getLang("inboxMsg"), event.senderID);

                } catch (error) {
                        console.error("Inbox Error:", error);
                  
                        return message.reply(getLang("error", error.message));
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
