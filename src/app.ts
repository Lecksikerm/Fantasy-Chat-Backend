import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes";
import chatRoutes from "./modules/chat/chat.routes";
import uploadRoutes from "./routes/upload.routes";
import messageRoutes from "./routes/message.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use("/upload", uploadRoutes);
app.use("/api/messages", messageRoutes)

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.get("/health", (_, res) => res.json({ status: "OK" }));

export default app;

