const http = require('http')

const addBodyToRequest = (req) => {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chuck => {
            data += chuck;
        })
        req.on('error', (err) => {
            reject(err);
        })
        req.on('end', () => {
            req.body = JSON.parse(data);
            resolve();
        })
    })
}

const responseAPI = (res, statusCode, payload) => {
    res.writeHeader(statusCode, {
        'Content-Type': 'application/json'
    });
    res.write(JSON.stringify(payload))
    res.end();
}

const httpGET = (url) => (
    new Promise((resolve, reject) => {
        http.get(url, res => {
            let data = ""

            res.on("data", d => {
                data += d
            })
            res.on("error",  (err)=> {
                reject(err);
            })
            res.on("end", () => {
                resolve(data)
            })
        })
    })
);

const peerInPromise = (peer, event, body, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        peer.request(event, body, {timeout}, (error, data) => {
            if(error){
                reject(error);
                return;
            }
            resolve(data);
        })
    })
}



module.exports = {
    addBodyToRequest,
    responseAPI,
    httpGET,
    peerInPromise
}