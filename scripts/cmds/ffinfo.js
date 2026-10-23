const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ffinfo",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ফ্রি ফায়ার প্লেয়ারের বিস্তারিত তথ্য দেখুন",
                        en: "Get full Free Fire player information",
                        vi: "Lấy thông tin chi tiết người chơi Free Fire"
                },
                category: "game",
                guide: {
                        bn: '   {pn} [UID]: প্লেয়ার আইডি দিন',
                        en: '   {pn} [UID]: Provide player UID',
                        vi: '   {pn} [UID]: Cung cấp UID người chơi'
                }
        },

        langs: {
                bn: {
                        noUid: "• দয়া করে একটি ফ্রি ফায়ার UID দিন।",
                        notFound: "× প্লেয়ার খুঁজে পাওয়া যায়নি!",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noUid: "• Please provide a Free Fire UID.\n\nexample: !ffinfo 404394256",
                        notFound: "× Player not found!",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noUid: "• Vui lòng cung cấp UID Free Fire.",
                        notFound: "× Không tìm thấy người chơi!",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);

                try {
                        const uid = args[0]; if (!uid) return message.reply(getLang("noUid"));
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const baseURL = await mahmud();
                        const res = await axios.get(`${baseURL}/api/ffinfo?uid=${uid}`);
                        const data = res.data;

                        if (!data || !data.success) { 
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return message.reply(getLang("notFound")); 
                        }

                        const b = data.basicInfo || {}, g = data.guildInfo || {}, p = data.petInfo || {}, s = data.socialInfo || {}, c = data.creditScore || {};
                        const poweredBy = data.poweredBy;

                        const msg = `#PLAYER INFO\n• Name: ${b.name || "N/A"}\n• UID: ${b.uid || uid}\n• Region: ${b.region || "N/A"}\n• Level: ${b.level || "N/A"}\n• Likes: ${b.likes || "0"}\n• EXP: ${b.exp || "0"}\n\n#RANK INFO\n• BR Rank: ${b.rank || "N/A"}\n• BR Points: ${b.rankPoints || "0"}\n• CS Rank: ${b.csRank || "N/A"}\n• CS Points: ${b.csPoints || "0"}\n• Max Rank: ${b.maxRank || "N/A"}\n• Max CS Rank: ${b.maxCsRank || "N/A"}\n\n#ACCOUNT INFO\n• Elite Pass: ${b.elitePass ? "Yes" : "No"}\n• Badges: ${b.badges || "0"}\n• Season: ${b.season || "N/A"}\n• Version: ${b.releaseVersion || "N/A"}\n• Created: ${b.createAt || "N/A"}\n\n#GUILD INFO\n• Guild: ${g.guildName || "No Guild"}\n• Guild ID: ${g.guildId || "N/A"}\n• Level: ${g.guildLevel || "N/A"}\n• Members: ${g.members || "0"}/${g.capacity || "0"}\n• Leader: ${g.leader?.name || "N/A"}\n\n#PET INFO\n• Name: ${p.name || "No Pet"}\n• Level: ${p.level || "0"}\n• EXP: ${p.exp || "0"}\n• Skin ID: ${p.skinId || "N/A"}\n\n#SOCIAL INFO\n• Gender: ${s.gender || "N/A"}\n• Language: ${s.language || "N/A"}\n• Signature: ${s.signature || "No Signature"}\n\n#CREDIT SCORE\n• Score: ${c.score || "0"}\n• Reward: ${c.reward || "N/A"}\n• Period End: ${c.periodEnd || "N/A"}\n\n${poweredBy}`;

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.reply(msg);

                } catch (err) {
                        console.error("FFINFO Error:", err);
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
