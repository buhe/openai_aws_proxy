import https from 'https'
import type { VercelRequest, VercelResponse } from '@vercel/node'


module.exports = async (request: VercelRequest, response: VercelResponse) => {
    console.log(JSON.stringify(request.headers))
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers['authorization']
        }
    }

    const req = https.request('https://api.openai.com/v1/chat/completions', options, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            response.status(200).send(data)
        })
    }).on('error', (error) => {
        console.error(error)
        response.status(500).send('Error')
    })
    req.write(JSON.stringify(request.body))
    req.end()
}