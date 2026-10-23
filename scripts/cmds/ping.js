module.exports = {
        config: {
                name: "ping",
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "বোটের রেসপন্স টাইম বা পিং চেক করুন",
                        en: "Check the bot's response time or ping",
                        vi: "Kiểm tra thời gian phản hồi hoặc ping của bot"
                },
                category: "general",
                guide: {
                        bn: '   {pn}: পিং চেক করতে',
                        en: '   {pn}: To check ping',
                        vi: '   {pn}: Để kiểm tra ping'
                }
        },

        onStart: async function ({ api, message, event }) {
                const authorName = "Saan"; 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const timeStart = Date.now();
                const checkingMsg = await message.reply("⏳ Checking bot ping...");
                const ping = Date.now() - timeStart;

                const response = `✅ 𝐏𝐢𝐧𝐠 𝐂𝐡𝐞𝐜𝐤 𝐑𝐞𝐬𝐮𝐥𝐭\n` +
                                 `───────────────\n` +
                                 `📶 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐓𝐢𝐦𝐞: ${ping}ms`;

                return api.editMessage(response, checkingMsg.messageID);
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
