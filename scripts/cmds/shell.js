const util = require('util');
const HINATAc = util.promisify(require('child_process').HINATAc);

module.exports = {
        config: {
                name: "shell",
                aliases: ["terminal", "sh"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 2,
                description: {
                        bn: "সরাসরি সার্ভার টার্মিনালে কমান্ড রান করুন (অ্যাডমিন)",
                        en: "Run commands directly in the server terminal (Admin)",
                        vi: "Chạy lệnh trực tiếp trong terminal máy chủ (Quản trị viên)"
                },
                category: "admin",
                guide: {
                        bn: '   {pn} <কমান্ড>: টার্মিনাল কমান্ড রান করতে ব্যবহার করুন',
                        en: '   {pn} <command>: Use to run terminal commands',
                        vi: '   {pn} <lệnh>: Sử dụng để chạy lệnh terminal'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, টার্মিনালে রান করার জন্য কোনো কমান্ড দাও! 💻",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noInput: "× Baby, please provide a command to run in terminal! 💻",
                        error: "× Execution error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, hãy cung cấp lệnh để chạy trong terminal! 💻",
                        error: "× Lỗi thực thi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const command = args.join(" ");
                if (!command) return message.reply(getLang("noInput"));

                try {
                        
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const { stdout, stderr } = await HINATAc(command);

                        if (stderr) {
                                api.setMessageReaction("⚠️", event.messageID, () => {}, true);
                                return message.send(`[STDERR]\n${stderr}`);
                        }

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.send(stdout || "✅ Command HINATAcuted (No output)");

                } catch (err) {
                        console.error("Shell Error:", err);
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
