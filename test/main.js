import fs from 'fs';
import http from 'http';
import url from 'url';
import path from 'path';

const hostname = '127.0.0.1';
const port = 9922;

const server = http.createServer(processHTTP);

function processHTTP(request, response) {
    const pathname = decodeURI(url.parse(request.url, true).pathname);
    const method = request.method;

    if (method === 'GET') {
        try {
            const filePath = getFilePath(pathname);

            if (fs.existsSync(filePath)) {
                parsePublicUrl(response, filePath);
            }
        } catch(err) {
            parseCustomUrl(response, pathname);
        }
    }
    else if (method === 'POST') {
    }
}

function getFilePath(pathname) {
    if (pathname === '/') {
        return path.join('.', 'app', 'index-for-test.html');
    }
    else if (pathname.startsWith('/libraries')) {
        return path.join('.', pathname);
    }
    else {
        return path.join('.', 'app', pathname);
    }
}

function parsePublicUrl(response, filePath) {
    response.writeHead(200, { 'Content-Type': parseContentType(filePath) });
    fs.readFile(filePath, (error, data) => {
        if (error) {
            console.log(error);
        }
        else {
            response.end(data, 'utf-8');
        }
    });
}

function parseContentType(pathname) {
    if (pathname.endsWith('.html')) {
        return 'text/html; charset=utf-8';
    }
    else if (pathname.endsWith('.css')) {
        return 'text/css';
    }
    else if (pathname.endsWith('.js')) {
        return 'text/javascript';
    }
    else if (pathname.endsWith('.json')) {
        return 'application/json';
    }
    else if (pathname.endsWith('.png')) {
        return 'image/png';
    }
    else if (pathname.endsWith('.mp3')) {
        return 'audio/mpeg';
    }
    else if (pathname.endsWith('.wav')) {
        return 'audio/wav';
    }
    else if (pathname.endsWith('.ico')) {
        return 'image/x-icon';
    }
    else {
        throw 'not supported content type';
    }
}

function parseCustomUrl(response, pathname) {}

server.listen(port, hostname);

console.log(`Server running... http://${hostname}:${port}`);