module.exports = {
        config: {
                name: "tag",
                version: "1.7",
                author: "Saan",
                countDown: 0,
                role: 0,
                category: "utility",
                guide: {
                        en: "{pn} [reply/@mention/name] [text]",
                        bn: "{pn} [রিপ্লাই/@মেনশন/নাম] [টেক্সট]",
                        vi: "{pn} [phản hồi/@mention/tên] [văn bản]"
                }
        },

        langs: {
                bn: {
                        no_user: "❌ এই গ্রুপে এই নামের কাউকে পাওয়া যায়নি!",
                        guide_msg: "⚠️ অনুগ্রহ করে রিপ্লাই দিন, মেনশন করুন অথবা নাম লিখুন!",
                        error: "❌ একটি সমস্যা হয়েছে: %1"
                },
                en: {
                        no_user: "❌ User not found in this group!",
                        guide_msg: "⚠️ Please reply, mention, or type a name!",
                        error: "❌ Error occurred: %1"
                },
                vi: {
                        no_user: "❌ Không tìm thấy người dùng trong nhóm này!",
                        guide_msg: "⚠️ Vui lòng phản hồi, gắn thẻ hoặc nhập tên!",
                        error: "❌ Đã xảy ra lỗi: %1"
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const { threadID, messageID, messageReply, mentions } = event;
                        let uid;
                        let text = args.join(" ");

                        if (messageReply) {
                                uid = messageReply.senderID;
                        }

                        else if (Object.keys(mentions).length > 0) {
                                uid = Object.keys(mentions)[0];    
                                text = text.replace(/@\S+/g, "").trim();
                        }

                        else if (args.length > 0) {
                                const nameInput = args[0].toLowerCase();
                                const threadInfo = await api.getThreadInfo(threadID);
                                const member = threadInfo.userInfo.find(u =>
                                        u.name.toLowerCase().includes(nameInput)
                                );

                                if (!member) return api.sendMessage(getLang("no_user"), threadID, messageID);

                                uid = member.id;
                                text = args.slice(1).join(" ");
                        }

                        else {
                                return api.sendMessage(getLang("guide_msg"), threadID, messageID);
                        }

                        const userInfo = await api.getUserInfo(uid);
                        const name = userInfo[uid]?.name || "User";

                        return api.sendMessage({
                                body: `${name} ${text}`,
                                mentions: [{
                                        tag: name,
                                        id: uid
                                }]
                        }, threadID, messageID);

                } catch (e) {
                        console.log(e);
                        return api.sendMessage(getLang("error", e.message), event.threadID, event.messageID);
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
