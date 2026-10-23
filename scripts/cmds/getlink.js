const axios = require("axios");

const baseApiUrl = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "getlink",
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো মিডিয়া ফাইল থেকে সরাসরি লিঙ্ক বা শর্ট লিঙ্ক তৈরি করুন",
                        en: "Generate direct or short links from any media file",
                        vi: "Tạo liên kết trực tiếp hoặc rút gọn từ bất kỳ tệp phương tiện nào"
                },
                category: "tools",
                guide: {
                        bn: '   {pn} [মিডিয়াতে রিপ্লাই দিন] (অপশনাল: tinyurl, imgbb, imgur, catbox)',
                        en: '   {pn} [reply to media] (Optional: tinyurl, imgbb, imgur, catbox)',
                        vi: '   {pn} [phản hồi phương tiện] (Tùy chọn: tinyurl, imgbb, imgur, catbox)'
                }
        },

        langs: {
                bn: {
                        noInput: "❌ | আগে একটি ছবি / ভিডিও / অডিওতে রিপ্লাই দাও বেবি!",
                        success: "✅ | এই নাও তোমার %1 লিঙ্ক <😘\n\n",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noInput: "❌ | Reply to an image / video / audio first, baby!",
                        success: "✅ | Here is your %1 url <😘\n\n",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "❌ | Vui lòng phản hồi ảnh / video / âm thanh trước, cưng ơi!",
                        success: "✅ | Đây là liên kết %1 của bạn <😘\n\n",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const { messageReply, type } = event;
                        if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
                                return message.reply(getLang("noInput"));
                        }

                        api.setMessageReaction("⌛", event.messageID, () => {}, true);
                        const input = args[0]?.toLowerCase();
                        const base = await baseApiUrl();
                        let num = 0;
                        let msg = "";
                        let typeLink = "direct link";

                        if (["tinyurl", "t", "--t"].includes(input)) {
                                typeLink = "tinyurl";
                                msg = getLang("success", "tinyurl");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${base}/api/tinyurl?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                        } 
                        else if (["imgbb", "i", "--i"].includes(input)) {
                                typeLink = "imgbb";
                                msg = getLang("success", "imgbb");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${base}/api/imgbb?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                        } 
                        else if (["imgur", "imgururl"].includes(input)) {
                                typeLink = "imgur";
                                msg = getLang("success", "imgur");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${base}/api/imgur?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                        } 
                        else if (["catbox", "cb", "c", "--c"].includes(input)) {
                                typeLink = "catbox";
                                msg = getLang("success", "catbox");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${base}/api/catbox?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                        } 
                        else {
                                msg = getLang("success", "direct link");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        msg += `${num}: ${att.url}\n`;
                                }
                        }

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.reply(msg);

                } catch (err) {
                        console.error("Getlink Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        const errorMsg = err.response?.data?.error || err.message;
                        return message.reply(getLang("error", errorMsg));
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
