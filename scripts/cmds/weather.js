const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "weather",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "যেকোনো জায়গার আবহাওয়ার তথ্য দেখুন",
                        en: "Check weather information for any location",
                        vi: "Xem thông tin thời tiết cho bất kỳ địa điểm nào"
                },
                category: "utility",
                guide: {
                        bn: '   {pn} <জায়গার নাম>: (যেমন: {pn} Dhaka)',
                        en: '   {pn} <location>: (Ex: {pn} London)',
                        vi: '   {pn} <địa điểm>: (VD: {pn} Hanoi)'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, জায়গার নাম দাও!\n\nউদাহরণ: {pn} Dhaka",
                        notFound: "× দুঃখিত, %1 খুঁজে পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।",
                        today: "আজকের আবহাওয়া: %1\n%2\n🌡 সর্বনিম্ন - সর্বোচ্চ: %3°C - %4°C\n🌡 অনুভূত হবে: %5°C - %6°C\n🌅 সূর্যোদয়: %7\n🌄 সূর্যাস্ত: %8\n🌃 চন্দ্রোদয়: %9\n🏙 চন্দ্রাস্ত: %10\n🌞 দিন: %11\n🌙 রাত: %12"
                },
                en: {
                        noInput: "× Baby, please enter a location\n\nExample: {pn} Dhaka",
                        notFound: "× Location not found: %1",
                        error: "× API error: %1. Contact SAAN for help.",
                        today: "Today's weather: %1\n%2\n🌡 Low - high temperature %3°C - %4°C\n🌡 Feels like %5°C - %6°C\n🌅 Sunrise %7\n🌄 Sunset %8\n🌃 Moonrise %9\n🏙 Moonset %10\n🌞 Day: %11\n🌙 Night: %12"
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng nhập địa điểm\n\nVí dụ: {pn} Hanoi",
                        notFound: "× Không thể tìm thấy địa điểm: %1",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ.",
                        today: "Thời tiết hôm nay: %1\n%2\n🌡 Nhiệt độ thấp nhất - cao nhất %3°C - %4°C\n🌡 Nhiệt độ cảm nhận được %5°C - %6°C\n🌅 Mặt trời mọc %7\n🌄 Mặt trời lặn %8\n🌃 Mặt trăng mọc %9\n🏙 Mặt trăng lặn %10\n🌞 Ban ngày: %11\n🌙 Ban đêm: %12"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args.length) return message.reply(getLang("noInput"));

                const location = args.join(" ");
                const cachePath = path.join(__dirname, "cache", `weather_${event.threadID}.png`);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const apiBase = await mahmud();
                        const res = await axios.get(`${apiBase}/api/weather?location=${encodeURIComponent(location)}`);
                        const data = res.data;

                        if (data.success !== true) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return message.reply(getLang("notFound", location));
                        }

                        const d = data.data;
                        const msg = getLang(
                                "today",
                                d.area, d.headline, d.tempMin, d.tempMax, d.feelsMin, d.feelsMax,
                                d.sunrise, d.sunset, d.moonrise, d.moonset, d.day, d.night
                        );

                        if (!fs.existsSync(path.join(__dirname, "cache"))) {
                                fs.mkdirSync(path.join(__dirname, "cache"));
                        }

                        const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
                        fs.writeFileSync(cachePath, Buffer.from(base64Data, 'base64'));

                        await message.reply({
                                body: msg,
                                attachment: fs.createReadStream(cachePath)
                        });

                        if (fs.existsSync(cachePath)) {
                                fs.unlinkSync(cachePath);
                        }

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                } catch (err) {
                        console.error("Weather Error:", err);
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
