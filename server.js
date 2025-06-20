const http = require('http');       // create webserver
const url = require('url');         //parse URLs
const querystring = require('querystring');

const PORT = 3000;          //port at which it will run
const submissions = [];         //all submissions will be stored here

const server = http.createServer((req, res) => {            //it listens for incoming requests and handles them with the provided function.
    const { method, url: reqUrl } = req;
    const { pathname } = url.parse(reqUrl);

    // Handle POST /submit
    if (method === 'POST' && pathname === '/submit') {          // only runs if someone sends a POST request to /submit.
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();                       //append incoming form data to body
        });

        req.on('end', () => {
            const { mobile, email } = querystring.parse(body);
            
            // Validation
            if (!mobile || !email) {
                respond(res, 400, { success: false, message: 'Both mobile and email are required' });
                return;
            }

            const mobileRegex = /^[0-9]{10,15}$/;                   // for validateing mobile no
            if (!mobileRegex.test(mobile)) {
                respond(res, 400, { success: false, message: 'Invalid mobile number' });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;        // for validateing email
            if (!emailRegex.test(email)) {
                respond(res, 400, { success: false, message: 'Invalid email' });
                return;
            }

            // Store submission
            const submission = { mobile, email, timestamp: new Date().toISOString() };
            submissions.push(submission);

            respond(res, 201, {                 // send a success message back
                success: true, 
                message: 'Form submitted successfully',
                data: submission
            });
        });
    }
    // Handle GET /submissions
    else if (method === 'GET' && pathname === '/submissions') {
        respond(res, 200, {
            count: submissions.length,
            submissions
        });
    }
    else {
        respond(res, 404, { success: false, message: 'Not Found' });
    }
});

function respond(res, statusCode, data) {           // this is a helper function to easily send JSON responses with the correct status code.
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

server.listen(PORT, () => {
    console.log(`Pure Node.js server running on http://localhost:${PORT}`);
    console.log(`Test with: curl -X POST http://localhost:${PORT}/submit -d "mobile=1234567890&email=xyz@example.com"`);
});