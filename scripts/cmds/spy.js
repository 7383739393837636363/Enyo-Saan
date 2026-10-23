const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "spy",
                aliases: ["spyinfo", "whoami"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো ইউজারের প্রোফাইল এবং স্ট্যাটাস চেক করুন",
                        en: "Check profile and stats of any user",
                        vi: "Kiểm tra hồ sơ và trạng thái của bất kỳ người dùng nào"
                },
                category: "info",
                guide: {
                        bn: '   {pn}: নিজের তথ্য দেখুন\n   {pn} <@tag/reply/UID>: ইউজারের তথ্য দেখুন',
                        en: '   {pn}: See your info\n   {pn} <@tag/reply/UID>: Check user info',
                        vi: '   {pn}: Xem thông tin của bạn\n   {pn} <@tag/reply/UID>: Xem thông tin người dùng'
                }
        },

        langs: {
                bn: {
                        error: "× তথ্য সংগ্রহ করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        error: "× Failed to fetch info: %1. Contact SAAN for help."
                },
                vi: {
                        error: "× Lỗi lấy thông tin: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onStart: async function ({ event, message, api, args, usersData, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { senderID, mentions, type, messageReply } = event;
                let uid = type === "message_reply" ? messageReply.senderID : Object.keys(mentions)[0] || senderID;

                if (args[0] && !args[0].startsWith("--")) {
                        if (/^\d+$/.test(args[0])) uid = args[0];
                        else {
                                const match = args[0].match(/profile\.php\?id=(\d+)/);
                                if (match) uid = match[1];
                        }
                }

                try {
                        const allUsers = await usersData.getAll();
                        const userData = await usersData.get(uid) || {};
                        const userInfo = await api.getUserInfo(uid);
                        const user = userInfo[uid] || {};

                        const money = userData.money || 0;
                        const exp = userData.exp || 0;

                        const expRank = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0)).findIndex(u => u.userID == uid) + 1;
                        const moneyRank = allUsers.sort((a, b) => (b.money || 0) - (a.money || 0)).findIndex(u => u.userID == uid) + 1;

                        const baseUrl = await baseApiUrl();
                        let janTeach = "0", janTeachRank = "N/A";
                        
                        try {
                                const res = await axios.get(`${baseUrl}/api/jan/list/all`);
                                const entries = Object.entries(res.data?.data || {})
                                        .map(([id, val]) => ({ userID: id, value: parseInt(val) || 0 }))
                                        .sort((a, b) => b.value - a.value);

                                const userTeachData = entries.find(d => d.userID === uid);
                                if (userTeachData) {
                                        janTeach = userTeachData.value;
                                        janTeachRank = entries.findIndex(d => d.userID === uid) + 1;
                                }
                        } catch (e) {}

                        const genderText = user.gender === 1 ? "Girl" : user.gender === 2 ? "Boy" : "Other";
                        
                        const msg = `╭────[ 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 ]
├‣ 𝙽𝚊𝚖𝚎: ${user.name || "Unknown"}
├‣ 𝙶𝚎𝚗𝚍𝚎𝚛: ${genderText}
├‣ 𝚄𝙸𝙳: ${uid}
├‣ 𝙲𝚕𝚊𝚜𝚜: FRIEND
├‣ 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎: ${user.vanity || "none"}
├‣ 𝙱𝚒𝚛𝚝𝚑𝚍𝚊𝚢: Private
├‣ 𝙽𝚒𝚌𝚔𝙽𝚊𝚖𝚎: None
╰‣ 𝙵𝚛𝚒𝚎𝚗𝚍 𝚠𝚒𝚝𝚑 𝚋𝚘𝚝: ${user.isFriend ? "Yes ✅" : "No ❌"}

╭────[ 𝐔𝐒𝐄𝐑 𝐒𝐓𝐀𝐓𝐒 ]
├‣ 𝚄𝚜𝚎𝚛 𝚁𝚊𝚗𝚔: #${expRank}/${allUsers.length}
├‣ 𝙴𝚇𝙿: ${formatNumber(exp)}
├‣ 𝙱𝚊𝚕𝚊𝚗𝚌𝚎: ${formatNumber(money)}
├‣ 𝙱𝚊𝚕𝚊𝚗𝚌𝚎 𝚁𝚊𝚗𝚔: #${moneyRank}
╰‣ 𝙷𝚒𝚗𝚊𝚝𝚊 𝚃𝚎𝚊𝚌𝚑: ${janTeach} #${janTeachRank}`;

                        return message.reply(msg);
                } catch (err) {
                        return message.reply(getLang("error", err.message));
                }
        }
};

function formatNumber(num) {
        if (!num) return "0";
        let n = typeof num !== "number" ? parseInt(num) || 0 : num;
        const units = ["", "K", "M", "B", "T"];
        let unit = 0;
        while (n >= 1000 && ++unit < units.length) n /= 1000;
        return n.toFixed(1).replace(/\.0$/, "") + units[unit];
}

 
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
