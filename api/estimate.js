export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { description } = req.body

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      messages: [{ role: 'user', content: `Estimate the macros for: "${description}". Reply ONLY with a JSON object, no markdown, no explanation. Format: {"name":"...(clean food name)","calories":0,"protein":0,"carbs":0,"fat":0}` }]
    })
  })

  const data = await response.json()
  console.log('Anthropic response:', JSON.stringify(data))
  res.status(200).json(data)
}