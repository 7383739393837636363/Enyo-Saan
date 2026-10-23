const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "cdp",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "র‍্যান্ডম কাপল ডিপি এবং ছবি পান",
                        en: "Get random couple profile pictures",
                        vi: "Lấy ảnh đại diện đôi ngẫu nhiên"
                },
                category: "love",
                guide: {
                        bn: '   {pn}: র‍্যান্ডম কাপল ডিপি পান'
                                + '\n   {pn} list: মোট কতগুলো ডিপি আছে দেখুন',
                        en: '   {pn}: Get a random couple DP'
                                + '\n   {pn} list: Check total available DPs',
                        vi: '   {pn}: Nhận ảnh đại diện đôi ngẫu nhiên'
                                + '\n   {pn} list: Kiểm tra tổng số ảnh có sẵn'
                }
        },

        langs: {
                bn: {
                        total: "🎀 মোট কাপল ডিপি সংখ্যা: %1",
                        noData: "× কোনো ডিপি খুঁজে পাওয়া যায়নি!",
                        success: "🎀 | এই নাও তোমাদের ডিপি বেবি <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        total: "🎀 Total Couple DPs: %1",
                        noData: "× No Couple DP found.",
                        success: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        total: "🎀 Tổng số ảnh đôi: %1",
                        noData: "× Không tìm thấy ảnh đôi nào.",
                        success: "🎀 | Ảnh đôi của các cưng đây <😘",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const baseURL = await mahmud();

                        // List logic
                        if (args[0] === "list") {
                                const res = await axios.get(`${baseURL}/api/cdp/list`);
                                return message.reply(getLang("total", res.data.total));
                        }

                        // Get CDP logic
                        const res = await axios.get(`${baseURL}/api/cdp`);
                        const { boy, girl } = res.data;

                        if (!boy || !girl) return message.reply(getLang("noData"));

                        const getStream = async (url) => {
                                const response = await axios({
                                        method: "GET",
                                        url,
                                        responseType: "stream",
                                        headers: { 'User-Agent': 'Mozilla/5.0' }
                                });
                                return response.data;
                        };

                        const attachments = [
                                await getStream(boy),
                                await getStream(girl)
                        ];

                        return message.reply({
                                body: getLang("success"),
                                attachment: attachments
                        });

                } catch (err) {
                        console.error("CDP Error:", err);
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
