const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
        config: {
                name: "vip",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 2,
                description: {
                        bn: "VIP ইউজার যোগ, অপসারণ বা তালিকা দেখুন",
                        en: "Add, remove, or list VIP users"
                },
                category: "owner",
                guide: { bn: '{pn} add/remove/list [ID/@tag]', en: '{pn} add/remove/list [ID/@tag]' }
        },

        langs: {
                bn: {
                        added: "🌟 | সফলভাবে %1 জনকে VIP রোল দেওয়া হয়েছে:\n%2",
                        already: "\n⚠️ | %1 জন আগে থেকেই VIP ছিল:\n%2",
                        missingAdd: "⚠️ | বেবি, VIP করতে আইডি দিন অথবা ট্যাগ করুন!",
                        removed: "🚫 | সফলভাবে %1 জনের VIP রোল সরানো হয়েছে:\n%2",
                        notIn: "⚠️ | %1 জন VIP তালিকায় ছিল না:\n%2",
                        list: "🌟 | VIP ইউজার তালিকা:\n\n%1"
                },
                en: {
                        added: "🌟 | Added VIP role for %1 users:\n%2",
                        already: "\n⚠️ | %1 users already have VIP role:\n%2",
                        missingAdd: "⚠️ | Provide ID or tag to add VIP!",
                        removed: "🚫 | Removed VIP role for %1 users:\n%2",
                        notIn: "⚠️ | %1 users were not in VIP list:\n%2",
                        list: "🌟 | VIP Users List:\n\n%1"
                }
        },

        onStart: async function ({ api, message, args, usersData, event, getLang }) {
                const action = args[0]?.toLowerCase();
                const { threadID, messageID } = event;
                if (!config.vipUser) config.vipUser = [];

                switch (action) {
                        case "add": {
                                if (args[1] || event.messageReply) {
                                        let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : 
                                                   event.messageReply ? [event.messageReply.senderID] : args.filter(arg => !isNaN(arg));

                                        const notInIds = [], inIds = [];
                                        for (const uid of uids) config.vipUser.includes(uid) ? inIds.push(uid) : notInIds.push(uid);

                                        config.vipUser.push(...notInIds);
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
                                        for (const uid of uids) config.vipUser.includes(uid) ? inIds.push(uid) : notInIds.push(uid);

                                        for (const uid of inIds) config.vipUser.splice(config.vipUser.indexOf(uid), 1);
                                        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                        const response = (inIds.length > 0 ? getLang("removed", inIds.length, getNames.filter(u => inIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                                                + (notInIds.length > 0 ? getLang("notIn", notInIds.length, getNames.filter(u => notInIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "");
                                        return api.sendMessage(response, threadID, messageID);
                                } else return api.sendMessage(getLang("missingAdd"), threadID, messageID);
                        }
                        case "list": {
                                const getNames = await Promise.all(config.vipUser.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
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
