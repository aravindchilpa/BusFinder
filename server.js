const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// Use the CORS middleware
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // This allows all origins, you can restrict it to specific origins if needed
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let locations = [];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    // Send existing locations to the new client
    socket.emit('initialLocations', locations);

    socket.on('updateLocation', (data) => {
        // Update locations array
        const existingIndex = locations.findIndex(loc => loc.id === data.id);
        if (existingIndex !== -1) {
            locations[existingIndex] = data;
        } else {
            locations.push(data);
        }

        // Broadcast the updated location to all clients
        io.emit('broadcastLocation', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4000, () => {
    console.log('Listening on port 4000');
});
