const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "say",
                version: "5.8",
                author: "Saan",
                countDown: 10,
                role: 0,
                description: {
                        en: "Text to speech with multi-language character voices",
                        vi: "Chuyển văn bản thành giọng nói với nhiều giọng nhân vật đa ngôn ngữ"
                },
                category: "media",
                guide: {
                        en: '   {pn} <category> <character> <text> [language]' +
                                '\n   {pn} <character> <text>' +
                                '\n   {pn} hi how are you --c anime --m anya --lang japanese' +
                                '\n   {pn} list' +
                                '\n   {pn} lang' +
                                '\n   {pn} lang <character>',
                        vi: '   {pn} <danh_mục> <nhân_vật> <văn_bản> [ngôn_ngữ]' +
                                '\n   {pn} <nhân_vật> <văn_bản>' +
                                '\n   {pn} hi how are you --c anime --m anya --lang japanese' +
                                '\n   {pn} list' +
                                '\n   {pn} lang' +
                                '\n   {pn} lang <nhân_vật>'
                }
        },

        langs: {
                en: {
                        noArgs: "• say <text> --c <category> --m <character> --lang <language>\n\n• Example: say hi how are you --c anime --m goku --lang english",
                        listHeader: "🗣️ | Available Voices List:\n\n",
                        langHeader: "Available language.\n",
                        charLangHeader: "🗣️ | %1 has %2 language(s):\n",
                        catUnavailable: "× Category %1 is unavailable. Type !say list to see all available category.",
                        charUnavailable: "× Character %1 is unavailable. Type !say list to see all available Character.",
                        langUnavailable: "× Language %1 is unavailable for this model. Type !say lang to see all available language.",
                        invalidFormat: "× Invalid format. Examples:\n`say anime anya Waku waku`\n`say hi how are you --c anime --m anya --lang japanese`",
                        tooLong: "⚠️ Text too long (max 500 characters).",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐯𝐨𝐢𝐜𝐞 𝐛𝐚𝐛𝐲\n• Category: %1\n• Character: %2\n• Language: %3",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noArgs: "• say <văn_bản> --c <danh_mục> --m <nhân_vật> --lang <ngôn_ngữ>\n\n• Ví dụ: say hi how are you --c anime --m goku --lang english",
                        listHeader: "🗣️ | Danh sách giọng nói có sẵn:\n\n",
                        langHeader: "Ngôn ngữ khả dụng:\n",
                        charLangHeader: "🗣️ | %1 có %2 ngôn ngữ:\n",
                        catUnavailable: "× Danh mục \"%1\" không khả dụng.",
                        charUnavailable: "× Nhân vật \"%1\" không khả dụng.",
                        langUnavailable: "× Ngôn ngữ \"%1\" không khả dụng cho model này. Gõ !say lang để xem tất cả ngôn ngữ khả dụng.",
                        invalidFormat: "× Định dạng không hợp lệ. Ví dụ:\n`say anime anya Waku waku`\n`say hi how are you --c anime --m anya --lang japanese`",
                        tooLong: "⚠️ Văn bản quá dài (tối đa 500 ký tự).",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐯𝐨𝐢𝐜𝐞 𝐛𝐚𝐛𝐲\n• Category: %1\n• Character: %2\n• Language: %3",
                        error: "× Lỗi API: %1. Liên hệ SAAN để được hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let voicesCache = null;

                async function getVoices() {
                        if (voicesCache) return voicesCache;
                        const { data } = await axios.get(`${await baseApiUrl()}/api/saypro/list`, { timeout: 15000 });
                        voicesCache = data.voices;
                        return voicesCache;
                }

                function findCategory(voices, character) {
                        for (const [cat, chars] of Object.entries(voices)) {
                                if (chars[character]) return cat;
                        }
                        return null;
                }

                const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

                const firstArg = (args[0] || "").toLowerCase();
                const isReply = event.type === "message_reply" && event.messageReply && event.messageReply.body;

                if (args.length === 0 && !isReply) {
                        return message.reply(getLang("noArgs"));
                }

                let voices;
                try {
                        voices = await getVoices();
                } catch (e) {
                        console.error("Saypro list error:", e.message);
                        return message.reply(getLang("error", e.message));
                }

                if (firstArg === "list") {
                        let msg = getLang("listHeader");
                        for (const [catName, chars] of Object.entries(voices)) {
                                msg += `#${cap(catName)}\n`;
                                for (const [charName, langs] of Object.entries(chars)) {
                                        msg += `• ${cap(charName)} [${langs.join(", ")}]\n`;
                                }
                                msg += "\n";
                        }
                        return message.reply(msg.trim());
                }

                if (firstArg === "language" || firstArg === "lang") {
                        const target = (args[1] || "").toLowerCase();

                        if (target) {
                                const found = [];
                                for (const chars of Object.values(voices)) {
                                        if (chars[target]) found.push(...chars[target]);
                                }
                                if (!found.length) {
                                        return message.reply(getLang("charUnavailable", target));
                                }
                                const unique = [...new Set(found)];
                                return message.reply(
                                        getLang("charLangHeader", cap(target), unique.length) +
                                        unique.map((l) => `• ${cap(l)}`).join("\n")
                                );
                        }

                        try {
                                const { data } = await axios.get(`${await baseApiUrl()}/api/saypro/languages`, { timeout: 15000 });
                                const list = data.languages
                                        .map((l) => `• ${cap(l)}`)
                                        .join("\n");
                                return message.reply(getLang("langHeader") + list);
                        } catch (e) {
                                console.error("Saypro language error:", e.message);
                                return message.reply(getLang("error", e.message));
                        }
                }

                const allLangs = new Set(
                        Object.values(voices).flatMap((c) => Object.values(c).flat())
                );

                let catArg = "";
                let charArg = "";
                let langArg = ""; 
                let say = "";

                if (args.includes("--c") || args.includes("--m") || args.includes("--lang")) {
                        const textParts = [];
                        for (let i = 0; i < args.length; i++) {
                                if (args[i] === "--c" && args[i + 1]) {
                                        catArg = args[++i].toLowerCase();
                                } else if (args[i] === "--m" && args[i + 1]) {
                                        charArg = args[++i].toLowerCase();
                                } else if (args[i] === "--lang" && args[i + 1]) {
                                        langArg = args[++i].toLowerCase();
                                } else {
                                        textParts.push(args[i]);
                                }
                        }
                        say = textParts.join(" ");
                } else {
                        const tokens = [...args];
                        const last = (tokens[tokens.length - 1] || "").toLowerCase();
                        if (tokens.length > 1 && allLangs.has(last)) {
                                langArg = last;
                                tokens.pop();
                        }

                        const t0 = (tokens[0] || "").toLowerCase();
                        const t1 = (tokens[1] || "").toLowerCase();

                        if (voices[t0] && voices[t0][t1]) {
                                catArg = t0;
                                charArg = t1;
                                say = tokens.slice(2).join(" ");
                        } else {
                                const foundCat = findCategory(voices, t0);
                                if (foundCat) {
                                        catArg = foundCat;
                                        charArg = t0;
                                        say = tokens.slice(1).join(" ");
                                } else {
                                        // default: Nobita
                                        catArg = "cartoon";
                                        charArg = "nobita";
                                        say = tokens.join(" ");
                                }
                        }
                }

                if (!charArg) {
                        charArg = "nobita";
                        catArg = catArg || "cartoon";
                }

                if (isReply) {
                        say = event.messageReply.body;
                }

                if (catArg && !voices[catArg]) {
                        return message.reply(getLang("catUnavailable", catArg));
                }
                if (charArg) {
                        const pool = catArg ? voices[catArg] : Object.assign({}, ...Object.values(voices));
                        if (!pool[charArg]) {
                                return message.reply(getLang("charUnavailable", charArg));
                        }
                        const availableLangs = pool[charArg];
                        if (!langArg) {
                                if (charArg === "nobita" && availableLangs.includes("hindi")) {
                                        langArg = "hindi";
                                } else if (availableLangs.includes("english")) {
                                        langArg = "english";
                                } else {
                                        langArg = availableLangs[0];
                                }
                        }
                        if (!availableLangs.includes(langArg)) {
                                return message.reply(getLang("langUnavailable", langArg, charArg, availableLangs.join(", ")));
                        }
                }

                if (!charArg || !say) {
                        return message.reply(getLang("invalidFormat"));
                }

                if (!catArg) catArg = findCategory(voices, charArg) || "";

                api.setMessageReaction("⏳", event.messageID, () => {}, true);

                try {
                        const url = `${await baseApiUrl()}/api/saypro?text=${encodeURIComponent(say)}&character=${encodeURIComponent(charArg)}&category=${encodeURIComponent(catArg)}&lang=${encodeURIComponent(langArg)}`;
                        const audioStream = await global.utils.getStreamFromURL(url, "say.mp3");

                        await message.reply({
                                body: getLang("success", cap(catArg), cap(charArg), cap(langArg)),
                                attachment: audioStream
                        });

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);
                } catch (e) {
                        console.error("API Error:", e.message);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", e.message));
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
