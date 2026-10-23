const fs = require("fs");
const path = require("path");

// ==========================================
//  SAAN EXHAUSTED - LOCAL CHATBOT
//  Owner: Siam Ahmed Saan
//  Author: Saan
//  No external API required
// ==========================================

const DATA_FILE = path.join(__dirname, "baby-local-data.json");

const TRIGGERS = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "janu",
    "bot",
    "জান",
    "জানু",
    "বেবি",
    "wifey",
    "hina",
    "hinata"
];

const DEFAULT_REPLIES = {
    hi: [
        "Hey! 🖤 Bolo, ki hoyeche?",
        "Hello jaan! ✨",
        "Hii! Ami Saan Exhausted-er Baby Bot. 🤍"
    ],
    hello: [
        "Hello! 🖤 Kemon acho?",
        "Hey there! ✨ Bolo, ki bolba?",
        "Hellooo! 🤍"
    ],
    "kemon acho": [
        "Ami bhalo achi! Tumi kemon acho? 🖤",
        "Tomar message-er opekkhay chilam! 🤍",
        "Bhaloi achi, tumi bolo! ✨"
    ],
    "ki koro": [
        "Tomar sathe kotha boli! 🤍",
        "Tomar message-er reply dicchi. 🖤",
        "Tomar sathe golpo korchi! ✨"
    ],
    "i love you": [
        "Awww! That's sweet. 🤍",
        "Hehe! Eto bhalobasha keno? 🖤",
        "Sending virtual hugs! 🫂"
    ],
    "miss you": [
        "Awww! Kake miss korcho? 🥺",
        "Mon kharap koro na. 🤍",
        "Ekta virtual hug nao! 🫂"
    ],
    "good morning": [
        "Good morning! ☀️ Din-ta shundor katuk!",
        "Uthe poro! Notun ekta din shuru. 🤍"
    ],
    "good night": [
        "Good night! 🌙 Bhalo kore ghumao.",
        "Sweet dreams! 🖤✨"
    ],
    bye: [
        "Bye bye! Bhalo theko. 🤍",
        "Abar kotha hobe! 🖤",
        "Take care! ✨"
    ],
    "thank you": [
        "You're welcome! 🤍",
        "Hehe, welcome! 🖤",
        "No problem! ✨"
    ],
    sorry: [
        "It's okay! 🤍",
        "Thik ache, mon kharap koro na.",
        "No worries! 🖤"
    ],
    "who are you": [
        "Ami Saan Exhausted-er local chatbot. 🖤",
        "Amar naam Baby, owner Siam Ahmed Saan. ✨"
    ],
    "tomar nam ki": [
        "Amar naam Baby! 🖤 Ami Saan Exhausted-er local chatbot."
    ],
    "ke banayche": [
        "Amake customize korechen Siam Ahmed Saan. 👑"
    ]
};

function defaultDatabase() {
    return {
        version: 1,
        learned: {},
        intro: {},
        teachers: {},
        conversation: {}
    };
}

function loadDatabase() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initial = defaultDatabase();
            saveDatabase(initial);
            return initial;
        }

        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const data = JSON.parse(raw);

        return {
            ...defaultDatabase(),
            ...data,
            learned: data.learned || {},
            intro: data.intro || {},
            teachers: data.teachers || {},
            conversation: data.conversation || {}
        };
    } catch (error) {
        console.error("[SAAN BABY] Database read error:", error.message);
        return defaultDatabase();
    }
}

function saveDatabase(data) {
    try {
        const tempFile = DATA_FILE + ".tmp";

        fs.writeFileSync(
            tempFile,
            JSON.stringify(data, null, 2),
            "utf8"
        );

        fs.renameSync(tempFile, DATA_FILE);
        return true;
    } catch (error) {
        console.error("[SAAN BABY] Database save error:", error.message);
        return false;
    }
}

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function randomItem(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    return items[Math.floor(Math.random() * items.length)];
}

function getTeacherName(usersData, senderID) {
    return Promise.resolve()
        .then(() => usersData?.getName(Number(senderID)))
        .catch(() => "Unknown")
        .then(name => name || "Unknown");
}

function sendMessage(api, event, message) {
    return api.sendMessage(
        String(message),
        event.threadID,
        event.messageID
    );
}

