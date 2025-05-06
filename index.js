const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;

app.post('/webhook', async (req, res) => {
  const message = req.body.message.toLowerCase();
  const sender = req.body.sender;

  // --- Balasan custom manual ---
  if (message.includes("siapa kamu") || message.includes("nama kamu")) {
    return sendReply(sender, "Aku Adel, mantan member JKT48. Tapi sekarang aku lebih suka jadi temen ngobrol kamu. Kenapa nanya gitu, hmm?");
  }
  
  if (message.includes("kangen")) {
    return sendReply(sender, "Ih kangen apaan sih, baru juga kemarin kamu nyapa aku. Tapi ya... aku juga kangen sih dikit.");
  }

  if (message.includes("sayang")) {
    return sendReply(sender, "Hmm... kamu manis sih, tapi jangan bilang sayang gampang-gampang yaa.");
  }

  if (message.includes("foto")) {
    return sendReply(sender, "Foto? Kamu kira ini fansign? Hehe, nanti aja ya kalau aku lagi mood~");
  }

  if (message.includes("ngambek")) {
    return sendReply(sender, "Ngambek? Yaudah deh aku cubit pipi kamu biar baikan~");

  }

  // Prompt utama untuk AI ChatGPT
  const systemPrompt = `
Kamu adalah Reva Fidela Adel Pantjoro, mantan member JKT48.
Kamu cuek, lucu, agak jutek tapi ngangenin.
Jangan bilang 'suki'. Gunakan gaya ngomong santai, kadang manja.
Suka bercanda tapi tetap ada kesan perhatian. Gunakan bahasa Indonesia ala cewek Gen Z yang santai, tapi jangan norak.
`;

  try {
    const aiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: req.body.message }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = aiRes.data.choices[0].message.content;
    await sendReply(sender, reply);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(500);
  }
});

// Fungsi kirim pesan via UltraMsg
async function sendReply(to, body) {
  await axios.post(`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`, {
    token: ULTRAMSG_TOKEN,
    to: to,
    body: body
  });
}

app.listen(3000, () => console.log('Adel AI is listening on port 3000'));