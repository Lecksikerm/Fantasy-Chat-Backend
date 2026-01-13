"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redis;
if (process.env.REDIS_URL) {
    exports.redis = redis = new ioredis_1.default(process.env.REDIS_URL, {
        tls: {
            rejectUnauthorized: false
        }
    });
}
else {
    exports.redis = redis = new ioredis_1.default({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379
    });
}
redis.on("connect", () => {
    console.log("Redis connected");
});
redis.on("error", (err) => {
    console.error("Redis error", err);
});
