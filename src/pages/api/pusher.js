import Pusher from 'pusher';

const pusher = new Pusher({
  appId: "1891957",
  key: "f698ef5791fa3bf159bd",
  secret: "2406aa83e7abde2d2e47",
  cluster: "us3",
  useTLS: true
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    await pusher.trigger("live-paper", "text-update", {
      text: text
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Pusher API Error:', error);
    res.status(500).json({ error: error.message });
  }
}