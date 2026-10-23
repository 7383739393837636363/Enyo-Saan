const axios = require("axios");

const mahmud = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "aniqz2",
                aliases: ["animeqz2"],
                version: "1.7",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        bn: "অ্যানিমে কুইজ খেলে কয়েন এবং এক্সপি জিতুন",
                        en: "Play anime quiz to win coins and exp",
                        vi: "Chơi đố vui anime để giành được xu và exp"
                },
                category: "game",
                guide: {
                        bn: '   {pn} en: ইংরেজি কুইজ\n   {pn} bn: বাংলা কুইজ',
                        en: '   {pn} en: English quiz\n   {pn} bn: Bangla quiz',
                        vi: '   {pn} en: Câu đố tiếng Anh\n   {pn} bn: Câu đố tiếng Bengal'
                }
        },

        langs: {
                bn: {
                        reply: "𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.",
                        correct: "✅ | একদম সঠিক উত্তর বেবি! 💕\n\nতুমি জিতেছো %1 কয়েন এবং %2 এক্সপি।",
                        wrong: "❌ | উত্তরটি ভুল হয়েছে বেবি!\n\nসঠিক উত্তর ছিল: %1",
                        notYour: "× বেবি, এটি তোমার কুইজ নয়! নিজের জন্য শুরু করো। >🐸",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        reply: "𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.",
                        correct: "✅ | Correct answer baby! 💕\n\nYou earned %1 coins & %2 exp.",
                        wrong: "❌ | Wrong answer baby!\n\nThe correct answer was: %1",
                        notYour: "𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        reply: "Trả lời bằng đáp án của bạn đi cưng",
                        correct: "✅ | Đáp án chính xác cưng ơi! 💕\n\nBạn nhận được %1 xu & %2 exp.",
                        wrong: "❌ | Sai rồi cưng ơi!\n\n💡 Đáp án đúng là: %1",
                        notYour: "× Đây không phải câu đố của bạn cưng à! >🐸",
                        error: "× Lỗi: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = "Saan"; 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }
                
                try {
                        const input = args[0]?.toLowerCase() || "bn";
                        const category = (input === "en" || input === "english") ? "english" : "bangla";

                        const apiUrl = await mahmud();
                        const res = await axios.get(`${apiUrl}/api/aniqz2?category=${category}`);
                        const quiz = res.data?.data || res.data;

                        if (!quiz || !quiz.question) return api.sendMessage("× No quiz available baby.", event.threadID, event.messageID);

                        const { question, correctAnswer, options } = quiz;
                        const { a, b, c, d } = options;

                        const quizMsg = `\n╭──✦ ${question}\n`
                                + `├‣ 𝗔) ${a}\n`
                                + `├‣ 𝗕) ${b}\n`
                                + `├‣ 𝗖) ${c}\n`
                                + `├‣ 𝗗) ${d}\n`
                                + `╰──────────────────‣\n`
                                + `${getLang("reply")}`;

                        api.sendMessage(quizMsg, event.threadID, (error, info) => {
                                global.GoatBot.onReply.set(info.messageID, {
                                        type: "reply",
                                        commandName: this.config.name,
                                        author: event.senderID,
                                        messageID: info.messageID,
                                        correctAnswer
                                });

                                setTimeout(() => {
                                        api.unsendMessage(info.messageID);
                                }, 40000);
                        }, event.messageID);

                } catch (error) {
                        api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
                }
        },

        onReply: async function ({ event, api, Reply, usersData, getLang }) {
                const { correctAnswer, author, messageID } = Reply;
                if (event.senderID !== author) return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);

                const userReply = event.body.trim().toLowerCase();
                const correct = correctAnswer.toLowerCase();
                const userData = await usersData.get(author);
                const rewardCoins = 500;
                const rewardExp = 121;

                await api.unsendMessage(messageID);

                if (userReply === correct || userReply === correct[0]) {
                        await usersData.set(author, {
                                money: userData.money + rewardCoins,
                                exp: userData.exp + rewardExp,
                                data: userData.data
                        });
                        return api.sendMessage(getLang("correct", rewardCoins, rewardExp), event.threadID, event.messageID);
                } else {
                        return api.sendMessage(getLang("wrong", correctAnswer), event.threadID, event.messageID);
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
