const axios = require("axios");

const mahmud = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "bot",
    "জান",
    "জানু",
    "বেবি",
    "wifey",
    "Mahuya",
    "Sweetheart",
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "Mahuya", "Sweetheart"],
    version: "7.0.8",
    author: "Saan",
    countDown: 0,
    role: 0,
    description: "better than all sim simi and most fastest",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach amar [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nresponse [YourResponse] OR\nlist [all / pageNumber] OR\nedit [YourMessage] - [NeWMessage]\nNote: better than all sim simi and most fastest"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const obfuscatedAuthor = "Saan";
    if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    const mahmud = args.join(" ").toLowerCase();
    const uid = event.senderID;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "I love you", "type !bby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === "teach" && args[1] === "amar") {
            const content = mahmud.replace(/^teach\s+amar\s+/i, "");
            const [question, ...responsesArr] = content.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!question || !responses) return api.sendMessage("❌ | teach amar [question] - [response1, response2,...]", event.threadID, event.messageID);
            const response = await axios.post(`${await baseApiUrl()}/api/teach?question=${encodeURIComponent(question)}&responses=${encodeURIComponent(responses)}&senderID=${encodeURIComponent(uid)}&key=intro`);
            const userName = (await usersData.getName(parseInt(uid))) || "Unknown";
            return api.sendMessage(`✅ Intro reply added: "${responses}" to "${question}"`, event.threadID, event.messageID);
        }

        if (args[0] === "teach") {
            const content = mahmud.replace(/^teach\s+/i, "");
            const [question, ...responsesArr] = content.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!question || !responses) return api.sendMessage("❌ | teach [question] - [response1, response2,...]", event.threadID, event.messageID);
            const response = await axios.post(`${await baseApiUrl()}/api/teach?question=${encodeURIComponent(question)}&responses=${encodeURIComponent(responses)}&senderID=${encodeURIComponent(uid)}`);
            const userName = (await usersData.getName(parseInt(uid))) || "Unknown";
            return api.sendMessage(`✅ Replies added: "${responses}" to "${question}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID);
        }

        if (args[0] === "remove" || args[0] === "rm") {
            const content = mahmud.replace(/^(remove|rm)\s+/i, "");
            const [question, index] = content.split(" - ");
            if (!question || !index || isNaN(index)) return api.sendMessage("❌ | remove [question] - [index]", event.threadID, event.messageID);
            const response = await axios.delete(`${await baseApiUrl()}/api/teach/remove?question=${encodeURIComponent(question)}&index=${encodeURIComponent(index)}&senderID=${encodeURIComponent(uid)}`);
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "list") {
            const isAll = args[1] === "all" || !isNaN(args[1]);
            const endpoint = isAll ? "/list/all" : "/list";
            const response = await axios.get(`${await baseApiUrl()}/api/teach${endpoint}`);             
            if (!isAll) return api.sendMessage(response.data.message, event.threadID, event.messageID); let page = parseInt(!isNaN(args[1]) ? args[1] : args[2], 10) || 1;
            const limit = 100; const rawData = response.data.data; const teachers = [];
            for (const userID of Object.keys(rawData)) { let name = "Unknown";  try { name = (await usersData.getName(parseInt(userID, 10))) || "Unknown";  } catch (e) {
            console.error(`getName failed for userID ${userID}:`, e.message); }
            teachers.push({ name, value: rawData[userID] });
         }

            teachers.sort((a, b) => b.value - a.value);
            const totalPages = Math.ceil(teachers.length / limit) || 1;            
            if (page < 1) page = 1; if (page > totalPages) page = totalPages; const start = (page - 1) * limit;
            const paginatedData = teachers.slice(start, start + limit);
            let message = "👑 List of Baby teachers:\n\n";
            for (let i = 0; i < paginatedData.length; i++) { const t = paginatedData[i]; const num = String(start + i + 1).padEnd(3);
            message += `${num}. ${t.name}: ${t.value}\n`; }            
            message += `\n• Total page: [${page}/${totalPages}]`; message += `\n• Total Teacher: ${teachers.length}`; message += `\n• type !baby list all ${page < totalPages ? page + 1 : page} and see next page`;            
            return api.sendMessage(message, event.threadID, event.messageID);
        }

        if (args[0] === "edit") {
            const content = mahmud.replace(/^edit\s+/i, "");
            const [oldResponse, ...newArr] = content.split(" - ");
            const newResponse = newArr.join(" - ");
            if (!oldResponse || !newResponse) return api.sendMessage("❌ | Format: edit [question] - [newResponse]", event.threadID, event.messageID);
            const response = await axios.put(`${await baseApiUrl()}/api/teach/edit?oldResponse=${encodeURIComponent(oldResponse)}&newResponse=${encodeURIComponent(newResponse)}&senderID=${encodeURIComponent(uid)}`);
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "message" || args[0] === "msg") {
            let searchMessage = args.slice(1).join(" ");
            if (!searchMessage) return api.sendMessage("Please provide a message to search.", event.threadID, event.messageID); try {
            const response = await axios.get(`${await baseApiUrl()}/api/teach/message?search=${encodeURIComponent(searchMessage)}&senderID=${encodeURIComponent(uid)}`);
            return api.sendMessage(response.data.message || "No message found.", event.threadID, event.messageID);
          } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "error";
            return api.sendMessage(errorMessage, event.threadID, event.messageID);
            }
       }

        if (args[0] === "response") {
            const searchResponse = args.slice(1).join(" ");
            if (!searchResponse) return api.sendMessage("❌ Please provide a response to search.\nExample: bby response hi", event.threadID, event.messageID); try {
            const response = await axios.get(`${await baseApiUrl()}/api/teach/response?search=${encodeURIComponent(searchResponse)}&senderID=${encodeURIComponent(uid)}`);
            return api.sendMessage(response.data.message || "No result found.", event.threadID, event.messageID);
          } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "❌ Not found!";
            return api.sendMessage(errorMessage, event.threadID, event.messageID);
            }
       }

        const attachments = event.attachments || [];
        const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(mahmud)}&font=3&senderID=${encodeURIComponent(uid)}`, { attachments })).data.reply;
        return api.sendMessage(response, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    text: response
                });
            }
        }, event.messageID);

    } catch (err) {
        console.error(err);
        api.sendMessage(`${err.response?.data || err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const text = event.body?.toLowerCase() || "";
        const attachments = event.attachments || [];
        const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(text)}&font=3&senderID=${encodeURIComponent(event.senderID)}`, { attachments })).data.reply;

        api.sendMessage(response, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    text: response
                });
            }
        }, event.messageID);
    } catch (err) {
        console.error(err);
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        const hasTrigger = mahmud.some(word => body.startsWith(word));

        if (event.type !== "message_reply" && hasTrigger) {
            api.setMessageReaction("🪽", event.messageID, () => {}, true);

            const text = body.replace(/^\S+\s*/, "");
            const attachments = event.attachments || [];

            const randomMessage = [
                "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",
                "neo amr boss k message daw 01898747***",
                "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
                "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
                "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
                "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, SAAN ,SAAN ও তো করতে পারো😑?",
                "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
                "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
                "হটাৎ আমাকে মনে পড়লো 🙄",
                "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿",
                "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
                "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
                "খাওয়া দাওয়া করসো 🙄",
                "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
                "আরে আমি মজা করার mood এ নাই😒",
                "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
                "আরে Bolo আমার জান, কেমন আসো? 😚",
                "একটা BF খুঁজে দাও 😿",
                "oi mama ar dakis na pilis 😿",
                "amr JaNu lagbe,Tumi ki single aso?",
                "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺",
                "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
                "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
                "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
                "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে"
            ];

            if (!text && attachments.length === 0) {
                const babyMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
                return await api.sendMessage(babyMessage, event.threadID, (err, info) => {
                    if (!err) {
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName: module.exports.config.name,
                            type: "reply",
                            messageID: info.messageID,
                            author: event.senderID,
                            text: babyMessage
                        });
                    }
                }, event.messageID);
            }

            const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(text)}&font=3&senderID=${encodeURIComponent(event.senderID)}`, { attachments })).data.reply;
            return await api.sendMessage(response, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: module.exports.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID,
                        text: response
                    });
                }
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
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
