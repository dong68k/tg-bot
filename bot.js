const fetch = require("node-fetch");

const TELEGRAM_TOKEN = "填你的telegram token";
const AI_API_KEY = "填你的AI key";

// 发消息
async function sendMessage(chat_id, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
    }),
  });
}

// 调 AI（OpenAI 示例）
async function askAI(message) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "没有回复";
}

// 轮询 Telegram
let offset = 0;

async function run() {
  console.log("bot running...");

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${offset}`
      );

      const data = await res.json();

      for (const update of data.result) {
        offset = update.update_id + 1;

        const msg = update.message;
        if (!msg || !msg.text) continue;

        const reply = await askAI(msg.text);

        await sendMessage(msg.chat.id, reply);
      }
    } catch (e) {
      console.log(e);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

run();