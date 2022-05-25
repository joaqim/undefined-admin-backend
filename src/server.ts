#!/usr/bin/env ts-node

/**
 * Module dependencies.
 */

import http, { Server } from "http";
import app from "./api";

require("dotenv").config();

const { FORTNOX_CLIENT_ID, FORTNOX_CLIENT_SECRET } = process.env;
if (!FORTNOX_CLIENT_ID) throw new Error("Missing env: 'FORTNOX_CLIENT_ID'");
if (!FORTNOX_CLIENT_SECRET) throw new Error("Missing env: 'FORTNOX_CLIENT_SECRET'");

console.info("Starting API setup...");

const port = normalizePort(process.env.PORT ?? 8080);

let server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(value: string | number): number | undefined {
  let port = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(port) || port < 0) return;
  return port;
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(server: Server) {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  console.info(`Listening on ${bind}`);
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: any }) {
  try {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  } catch (err) {
    console.error(`An error occurred while starting this application: ${err}`);
  }
}

app.set("port", port);
server.listen(port);
server.on("error", onError);
server.on("listening", () => onListening(server));
