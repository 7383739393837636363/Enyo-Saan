const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "github",
                aliases: ["git"],
                version: "2.7",
                author: "Saan",
                countDown: 10,
                category: "github",
                description: {
                        bn: "গিটহাব ইউজারের তথ্য দেখুন",
                        en: "View GitHub user information",
                        vi: "Xem thông tin người dùng GitHub"
                },
                guide: {
                        bn: "• {pn} <username>: গিটহাব ইউজারনেম লিখে সার্চ করুন",
                        en: "• {pn} <username>: Type GitHub username",
                        vi: "• {pn} <username>: Nhập tên người dùng GitHub"
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, একটি গিটহাব ইউজারনেম তো দাও!\n\nউদাহরণ: {pn} Saan-Ngl",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN|",
                        websiteLabel: "\n• ওয়েবসাইট: %1",
                        twitterLabel: "\n• টুইটার: %1",
                        facebookLabel: "\n• ফেসবুক: %1",
                        whatsappLabel: "\n• হোয়াটসঅ্যাপ: %1",
                        ageFormat: "%1 years, %2 months, %3 days",
                        info: `>🎀 %1 GITHUB INFO\n• ইউজারনেম: %2\n• আইডি: %3\n• টাইপ: %4\n• ভেরিফাইড: %5\n• বায়ো: %6\n• প্রিয় ভাষা: %7\n\n#AUDIENCE\n• ফলোয়ার: %8\n• ফলোয়িং: %9\n\n#CONTACT\n• পাবলিক ইমেইল: %10\n• লোকেশন: %11%12%13%14%15\n\n📦 REPOSITORY STATS\n• পাবলিক রিপো: %16\n• টোটাল ফর্ক: %17\n• টোটাল স্টার: %18\n• কোড সাইজ: %19 MB\n\n#TOP REPO\n• রিপো নাম: %20\n• স্টার: %21 | ফর্ক: %22\n• রিপো লিঙ্ক: %23\n\n#ACTIVITY\n• জয়েনিং: %24\n• একাউন্ট বয়স: %25\n• লাস্ট প্রোফাইল আপডেট: %26`
                },
                en: {
                        noInput: "× Baby, please provide a GitHub username!\n\nExample: {pn} Saan-Ngl",
                        error: "× API error: %1. Contact SAAN for help.",
                        websiteLabel: "\n• Website: %1",
                        twitterLabel: "\n• Twitter: %1",
                        facebookLabel: "\n• Facebook: %1",
                        whatsappLabel: "\n• WhatsApp: %1",
                        ageFormat: "%1 years, %2 months, %3 days",
                        info: `>🎀 %1 GITHUB INFO\n• Username: %2\n• ID: %3\n• Type: %4\n• Verified: %5\n• Bio: %6\n• Top Language: %7\n\n#AUDIENCE\n• Followers: %8\n• Following: %9\n\n#CONTACT\n• Public Email: %10\n• Location: %11%12%13%14%15\n\n#REPO STATS\n• Public Repos: %16\n• Total Forks: %17\n• Total Stars: %18\n• Code Size: %19 MB\n\n#TOP REPO\n• Repo Name: %20\n• Star: %21\n• Fork: %22\n• Repo Link: %23\n\n#ACTIVITY\n• Joined: %24\n• Account Age: %25\n• Last Profile Update: %26`
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên người dùng GitHub!\n\nVí dụ: {pn} Saan-Ngl",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ.",
                        websiteLabel: "\n• Trang web: %1",
                        twitterLabel: "\n• Twitter: %1",
                        facebookLabel: "\n• Facebook: %1",
                        whatsappLabel: "\n• WhatsApp: %1",
                        ageFormat: "%1 năm, %2 tháng, %3 ngày",
                        info: `>🎀 %1 THÔNG TIN GITHUB\n• Tên người dùng: %2\n• ID: %3\n• Loại: %4\n• Xác minh: %5\n• Tiểu sử: %6\n• Ngôn ngữ: %7\n\n#AUDIENCE\n• Người theo dõi: %8\n• Đang theo dõi: %9\n\n#CONTACT\n• Email: %10\n• Vị trí: %11%12%13%14%15\n\n📦 REPOSITORY STATS\n• Repos công khai: %16\n• Tổng số Fork: %17\n• Tổng số Sao: %18\n• Kích thước mã: %19 MB\n\n#TOP REPO\n• Tên: %20\n• Sao: %21 | Fork: %22\n• Liên kết: %23\n\n#ACTIVITY\n• Tham gia: %24\n• Tuổi tài khoản: %25\n• Cập nhật lần cuối: %26`
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const username = args[0];
                if (!username) return api.sendMessage(getLang("noInput"), event.threadID, event.messageID);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const res = await axios.get(`${await baseApiUrl()}/api/github?user=${encodeURIComponent(username)}`);
                        const d = res.data.data;

                        const websiteStr = (d.contact.website && d.contact.website !== "N/A") 
                                ? getLang("websiteLabel", d.contact.website) 
                                : "";
                        const twitterStr = (d.contact.twitter && d.contact.twitter !== "N/A") 
                                ? getLang("twitterLabel", d.contact.twitter) 
                                : "";
                        const facebookStr = (d.contact.facebook && d.contact.facebook !== "N/A") 
                                ? getLang("facebookLabel", d.contact.facebook) 
                                : "";
                        const whatsappStr = (d.contact.whatsapp && d.contact.whatsapp !== "N/A") 
                                ? getLang("whatsappLabel", d.contact.whatsapp) 
                                : "";

                        const ageObj = d.meta.account_age || { years: 0, months: 0, days: 0 };
                        const ageStr = getLang("ageFormat", ageObj.years, ageObj.months, ageObj.days);

                        const infoText = getLang("info", 
                                d.profile.name || d.profile.username,
                                d.profile.username, d.profile.id, d.profile.type,
                                d.profile.is_staff ? "GitHub Staff" : "No", d.profile.bio || "N/A", d.stats.favorite_language,
                                d.stats.followers, d.stats.following,
                                d.contact.email || "Not Found", d.contact.location || "N/A",
                                websiteStr, twitterStr, facebookStr, whatsappStr,
                                d.stats.public_repos, d.stats.total_forks, d.stats.total_stars, d.stats.code_size_mb,
                                d.highlights.top_repo ? d.highlights.top_repo.name : "N/A",
                                d.highlights.top_repo ? d.highlights.top_repo.stars : "0",
                                d.highlights.top_repo ? d.highlights.top_repo.forks : "0",
                                d.highlights.top_repo ? d.highlights.top_repo.url : "N/A",
                                new Date(d.meta.joined_at).toDateString(), ageStr, new Date(d.meta.updated_at).toDateString()
                        );

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return api.sendMessage({
                                body: infoText,
                                attachment: await global.utils.getStreamFromURL(d.profile.avatar)
                        }, event.threadID, event.messageID);

                } catch (err) {
                        console.error("Github Error:", err);
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
