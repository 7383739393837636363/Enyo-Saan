 module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"],
    version: "1.7",
    author: "Saan",
    role: 0,
    category: "general",
    guide: {
      en: "Use {p}uptime to display bot's uptime and user stats."
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const uptimeString = `${days}D ${hours}H ${minutes}M`;

      const msg = 
`╭─🎀 𝙔𝙊𝙐𝙍 𝘽𝙊𝙏 𝙐𝙋𝙏𝙄𝙈𝙀
│
├🐤 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptimeString}  
├👥 𝗧𝗼𝘁𝗮𝗹 𝗨𝘀𝗲𝗿𝘀: ${allUsers.length.toLocaleString()}  
├💬 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀: ${allThreads.length.toLocaleString()}  
│
╰───────────────◉`;

      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving uptime or user data.", event.threadID, event.messageID);
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
