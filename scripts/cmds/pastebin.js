const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "pastebin",
                version: "2.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Upload command file or custom text to your API pastebin",
                        vi: "Tải tệp lệnh hoặc văn bản tùy chỉnh lên pastebin API của bạn"
                },
                category: "utility",
                guide: {
                        en: '   • File upload: {pn} <cmd name>\n   • Custom text: {pn} create <title> | <text/code>\n   • Message reply: Reply to a message with {pn} <title>',
                        vi: '   • Tải lên tệp: {pn} <tên lệnh>\n   • Văn bản tùy chỉnh: {pn} create <tiêu đề> | <văn bản/mã>\n   • Trả lời tin nhắn: Trả lời tin nhắn bằng {pn} <tiêu đề>'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, please enter a command name or use 'create <title> | <text>'!",
                        notFound: "× File not found: %1.js",
                        formatError: "× Invalid format for custom paste! Use:\n{pn} create <title> | <text/code>",
                        success: "✅ Upload Successful!\n\n• Title: %1\n• Raw Link: %2",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Cưng ơi, hãy nhập tên lệnh hoặc dùng 'create <tiêu đề> | <văn bản>'!",
                        notFound: "× Không tìm thấy tệp: %1.js",
                        formatError: "× Định dạng không hợp lệ! Sử dụng:\n{pn} create <tiêu đề> | <văn bản/mã>",
                        success: "✅ Tải lên thành công!\n\n• Tiêu đề: %1\n• Liên kết thô: %2",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let uploadTitle = "";
                let uploadText = "";

                if (args[0] && args[0].toLowerCase() === "create") {
                        const content = args.slice(1).join(" ");
                        if (!content.includes("|")) {
                                return message.reply(getLang("formatError"));
                        }
                        const parts = content.split("|");
                        uploadTitle = parts[0].trim();
                        uploadText = parts.slice(1).join("|").trim();
                } 
                else if (event.type === "message_reply" && event.messageReply.body) {
                        uploadTitle = args.join(" ") || "Custom Paste";
                        uploadText = event.messageReply.body;
                } 
                else {
                        const fileName = args[0];
                        if (!fileName) return message.reply(getLang("noInput"));

                        const filePath = path.join(__dirname, "..", "cmds", fileName.endsWith(".js") ? fileName : fileName + ".js");

                        if (!fs.existsSync(filePath)) {
                                return api.sendMessage(getLang("notFound", fileName), event.threadID, event.messageID);
                        }

                        uploadTitle = fileName;
                        uploadText = fs.readFileSync(filePath, "utf8");
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const response = await axios.post(`${await baseApiUrl()}/api/pastebin`, {
                                text: uploadText,
                                title: uploadTitle
                        });

                        if (response.data && response.data.success) {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return api.sendMessage(
                                        getLang("success", response.data.title || uploadTitle, response.data.rawPaste),
                                        event.threadID,
                                        event.messageID
                                );
                        } else {
                                throw new Error(response.data.message || "Upload failed");
                        }

                } catch (err) {
                        console.error("Pastebin Error:", err);
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
