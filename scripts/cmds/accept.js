const moment = require("moment-timezone");

module.exports = {
        config: {
                name: "accept",
                aliases: ["acp"],
                version: "1.7",
                author: "Saan",
                countDown: 5,
                role: 0,
                description: {
                        bn: "বটের পেন্ডিং ফ্রেন্ড রিকোয়েস্টগুলো এক্সেপ্ট বা ডিলিট করুন (অ্যাডমিন)",
                        en: "Accept or delete pending friend requests of the bot (Admin)",
                        vi: "Chấp nhận hoặc xóa các yêu cầu kết bạn đang chờ của bot (Quản trị viên)"
                },
                category: "admin",
                guide: {
                        bn: '   {pn}: রিকোয়েস্ট লিস্ট দেখতে ব্যবহার করুন। তারপর রিপ্লাই দিন "add <index>" অথবা "del <index>"।',
                        en: '   {pn}: Use to see request list. Then reply "add <index>" or "del <index>".',
                        vi: '   {pn}: Sử dụng để xem danh sách yêu cầu. Sau đó trả lời "add <index>" hoặc "del <index>".'
                }
        },

        langs: {
                bn: {
                        noRequest: "× কোনো পেন্ডিং ফ্রেন্ড রিকোয়েস্ট নেই! 😴",
                        listHeader: "📋 মোট রিকোয়েস্ট: %1টি\n",
                        replyGuide: "\n• 'add <index|all>' দিয়ে এক্সেপ্ট করুন\n• 'del <index|all>' দিয়ে ডিলিট করুন",
                        invalidAction: "× ভুল কমান্ড! শুধু add অথবা del ব্যবহার করুন।",
                        done: "✅ কাজ শেষ!\n• সফল: %1\n• ব্যর্থ: %2",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact SAAN।"
                },
                en: {
                        noRequest: "× No pending friend requests! 😴",
                        listHeader: "📋 Total Requests: %1\n",
                        replyGuide: "\n• Reply 'add <index|all>' to accept\n• Reply 'del <index|all>' to delete",
                        invalidAction: "× Invalid action! Use 'add' or 'del'.",
                        done: "✅ Task Complete!\n• Success: %1\n• Failed: %2",
                        error: "× API error: %1. Contact SAAN for help."
                },
                vi: {
                        noRequest: "× Không có yêu cầu kết bạn nào đang chờ! 😴",
                        listHeader: "📋 Tổng số yêu cầu: %1\n",
                        replyGuide: "\n• Trả lời 'add <index|all>' để chấp nhận\n• Trả lời 'del <index|all>' để xóa",
                        invalidAction: "× Hành động không hợp lệ! Sử dụng 'add' hoặc 'del'.",
                        done: "✅ Hoàn thành!\n• Thành công: %1\n• Thất bại: %2",
                        error: "× Lỗi: %1. Liên hệ SAAN để hỗ trợ."
                }
        },

        onReply: async function ({ message, Reply, event, api, commandName, getLang }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) return;
                
                const { author, listRequest } = Reply;
                if (author !== event.senderID) return;

                const args = event.body.trim().toLowerCase().split(" ");
                let action, doc_id;

                if (args[0] === "add") {
                        action = "accepted";
                        doc_id = "3147613905362928";
                } else if (args[0] === "del") {
                        action = "deleted";
                        doc_id = "4108254489275063";
                } else {
                        return message.reply(getLang("invalidAction"));
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        let targetIDs = args[1] === "all" ? listRequest.map((_, index) => index + 1) : args.slice(1);
                        const success = [], failed = [];

                        for (const stt of targetIDs) {
                                const user = listRequest[parseInt(stt) - 1];
                                if (!user) continue;

                                const form = {
                                        av: api.getCurrentUserID(),
                                        fb_api_caller_class: "RelayModern",
                                        fb_api_req_friendly_name: action === "accepted" ? "FriendingCometFriendRequestConfirmMutation" : "FriendingCometFriendRequestDeleteMutation",
                                        doc_id,
                                        variables: JSON.stringify({
                                                input: {
                                                        source: "friends_tab",
                                                        actor_id: api.getCurrentUserID(),
                                                        friend_requester_id: user.node.id,
                                                        client_mutation_id: Math.round(Math.random() * 19).toString()
                                                },
                                                scale: 3,
                                                refresh_num: 0
                                        })
                                };

                                const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
                                if (JSON.parse(response).errors) failed.push(user.node.name);
                                else success.push(user.node.name);
                        }

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.reply(getLang("done", success.length, failed.length));

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        },

        onStart: async function ({ event, api, commandName, getLang, message }) {
                const authorName = "Saan";
                if (this.config.author !== authorName) return;

                const form = {
                        av: api.getCurrentUserID(),
                        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
                        fb_api_caller_class: "RelayModern",
                        doc_id: "4499164963466303",
                        variables: JSON.stringify({ input: { scale: 3 } })
                };

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
                        const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;

                        if (!listRequest.length) {
                                api.setMessageReaction("🥺", event.messageID, () => {}, true);
                                return message.reply(getLang("noRequest"));
                        }

                        let msg = getLang("listHeader", listRequest.length);
                        listRequest.forEach((user, index) => {
                                msg += `${index + 1}. ${user.node.name} (${user.node.id})\n`;
                        });
                        msg += getLang("replyGuide");

                        return message.reply(msg, (e, info) => {
                                global.GoatBot.onReply.set(info.messageID, { commandName, listRequest, author: event.senderID });
                        });

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
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
