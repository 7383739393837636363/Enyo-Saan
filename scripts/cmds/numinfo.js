const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "numinfo",
                aliases: ["numberinfo", "numlookup"],
                version: "1.7",
                author: "Saan",
                role: 0,
                category: "info",
                cooldown: 10,
                guide: {
                        en: "{pn} [number]",
                        bn: "{pn} [নাম্বার]",
                        vi: "{pn} [số điện thoại]"
                }
        },

        langs: {
                bn: {
                        noNumber: "• বেবি, নাম্বার দাও! উদাহরণ: {pn} 01836298139",
                        invalid: "❌ নাম্বারটি সঠিক নয়!",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "📱 নাম্বারের তথ্য:\n\n• নাম: %1\n• নাম্বার: %2\n• ফেসবুক আইডি: %3"
                },
                en: {
                        noNumber: "• Baby, provide a number. Example: {pn} 01836298139",
                        invalid: "❌ Invalid number format!",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "📱 Number Info:\n\n• Name: %1\n• Number: %2\n• FB ID: %3"
                },
                vi: {
                        noNumber: "• Cưng ơi, hãy cung cấp số điện thoại. Ví dụ: {pn} 01836298139",
                        invalid: "❌ Định dạng số không hợp lệ!",
                        error: "❌ An error occurred: contact SAAN %1",
                        success: "📱 Thông tin số:\n\n• Tên: %1\n• Số: %2\n• FB ID: %3"
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                if (!args[0]) return api.sendMessage(getLang("noNumber").replace("{pn}", this.config.name), threadID, messageID);

                let number = args.join("").replace(/\D/g, "");
                if (number.startsWith("0")) {
                        number = "88" + number;
                } else if (!number.startsWith("88")) {
                        return api.sendMessage(getLang("invalid"), threadID, messageID);
                }

                try {
                        api.setMessageReaction("⏳", messageID, () => { }, true);

                        const apiUrl = await baseApiUrl();
                        const response = await axios.get(`${apiUrl}/api/numinfo?number=${number}`);
                        const data = response.data;

                        if (!data.success) throw new Error("API failed to fetch data");

                        const msg = getLang("success", data.name, number, data.facebook_id);

                        api.sendMessage(msg, threadID, () => {
                                api.setMessageReaction("✅", messageID, () => { }, true);
                        }, messageID);

                } catch (err) {
                        api.setMessageReaction("❌", messageID, () => { }, true);
                        api.sendMessage(getLang("error", err.message || "API Error"), threadID, messageID);
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
