"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
console.log(process.env.BOT_TOKEN);
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN ?? "");
//# sourceMappingURL=index.js.map