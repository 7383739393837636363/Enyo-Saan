const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "truthordare",
    aliases: ["td", "tord"],
    version: "1.7",
    author: "Saan",
    role: 0,
    category: "game",
    description: "Play Truth or Dare, add new questions, or list total questions.",
    guide: "[truth/dare] | add [truth/dare] [question] | list"
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = "Saan"; 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }
    try {
      const baseURL = await mahmud();
      const apiBase = `${baseURL}/api/tord`;

      if (!args[0]) {
        return api.sendMessage(
          "⚡ Usage:\n• tord truth\n• tord dare\n• tord add truth [question]\n• tord add dare [question]\n• tord list",
          event.threadID,
          event.messageID
        );
      }

      const subCmd = args[0].toLowerCase();

      if (subCmd === "add") {
        const type = args[1]?.toLowerCase();
        const question = args.slice(2).join(" ");
        if (!type || !question) {
          return api.sendMessage("⚠️ | Use: tord add truth/dare [question]", event.threadID, event.messageID);
        }

        const res = await axios.post(`${apiBase}/add`, { type, question });
        return api.sendMessage(`${res.data.message}`, event.threadID, event.messageID);
      }

      if (subCmd === "list") {
        const res = await axios.get(`${apiBase}/list`);
        const data = res.data;

        return api.sendMessage(
          `📜 𝙏𝙧𝙪𝙩𝙝 𝙤𝙧 𝘿𝙖𝙧𝙚 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣𝙨:\n\n` +
          `📋 Total Truths: ${data.totalTruth}\n` +
          `📋 Total Dares: ${data.totalDare}`,
          event.threadID,
          event.messageID
        );
      }

      if (subCmd === "truth" || subCmd === "t") {
        const res = await axios.get(`${apiBase}?type=truth`);
        return api.sendMessage(
          `🎀 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐓𝐫𝐮𝐭𝐡:\n\n${res.data.question}`,
          event.threadID,
          event.messageID
        );
      }

      if (subCmd === "dare" || subCmd === "d") {
        const res = await axios.get(`${apiBase}?type=dare`);
        return api.sendMessage(
          `🎀 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐃𝐚𝐫𝐞:\n\n${res.data.question}`,
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage("❌ | Invalid command.", event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("🥹error, contact SAAN.", event.threadID, event.messageID);
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
