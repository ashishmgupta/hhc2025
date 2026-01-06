require('dotenv').config();
    const express = require('express');
    const dns = require('dns'); // Import dns module
    // Remove http, ws, path, url imports related to WebSockets
    const path = require('path'); // Keep path for file serving
    const { exec } = require('child_process'); // Import exec

    const app = express();

    // --- Environment Variables & Initial Setup ---
    const PARENTID = process.env.PARENTID;
    let allowedIps = null; // Initialize allowed IPs

    if (PARENTID) {
        console.log(`PARENTID is set to: ${PARENTID}. Resolving...`);
        dns.lookup(PARENTID, { all: true }, (err, addresses) => {
            if (err) {
                console.error(`Failed to resolve PARENTID hostname "${PARENTID}": ${err.message}. Allowing all connections.`);
                // Keep allowedIps = null to allow all
            } else if (addresses && addresses.length > 0) {
                allowedIps = addresses.map(addr => addr.address).join(', ');
                console.log(`Resolved PARENTID "${PARENTID}" to IPs: ${allowedIps}. Only these IPs will be allowed.`);
            } else {
                console.warn(`PARENTID "${PARENTID}" resolved, but no IP addresses found. Allowing all connections.`);
                // Keep allowedIps = null to allow all
            }
        });
    } else {
        console.log("PARENTID environment variable not set. Allowing all connections.");
        // Keep allowedIps = null to allow all
    }


    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); // To parse form data

    // --- IP Filtering Middleware ---
    app.use((req, res, next) => {
        // If allowedIps is null (PARENTID not set or failed to resolve), allow the request.
        if (allowedIps === null) {
            return next();
        }
        // If allowedIps is set, check if the request IP is in the list.
        // Note: req.ip might need 'trust proxy' setting if behind a reverse proxy.
        const clientIp = req.ip.split(':').pop(); // Get the last part of the IP address (IPv6 compatibility)
        if (allowedIps.includes(clientIp)) {
            //console.log(`Allowed connection from ${clientIp} (matches PARENTID)`);
            next(); // IP is allowed
        } else {
            console.warn(`Rejected connection from ${clientIp} (does not match PARENTID IPs: ${allowedIps})`);
            res.status(403).send('Forbidden: Access denied. ' + `Rejected connection from ${clientIp} (does not match PARENTID IPs: ${allowedIps})`); // IP is not allowed
        }
    });

    // --- Serve Static Files ---
    // Serve files from the 'static' directory within app_code
    // Requests proxied from backend (e.g., /static/phaser.min.js) will be handled here.
    app.use('/static', express.static(path.join(__dirname, 'static')));

    app.set('view engine', 'ejs');

    // --- Game Constants ---
    // Remove WebSocket related constants
    const gnomebotname = "GnomeBot" + Math.floor(Math.random() * 99999); // Random name for the gnomebot

    //var containerUsername = "Unknown"; // Default username - Keep for stats route, but won't be updated by WS
    // need from env variable otherwise unknown
    const containerUsername = process.env.USERNAME || "Unknown"; // Default username, can be set via environment variable
    const processStartTime = Date.now(); // Store the start time of the process - Keep for stats route
    const gnomeBotObjectDetails = {
        settings: {
            name: gnomebotname,
            model_version: "2.3.8",
            firmware_version: "GNM-4.12.0",
        },
    }

    // 🏠 Home route (authentication handled by proxy)
    app.get('/home', (req, res) => {
        //console.log(`Rendering home view`);
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(path.join(__dirname, 'views', 'home.ejs'));
    });

    app.get('/control', (req, res) => {
        //console.log(`Rendering control view`);
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(path.join(__dirname, 'views', 'control.ejs'));
    });

    app.get('/stats', (req, res) => {
        console.log(`Rendering stats view`); // Changed log message
        let gnomeStats = [
            { name: "name", value: gnomeBotObjectDetails?.settings?.name || gnomebotname }, // Fallback to random name if not set
            { name: "model_version", value: gnomeBotObjectDetails?.settings?.model_version || "Unknown" }, // Fallback to "Unknown" if not set
            { name: "description", value: "Holiday remote controlled gnome for your home." },
            { name: "status", value: "active" }, // Status might need updating if based on WS connection
            { name: "last_updated", value: new Date().toISOString() },
            { name: "last_updated_by", value: containerUsername }, // Username won't be updated via WS anymore
            { name: "last_accessed_by", value: containerUsername }, // Username won't be updated via WS anymore
            { name: "battery_level", value: Math.max(0, 100 - Math.floor((Date.now() - processStartTime) / (2 * 60 * 60 * 1000) * 100)) + "%" }, // Battery level
            { name: "uptime", value: Math.floor((Date.now() - processStartTime) / 1000) + " seconds" }, // Uptime in seconds
            { name: "cpu_temperature", value: (Math.random() * 30 + 40).toFixed(1) + "°C" }, // Robot CPU temp
            { name: "current_task", value: "Idle" }, // Task might need updating if based on WS state
            { name: "network_status", value: "Connected" }, // Network status might need updating
            { name: "error_logs", value: "None" }, // If any recent errors occurred
            { name: "gnome_mode", value: "Stealth" }, // Playful feature mode
            { name: "firmware_version", value: gnomeBotObjectDetails?.settings?.firmware_version || "Unknown" }, // Firmware tracking
            { name: "gnome_mood", value: ["Happy", "Grumpy", "Mischievous"][Math.floor(Math.random() * 3)] }, // Personality status
            { name: "light_sensor", value: Math.random() > 0.5 ? "Bright" : "Dim" }, // Light environment detection
            { name: "gnome_config_object", value: JSON.stringify(gnomeBotObjectDetails) } // Settings object
        ];
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.render('stats', { gnomeStats: gnomeStats }); // Removed wsUrl
    });

    app.get('/ctrlsignals', (req, res) => {
        const requestPayload = JSON.parse(decodeURIComponent(req.query.message));
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        // Check if the request payload is valid
        if (!requestPayload || !requestPayload.action) {
            console.error("Invalid request payload");
            res.status(400).send('Invalid request payload');
            return;
        }
        // Handle the control signal
        switch (requestPayload.action) {
            case 'move':
                // Handle move action
                console.log(`Moving in direction: ${requestPayload.direction}`);
                res.header('Content-Type', 'application/json');
                // lets set headers so it never caches
                if (!requestPayload.direction) {
                    res.send(JSON.stringify({ type: "message", data: "error", message: "No direction specified" }));
                    return;
                }
                // left right up down
                const direction = requestPayload.direction;
                const command = `/usr/bin/python3 /app/canbus_client.py "${direction}"`; // Construct the command

                switch (direction) {
                    case 'left':
                    case 'right':
                    case 'up':
                    case 'down':
                        console.log(`Executing command: ${command}`);
                        exec(command, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error executing command: ${error.message}`);
                                // Optionally send error back, but the response is already sent
                                return;
                            }
                            if (stderr) {
                                console.error(`Command stderr: ${stderr}`);
                                // Optionally send error back
                                return;
                            }
                            console.log(`Command stdout: ${stdout}`);
                        });
                        res.send(JSON.stringify({ type: "message", data: "success", message: `Moving ${direction}` }));
                        break;
                    default:
                        console.error("Unknown direction");
                        res.send(JSON.stringify({ type: "message", data: "error", message: "Unknown direction" }));
                        return;
                }
                break;
            case 'update':
                try {
                    const { key, subkey, value } = requestPayload;
                    gnomeBotObjectDetails[key][subkey] = value;
                    res.header('Content-Type', 'application/json');
                    res.send(JSON.stringify({ type: "message", data: "success", message: `Updated ${key}.${subkey} to ${value}` }));
                }
                catch (error) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ type: "message", data: "error", message: `Error updating settings: ${error.message}` }));
                }
                break;
            default:
                console.error("Unknown action");
                res.status(400).send('Unknown action');
                return;
        }
    });

    // ✨ Health Check Endpoint
    app.get('/healthz', (req, res) => {
        // Could add checks here (e.g., DB connection) if needed
        res.status(200).send('OK');
    });

    // --- Server Setup ---
    const PORT = process.env.PORT || 3000;
    // Remove http server creation and WebSocket server setup

    // 🚀 Start the server (using app.listen directly)
    app.listen(PORT, () => {
        console.log(`🚀 Server (HTTP only) running on port ${PORT}`); // Updated log message
    });