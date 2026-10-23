const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ckban",
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "মিডিয়া ব্যান স্ট্যাটাস চেক করুন",
                        en: "Check media ban status",
                        vi: "Kiểm tra trạng thái cấm phương tiện"
                },
                category: "general",
                guide: {
                        bn: '   {pn}: মিডিয়া চেক করতে ব্যবহার করুন',
                        en: '   {pn}: Use to check media status',
                        vi: '   {pn}: Sử dụng để kiểm tra trạng thái'
                }
        },

        langs: {
                bn: {
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN|",
                        banned: "❌ মিডিয়া ব্যানড করা হয়েছে!",
                        auth: "You are not authorized to change the author name."
                },
                en: {
                        error: "× API error: %1. Contact SAAN for help.",
                        banned: "❌ Media is banned!",
                        auth: "You are not authorized to change the author name."
                },
                vi: {
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ.",
                        banned: "❌ Phương tiện bị cấm!",
                        auth: "You are not authorized to change the author name."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage(getLang("auth"), event.threadID, event.messageID);
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const baseUrl = await baseApiUrl();
                        const res = await axios.get(`${baseUrl}/api/ckban`);

                        const apiImageUrl = res.data.url;

                        if (!res.data.banned && apiImageUrl) {
                                const imgStream = await axios({
                                        method: "GET",
                                        url: apiImageUrl,
                                        responseType: "stream",
                                        headers: {
                                                "User-Agent": "Mozilla/5.0"
                                        }
                                });

                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return message.reply({
                                        body: `✅ ${res.data.message || "Success"}`,
                                        attachment: imgStream.data
                                });
                        } else {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return message.reply(res.data.message || getLang("banned"));
                        }

                } catch (e) {
                        console.error("CKBAN Error:", e);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        const errorInfo = e.response?.data?.error || e.message;
                        return message.reply(getLang("error", errorInfo));
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
