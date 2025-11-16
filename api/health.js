export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    ok: true,
    message: 'GQOKA Backend is alive on Vercel',
    timestamp: new Date().toISOString()
  });
}
