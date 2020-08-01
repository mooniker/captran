const http = require('http')

const gbfs = require('captran-gbfs')
const cabi = gbfs({
    gbfsUrl: 'https://gbfs.capitalbikeshare.com/gbfs/gbfs.json',
    lang: 'en'
})

const respondWithJson = (object) => {
    response.writeHead(200, {'Content-Type': 'application/json'})
    response.end(JSON.stringify(object))
}

const helloWorld = '<h1>Hello, world!</h1>'

function respond404 () {
    response.writeHead(404, {'Content-Type': 'text/html'})
    response.end('Not found.')
}

let backend = http.createServer((request, response) => {
    let reqUrl = request.url.split('/').splice(1)
    switch (reqUrl[0]) {
        case '':
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.end(helloWorld)
            break
        case 'ping':
            respondWithJson({ 'body': 'pong' })
            break
        case '?':
            let lat = reqUrl[1]
            let long = reqUrl[2]
        default: respond404()
        
    }
}

const PORT = ENV.PORT || 5000

backend.listen(PORT, () => console.log('Server is up on port %d.', PORT))