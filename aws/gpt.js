import https from 'https'

export const handler = awslambda.streamifyResponse(
    async (event, responseStream, _context) => {
        const headers = event.headers;
        const body = event.body;
        const path = event.rawPath;
        const httpMethod = event.requestContext.http.method;
        console.log(`path: ${path}`)
        console.log(`httpMethod: ${JSON.stringify(httpMethod)}`)
        const options = {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': headers['authorization']
            },
            port: 443,
            hostname: 'api.openai.com',
            path: path,
        }
        const metadata = {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "CustomHeader": "outerspace"
            }
        };

        // Assign to the responseStream parameter to prevent accidental reuse of the non-wrapped stream.
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                res.on('data', (chunk) => {
                    responseStream.write(chunk)
                });
                res.on('end', () => {
                    responseStream.end();
                    responseStream.finished();
                    resolve();
                });
            });

            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                responseStream.end();
                responseStream.finished();
                reject(e);
            });
            req.write(body)
            req.end();
        });
    })
