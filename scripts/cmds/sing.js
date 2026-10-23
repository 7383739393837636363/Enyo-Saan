const axios = require("axios");

const baseApiUrl = async () => (await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json")).data.mahmud;

module.exports = {
        config: {
                name: "sing",
                version: "5.5",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: "better then all sing",
                category: "music",
                guide: {
                        en: '   {pn} <song name>: Download audio Default v1'
                                + '\n   {pn} vN <name>: Use version N for audio e.g., v2, v3'
                                + '\n   {pn} -v <name>: Download video Default v1'
                                + '\n   {pn} vN -v <name>: Use version N for video'
                                + '\n   {pn} list: See all available dynamic versions',
                        vi: '   {pn} <tên bài hát>: Tải âm thanh Mặc định v1'
                                + '\n   {pn} vN <tên>: Dùng phiên bản N cho âm thanh'
                                + '\n   {pn} -v <tên>: Tải video Mặc định v1'
                                + '\n   {pn} vN -v <tên>: Dùng phiên bản N cho video'
                                + '\n   {pn} list: Xem tất cả phiên bản hiện có'
                }
        },
        langs: {
                en: {
                        noInput: "× Baby, please provide a song or video name.",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠 𝐛𝐚𝐛𝐲\n• 𝐒𝐢𝐧𝐠 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: %2\n• 𝐒𝐢𝐧𝐠 𝐓𝐲𝐩𝐞: %3\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        listFetchErr: "Failed to fetch the version list.",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noInput: "× Bé ơi, vui lòng nhập tên bài hát hoặc video.",
                        success: "✅ | 𝐁à𝐢 ðá𝐭 𝐜ủ𝐚 𝐛é đâ𝐲\n• 𝐏𝐡𝐢ê𝐧 𝐛ả𝐧: %2\n• 𝐋𝐨ạ𝐢: %3\n• 𝔗ì𝔪 𝔨𝔦ế𝔪: %1",
                        listFetchErr: "Không thể lấy danh sách phiên bản.",
                        error: "× Lỗi API: %1. Liên hệ SAAN để được giúp đỡ."
                }
        },
        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { messageID } = event;

                try {
                        if (args[0] === "list") {
                                const response = await axios.get(`${await baseApiUrl()}/api/sing/list`);
                                const data = response.data;
                                return data ? message.reply(`• 𝐓𝐨𝐭𝐚𝐥 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${data.total}\n\n${data.versions.join(", ")}`) : message.reply(getLang("listFetchErr"));
                        }

                        let version = "v1";
                        if (args[0]) {
                                const arg0 = args[0].toLowerCase();
                                if (/^v\d+$/.test(arg0)) {
                                        version = args.shift().toLowerCase();
                                } else if (/^version\d+$/.test(arg0)) {
                                        version = "v" + arg0.replace("version", "");
                                        args.shift();
                                } else if (/^-v\d+$/.test(arg0)) {
                                        version = "v" + arg0.replace("-v", "");
                                        args.shift();
                                }
                        }

                        let type = "audio";
                        if (args[0]) {
                                if (args[0] === "-v" || args[0] === "video") {
                                        type = "video";
                                        args.shift();
                                }
                        }

                        const search = args.join(" ");
                        if (!search) return message.reply(getLang("noInput"));

                        api.setMessageReaction("⌛", messageID, () => {}, true);

                        const response = await axios.get(`${await baseApiUrl()}/api/sing?version=${version}&search=${encodeURIComponent(search)}&type=${type}`, { responseType: "stream" });
                        const stream = response.data;
                        return message.reply({
                                body: getLang("success", search, version, type),
                                attachment: stream
                        }, (error, info) => {
                                api.setMessageReaction("🪽", event.messageID, () => {}, true);
                        });

                } catch (error) {
                        api.setMessageReaction("❌", messageID, () => {}, true);
                        return message.reply(getLang("error", error.message));
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
