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
        if (pathname === '/rank/') {
            let body = '';
            request.on('data', (data) => {
                body += data;
            });
            request.on('end', () => {
                const scores = JSON.parse(storage.load('scores.json', '[]'));
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(scores), 'utf-8');
            });
        }
        else if (pathname === '/rank/register/') {
            let body = '';
            request.on('data', (data) => {
                body += data;
            });
            request.on('end', () => {
                const scores = JSON.parse(storage.load('scores.json', '[]'));
                scores.push(JSON.parse(body));
                const result = storage.save('scores.json', JSON.stringify(scores, null, 4));
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end(`${result}`, 'utf-8');
            });
        }
        else if (pathname === '/resources/') {
            let body = '';
            request.on('data', (data) => {
                body += data;
            });
            request.on('end', () => {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                const data = parseResourceDirectory(path.join('app', 'resources'));
                response.end(JSON.stringify(data), 'utf-8');
            });
        }
        else if (pathname === '/resources/load/') {
            let body = '';
            request.on('data', (data) => {
                body += data;
            });
            request.on('end', () => {
                const { filePath, defaults } = JSON.parse(body);
                const data = storage.load(filePath, defaults);
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end(data, 'utf-8');
            });
        }
        else if (pathname === '/resources/save/') {
            let body = '';
            request.on('data', (data) => {
                body += data;
            });
            request.on('end', () => {
                const { filePath, data } = JSON.parse(body);
                const result = storage.save(filePath, JSON.stringify(data));
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end(`${result}`, 'utf-8');
            });
        }
    }
}

function getFilePath(pathname) {
    if (pathname === '/') {
        return path.join('.', 'app', 'index-for-web.html');
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