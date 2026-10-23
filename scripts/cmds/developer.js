const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
        config: {
                name: "developer",
                version: "1.0",
                author: "Saan",
                countDown: 5,
                role: 3,
                description: {
                        bn: "বোট ডেভেলপার যোগ, অপসারণ বা তালিকা দেখুন",
                        en: "Add, remove, or list bot developers",
                        vi: "Thêm, xóa, liệt kê người phát triển bot"
                },
                category: "owner",
                guide: {
                        bn: '   {pn} add [ID | @tag]: ডেভেলপার যোগ করতে\n   {pn} remove [ID | @tag]: ডেভেলপার সরাতে\n   {pn} list: ডেভেলপার তালিকা দেখতে',
                        en: '   {pn} add [ID | @tag]: Add developer role\n   {pn} remove [ID | @tag]: Remove developer role\n   {pn} list: List all developers'
                }
        },

        langs: {
                bn: {
                        added: "✅ | সফলভাবে %1 জনকে ডেভেলপার রোল দেওয়া হয়েছে:\n%2",
                        already: "\n⚠️ | %1 জন আগে থেকেই ডেভেলপার তালিকায় ছিল:\n%2",
                        missingAdd: "⚠️ | বেবি, ডেভেলপার করতে আইডি দিন অথবা কাউকে ট্যাগ করুন!",
                        removed: "✅ | সফলভাবে %1 জনের ডেভেলপার রোল সরানো হয়েছে:\n%2",
                        notIn: "⚠️ | %1 জন ডেভেলপার তালিকায় ছিল না:\n%2",
                        missingRemove: "⚠️ | বেবি, ডেভেলপার সরাতে আইডি দিন অথবা কাউকে ট্যাগ করুন!",
                        list: "💻 | বোট ডেভেলপার তালিকা:\n\n%1"
                },
                en: {
                        added: "✅ | Added developer role for %1 users:\n%2",
                        already: "\n⚠️ | %1 users already have developer role:\n%2",
                        missingAdd: "⚠️ | Please enter ID or tag user to add developer role",
                        removed: "✅ | Removed developer role of %1 users:\n%2",
                        notIn: "⚠️ | %1 users don't have developer role:\n%2",
                        missingRemove: "⚠️ | Please enter ID or tag user to remove developer role",
                        list: "💻 | List of developers:\n\n%1"
                }
        },

        onStart: async function ({ api, message, args, usersData, event, getLang }) {
                const action = args[0]?.toLowerCase();
                const { threadID, messageID } = event;
                if (!config.devUser) config.devUser = [];

                switch (action) {
                        case "add": {
                                if (args[1] || event.messageReply) {
                                        let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : 
                                                   event.messageReply ? [event.messageReply.senderID] : args.filter(arg => !isNaN(arg));

                                        const notInIds = [], inIds = [];
                                        for (const uid of uids) config.devUser.includes(uid) ? inIds.push(uid) : notInIds.push(uid);

                                        config.devUser.push(...notInIds);
                                        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                        const response = (notInIds.length > 0 ? getLang("added", notInIds.length, getNames.filter(u => notInIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                                                + (inIds.length > 0 ? getLang("already", inIds.length, getNames.filter(u => inIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "");
                                        return api.sendMessage(response, threadID, messageID);
                                } else return api.sendMessage(getLang("missingAdd"), threadID, messageID);
                        }
                        case "remove": {
                                if (args[1] || event.messageReply) {
                                        let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : 
                                                   event.messageReply ? [event.messageReply.senderID] : args.filter(arg => !isNaN(arg));

                                        const inIds = [], notInIds = [];
                                        for (const uid of uids) config.devUser.includes(uid) ? inIds.push(uid) : notInIds.push(uid);

                                        for (const uid of inIds) config.devUser.splice(config.devUser.indexOf(uid), 1);
                                        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                        const response = (inIds.length > 0 ? getLang("removed", inIds.length, getNames.filter(u => inIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                                                + (notInIds.length > 0 ? getLang("notIn", notInIds.length, getNames.filter(u => notInIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "");
                                        return api.sendMessage(response, threadID, messageID);
                                } else return api.sendMessage(getLang("missingRemove"), threadID, messageID);
                        }
                        case "list": {
                                const getNames = await Promise.all(config.devUser.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                return api.sendMessage(getLang("list", getNames.map(({ uid, name }) => `• ${name}\n  └ ID: ${uid}`).join("\n\n")), threadID, messageID);
                        }
                        default: return message.SyntaxError();
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