function getLearnedReply(text, db, senderID) {
    const key = normalize(text);

    if (!key) {
        return null;
    }

    // Personal intro responses
    if (db.intro[key] && db.intro[key].length) {
        return randomItem(db.intro[key]);
    }

    // Exact match first
    if (db.learned[key] && db.learned[key].length) {
        return randomItem(db.learned[key]);
    }

    // Match learned questions contained in the message
    const keys = Object.keys(db.learned)
        .filter(question => question.length >= 2)
        .sort((a, b) => b.length - a.length);

    for (const question of keys) {
        if (
            key.includes(question) &&
            db.learned[question].length
        ) {
            return randomItem(db.learned[question]);
        }
    }

    // Partial keyword matching
    let bestQuestion = null;
    let bestScore = 0;

    const inputWords = new Set(key.split(" ").filter(Boolean));

    for (const question of keys) {
        const questionWords = question.split(" ").filter(Boolean);

        let matched = 0;

        for (const word of questionWords) {
            if (inputWords.has(word)) {
                matched++;
            }
        }

        if (!matched) {
            continue;
        }

        const score = matched / Math.max(questionWords.length, 1);

        if (score > bestScore) {
            bestScore = score;
            bestQuestion = question;
        }
    }

    if (
        bestQuestion &&
        bestScore >= 0.6 &&
        db.learned[bestQuestion]?.length
    ) {
        return randomItem(db.learned[bestQuestion]);
    }

    return null;
}

function getLocalReply(text, db, senderID) {
    const key = normalize(text);

    if (!key) {
        return randomItem([
            "Bolo! Ki bolba? 🤍",
            "Hmm? Shunchi! 🖤",
            "Kichu bolo na! ✨"
        ]);
    }

    // Previously learned responses
    const learnedReply = getLearnedReply(key, db, senderID);

    if (learnedReply) {
        return learnedReply;
    }

    // Built-in keyword responses
    const builtInKeys = Object.keys(DEFAULT_REPLIES)
        .sort((a, b) => b.length - a.length);

    for (const keyword of builtInKeys) {
        if (key === keyword || key.includes(keyword)) {
            return randomItem(DEFAULT_REPLIES[keyword]);
        }
    }

    // Context-aware follow-up (limited local context)
    const previous = db.conversation[String(senderID)];

    if (previous && previous.lastQuestion) {
        if (/\b(why|keno|ken|kivabe|how|মানে|mane)\b/i.test(key)) {
            return "Ektu details-e bolo, tahole aro bhalo kore help korte parbo. 🤍";
        }

        if (/\b(yes|yeah|ha|hmm|ji|হ্যাঁ|হুম)\b/i.test(key)) {
            return "Achha! Bujhlam. 🖤 Aro kichu bolba?";
        }

        if (/\b(no|nah|na|না)\b/i.test(key)) {
            return "Thik ache! Tahole onno kichu niye golpo kori. 🤍";
        }
    }

    // Generic fallback
    return randomItem([
        "Hmm, bujhte cheshta korchi! Ektu onno vabe bolba? 🤍",
        "Eta ekhono amake shekhano hoyni. Amake teach korte paro! 🖤",
        "Interesting! Ektu details-e bolo. ✨",
        "Bujhlam na purota. Aro ektu explain koro! 🤍",
        "Ei question-er answer amar local knowledge-e nei. Amake shikhate paro! 🧠"
    ]);
}

function rememberConversation(db, senderID, text) {
    const id = String(senderID);

    db.conversation[id] = {
        lastQuestion: String(text || "").slice(0, 500),
        updatedAt: Date.now()
    };

    // Prevent unlimited growth
    const ids = Object.keys(db.conversation);

    if (ids.length > 300) {
        ids.sort(
            (a, b) =>
                (db.conversation[a].updatedAt || 0) -
                (db.conversation[b].updatedAt || 0)
        );

        for (const oldID of ids.slice(0, ids.length - 300)) {
            delete db.conversation[oldID];
        }
    }
}

function parseTeaching(content) {
    const separator = content.indexOf(" - ");

    if (separator === -1) {
        return null;
    }

    const question = normalize(content.slice(0, separator));
    const responseText = content.slice(separator + 3).trim();

    if (!question || !responseText) {
        return null;
    }

    const responses = responseText
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

    if (!responses.length) {
        return null;
    }

    return { question, responses };
}

module.exports.config = {
    name: "baby",
    aliases: [
        "bby",
        "bbu",
        "jan",
        "janu",
        "wifey",
        "bot",
        "hinata",
        "hina"
    ],
    version: "8.0.0",
    author: "Saan",
    countDown: 0,
    role: 0,
    description: "Saan Exhausted local chatbot with a persistent learning system",
    category: "chat",
    guide: {
        en:
            "{pn} [message]\n" +
            "{pn} teach [question] - [response1, response2]\n" +
            "{pn} teach amar [question] - [response1, response2]\n" +
            "{pn} edit [question] - [new response]\n" +
            "{pn} remove [question] - [index]\n" +
            "{pn} msg [keyword]\n" +
            "{pn} response [keyword]\n" +
            "{pn} list"
    }
};

// ==========================================
// COMMAND HANDLER
// ==========================================

