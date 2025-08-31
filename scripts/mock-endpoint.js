const http = require('http');

// Define the port the server will listen on.
const PORT = 8000;

const server = http.createServer((req, res) => {
    // Set CORS headers to allow requests from any origin.
    // This is crucial for testing from a web browser.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle pre-flight CORS requests (sent by browsers for POST requests).
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Only handle POST requests sent to the '/api/data' endpoint.
    if (req.method === 'POST' && req.url === '/api/data') {
        let body = '';

        // Collect data chunks from the request body.
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });

        // When the request has finished, process the full body.
        req.on('end', () => {
            try {
                // Parse the JSON data from the request body.
                const data = JSON.parse(body);
                
                // Print the received data to the console for verification.
                console.log("Received data:");
                console.log(data);
                
                // --- Respond to the client ---
                res.writeHead(200, { 'Content-Type': 'application/json' });
                
                // Create a response object.
                const response = {
                    message: "String received successfully!",
                    received_string: data.myString
                };
                
                // Send the JSON response back to the client.
                res.end(JSON.stringify(response));

            } catch (error) {
                // Handle JSON parsing errors.
                console.error('Error parsing JSON:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
    } else {
        // For any other requests, send a 404 Not Found response.
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server and listen on the specified port.
server.listen(PORT, () => {
    console.log(`Serving mock server at http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop the server.");
});
