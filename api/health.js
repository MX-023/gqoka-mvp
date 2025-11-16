module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    ok: true,
    message: 'GQOKA Backend is alive on Vercel',
    timestamp: new Date().toISOString()
  });
};
