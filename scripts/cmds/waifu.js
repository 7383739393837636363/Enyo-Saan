const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "waifu",
                aliases: ["waifugame"],
                version: "1.8",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "অ্যানিমে ওয়াইফু দেখে নাম অনুমান করার খেলা",
                        en: "Guess the anime waifu name by looking at the picture",
                        vi: "Đoán tên waifu bằng cách nhìn vào bức ảnh"
                },
                category: "game",
                guide: {
                        bn: '   {pn}: গেমটি শুরু করতে লিখুন',
                        en: '   {pn}: Type to start the game',
                        vi: '   {pn}: Nhập để bắt đầu trò chơi'
                }
        },

        langs: {
                bn: {
                        start: "✨ | একটি ওয়াইফু এসেছে! নামটা বলো তো বেবি?",
                        correct: "✅ | একদম সঠিক উত্তর বেবি!\n\nতুমি জিতেছো %1 কয়েন এবং %2 এক্সপি।",
                        wrong: "🥺 | উত্তরটি ভুল হয়েছে বেবি!\n\nসঠিক উত্তর ছিল: %1",
                        notYour: "× বেবি, এটি তোমার জন্য নয়! নিজের জন্য গেম শুরু করো। >🐸",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        start: "✨ | A waifu has appeared! Guess her name, baby.",
                        correct: "✅ | Correct answer, baby!\n\nYou have earned %1 coins and %2 exp.",
                        wrong: "🥺 | Wrong Answer, baby!\n\nThe Correct answer was: %1",
                        notYour: "× This is not your waifu, baby! >🐸",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        start: "✨ | Một waifu đã xuất hiện! Đoán tên đi cưng.",
                        correct: "✅ | Đáp án chính xác cưng ơi!\n\n✨ Bạn nhận được %1 xu và %2 exp.",
                        wrong: "🥺 | Sai rồi cưng ơi!\n\n🌸 Đáp án đúng là: %1",
                        notYour: "× Đây không phải phần chơi của bạn cưng à! >🐸",
                        error: "× Lỗi: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {
                const authorName = "Saan"; 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { waifu, author, messageID } = Reply;
                const { senderID, threadID, body, messageID: replyMsgID } = event;

                if (senderID !== author) {
                        return api.sendMessage(getLang("notYour"), threadID, replyMsgID);
                }

                const userAnswer = body.trim().toLowerCase();
                const waifuNames = Array.isArray(waifu) ? waifu : [waifu];
                const isCorrect = waifuNames.some(name => name.toLowerCase() === userAnswer);

                const userData = await usersData.get(senderID);
                const getCoin = 500;
                const getExp = 121;

                if (isCorrect) {
                        userData.money = (userData.money || 0) + getCoin;
                        userData.exp = (userData.exp || 0) + getExp;
                        await usersData.set(senderID, userData);

                        await api.unsendMessage(messageID);
                        return api.sendMessage(getLang("correct", getCoin, getExp), threadID, replyMsgID);
                } else {
                        await api.unsendMessage(messageID);
                        return api.sendMessage(getLang("wrong", waifuNames[0]), threadID, replyMsgID);
                }
        },

        onStart: async function ({ api, event, getLang }) {
                const authorName = "Saan"; 
                if (this.config.author !== authorName) return;

                try {
                        const apiUrl = await baseApiUrl();
                        if (!apiUrl) throw new Error("API URL not found");

                        const response = await axios.get(`${apiUrl}/api/waifu`);
                        const { name, imgurLink } = response.data.waifu;

                        const imageStream = await axios({
                                url: imgurLink,
                                method: "GET",
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        return api.sendMessage({
                                        body: getLang("start"),
                                        attachment: imageStream.data
                                },
                                event.threadID,
                                (err, info) => {
                                        if (err) return;
                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName: this.config.name,
                                                messageID: info.messageID,
                                                author: event.senderID,
                                                waifu: name
                                        });

                                        setTimeout(() => {
                                                if (global.GoatBot.onReply.has(info.messageID)) {
                                                        api.unsendMessage(info.messageID);
                                                        global.GoatBot.onReply.delete(info.messageID);
                                                }
                                        }, 40000);
                                },
                                event.messageID
                        );
                } catch (error) {
                        console.error("WaifuGame Error:", error.message);
                        return api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
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