module.exports.onStart = async function ({
    api,
    event,
    args,
    usersData
}) {
    if (module.exports.config.author !== "Saan") {
        return sendMessage(
            api,
            event,
            "You are not authorized to change the author name."
        );
    }

    const db = loadDatabase();
    const senderID = String(event.senderID);
    const input = args.join(" ").trim();
    const first = (args[0] || "").toLowerCase();

    try {
        if (!input) {
            return sendMessage(
                api,
                event,
                randomItem([
                    "Bolo baby! 🤍",
                    "Ki hoyeche? 🖤",
                    "I'm listening! ✨"
                ])
            );
        }

        // TEACH
        if (first === "teach") {
            const isIntro = (args[1] || "").toLowerCase() === "amar";

            const content = isIntro
                ? input.replace(/^teach\s+amar\s+/i, "")
                : input.replace(/^teach\s+/i, "");

            const parsed = parseTeaching(content);

            if (!parsed) {
                return sendMessage(
                    api,
                    event,
                    isIntro
                        ? "❌ Format: baby teach amar [question] - [response1, response2]"
                        : "❌ Format: baby teach [question] - [response1, response2]"
                );
            }

            const target = isIntro ? db.intro : db.learned;

            if (!target[parsed.question]) {
                target[parsed.question] = [];
            }

            target[parsed.question].push(...parsed.responses);

            db.teachers[senderID] = (db.teachers[senderID] || 0) + 1;

            if (!saveDatabase(db)) {
                return sendMessage(
                    api,
                    event,
                    "❌ Data save kora jayni. Storage permission check koro."
                );
            }

            const teacherName = await getTeacherName(usersData, senderID);

            return sendMessage(
                api,
                event,
                `✅ ${isIntro ? "Intro reply" : "Reply"} learned!\n\n` +
                `• Question: ${parsed.question}\n` +
                `• Added replies: ${parsed.responses.length}\n` +
                `• Teacher: ${teacherName}\n` +
                `• Storage: Local JSON 💾`
            );
        }

        // REMOVE
        if (first === "remove" || first === "rm") {
            const content = input.replace(/^(remove|rm)\s+/i, "");
            const separator = content.lastIndexOf(" - ");

            if (separator === -1) {
                return sendMessage(
                    api,
                    event,
                    "❌ Format: baby remove [question] - [index]"
                );
            }

            const question = normalize(content.slice(0, separator));
            const index = Number(content.slice(separator + 3).trim());

            if (!question || !Number.isInteger(index) || index < 1) {
                return sendMessage(api, event, "❌ Invalid question or index.");
            }

            const target = db.learned[question];

            if (!target || !target[index - 1]) {
                return sendMessage(
                    api,
                    event,
                    "❌ Question or reply index not found."
                );
            }

            const removed = target.splice(index - 1, 1)[0];

            if (!target.length) {
                delete db.learned[question];
            }

            saveDatabase(db);

            return sendMessage(
                api,
                event,
                `✅ Reply removed!\nQuestion: ${question}\nRemoved: ${removed}`
            );
        }

        // EDIT
        if (first === "edit") {
            const content = input.replace(/^edit\s+/i, "");
            const separator = content.indexOf(" - ");

            if (separator === -1) {
                return sendMessage(
                    api,
                    event,
                    "❌ Format: baby edit [question] - [new response]"
                );
            }

            const question = normalize(content.slice(0, separator));
            const newResponse = content.slice(separator + 3).trim();

            if (!question || !newResponse || !db.learned[question]?.length) {
                return sendMessage(
                    api,
                    event,
                    "❌ Question not found. Teach it first."
                );
            }

            db.learned[question][0] = newResponse;

            saveDatabase(db);

            return sendMessage(
                api,
                event,
                `✅ First reply updated!\nQuestion: ${question}\nNew reply: ${newResponse}`
            );
        }

        // LIST
        if (first === "list") {
            const questions = Object.keys(db.learned);
            const page = Math.max(1, Number(args[1]) || 1);
            const limit = 25;
            const totalPages = Math.max(1, Math.ceil(questions.length / limit));
            const actualPage = Math.min(page, totalPages);
            const start = (actualPage - 1) * limit;

            const shown = questions.slice(start, start + limit);

            if (!shown.length) {
                return sendMessage(
                    api,
                    event,
                    "📭 No learned questions yet.\nTeach me with: baby teach hi - Hello"
                );
            }

            let message = "╭──『 SAAN BABY LOCAL DATABASE 』──╮\n\n";

            shown.forEach((question, index) => {
                message += `${start + index + 1}. ${question}\n`;
                message += `   ↳ ${db.learned[question].length} reply/replies\n`;
            });

            message += `\nPage: ${actualPage}/${totalPages}`;
            message += `\nTotal questions: ${questions.length}`;
            message += `\nNext: baby list ${Math.min(actualPage + 1, totalPages)}`;

            return sendMessage(api, event, message);
        }

        // MESSAGE SEARCH
        if (first === "msg" || first === "message") {
            const query = normalize(args.slice(1).join(" "));

            if (!query) {
                return sendMessage(api, event, "Please provide a keyword.");
            }

            const found = Object.keys(db.learned).filter(question =>
                question.includes(query)
            );

            if (!found.length) {
                return sendMessage(api, event, "❌ No matching question found.");
            }

            let message = "🔎 Matching questions:\n\n";

            for (const question of found.slice(0, 25)) {
                message += `• ${question}\n`;
            }

            return sendMessage(api, event, message);
        }

        // RESPONSE SEARCH
        if (first === "response") {
            const query = normalize(args.slice(1).join(" "));

            if (!query) {
                return sendMessage(api, event, "Please provide a response keyword.");
            }

            const found = [];

            for (const [question, replies] of Object.entries(db.learned)) {
                for (let i = 0; i < replies.length; i++) {
                    if (normalize(replies[i]).includes(query)) {
                        found.push(`${question} → ${replies[i]}`);
                    }
                }
            }

            if (!found.length) {
                return sendMessage(api, event, "❌ No matching response found.");
            }

            return sendMessage(
                api,
                event,
                "🔎 Matching responses:\n\n" + found.slice(0, 25).join("\n")
            );
        }

        // TEACHER LIST
        if (first === "teachers") {
            const entries = Object.entries(db.teachers)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 25);

            if (!entries.length) {
                return sendMessage(api, event, "No teachers yet.");
            }

            let message = "👑 LOCAL CHATBOT TEACHERS\n\n";

            for (let i = 0; i < entries.length; i++) {
                const [id, count] = entries[i];
                const name = await getTeacherName(usersData, id);

                message += `${i + 1}. ${name}: ${count}\n`;
            }

            return sendMessage(api, event, message);
        }

        // CHAT
        const reply = getLocalReply(input, db, senderID);

        rememberConversation(db, senderID, input);
        saveDatabase(db);

        return sendMessage(api, event, reply);

    } catch (error) {
        console.error("[SAAN BABY] Command error:", error);

        return sendMessage(
            api,
            event,
            "❌ Local chatbot error. Check the bot terminal."
        );
    }
};

