import * as dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./socket";

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocket(server);

  server.listen(
    {
      port: Number(PORT),
      host: "0.0.0.0"
    },
    () => {
      console.log(` Server running on ${PORT}`);
    }
  );
})();