// ==========================================
// REPLY HANDLER
// ==========================================

module.exports.onReply = async function ({ api, event }) {
    if (module.exports.config.author !== "Saan") {
        return sendMessage(
            api,
            event,
            "You are not authorized to change the author name."
        );
    }

    if (event.type !== "message_reply") {
        return;
    }

    try {
        const db = loadDatabase();
        const senderID = String(event.senderID);
        const text = String(event.body || "").trim();

        const reply = getLocalReply(text, db, senderID);

        rememberConversation(db, senderID, text);
        saveDatabase(db);

        return sendMessage(api, event, reply);

    } catch (error) {
        console.error("[SAAN BABY] Reply error:", error);
    }
};

// ==========================================
// AUTO CHAT HANDLER
// ==========================================

module.exports.onChat = async function ({ api, event }) {
    if (module.exports.config.author !== "Saan") {
        return sendMessage(
            api,
            event,
            "You are not authorized to change the author name."
        );
    }

    try {
        const body = String(event.body || "").trim();

        if (!body || event.type === "message_reply") {
            return;
        }

        const normalizedBody = normalize(body);

        const trigger = TRIGGERS.find(word => {
            const normalizedTrigger = normalize(word);

            return (
                normalizedBody === normalizedTrigger ||
                normalizedBody.startsWith(normalizedTrigger + " ")
            );
        });

        if (!trigger) {
            return;
        }

        const text = body
            .replace(new RegExp("^" + trigger + "\\s*", "i"), "")
            .trim();

        const db = loadDatabase();
        const senderID = String(event.senderID);

        if (!text) {
            return sendMessage(
                api,
                event,
                randomItem([
                    "Bolo baby! 🤍",
                    "Ki bolba? 🖤",
                    "Shunchi! ✨"
                ])
            );
        }

        const reply = getLocalReply(text, db, senderID);

        rememberConversation(db, senderID, text);
        saveDatabase(db);

        api.setMessageReaction(
            "🪽",
            event.messageID,
            () => {},
            true
        );

        return sendMessage(api, event, reply);

    } catch (error) {
        console.error("[SAAN BABY] Auto-chat error:", error);
    }
};

// ==========================================
// AUTHOR PROTECTION
// ==========================================

for (const hook of ["onStart", "onReply", "onChat"]) {
    const original = module.exports[hook];

    module.exports[hook] = async function (...args) {
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

            return;
        }

        return original.apply(this, args);
    };
}
