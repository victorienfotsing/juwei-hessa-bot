import * as functions from "firebase-functions";
import * as dotenv from "dotenv";

import {Context, Telegraf} from "telegraf";
import {Update} from "typegram";
import {message} from "telegraf/filters";
import {addVote, getAllVotes} from "./vote";
import {commandArgsMiddleware} from "./commandArgsMiddleware";

dotenv.config();
const bot: Telegraf<Context<Update>> =
  new Telegraf(functions.config().telegrambot?.key ?? process.env.BOT_TOKEN);

bot.use(commandArgsMiddleware());

let isRunning = true;

bot.start((ctx) => {
  ctx.reply(
      `
Hallo ${ctx.from.first_name}!
Gratuliere du hast die Möglichkeit den Gewinn der Jugendweihnachtsfeier 2022 zu gewinnen🤑🔥.

Das Einzige, was du tun musst, ist, die Anzahl der Reiskörner im Glas zu schätzen.

Die besten 6 qualifizieren sich für die nächste Runde 
Viel Glück!
    `
  );
});

bot.command("/juweistop", (ctx) => {
  isRunning = false;
  ctx.reply("Das Spiel wurde gestoppt!");
});

bot.command("/juweistart", (ctx) => {
  isRunning = true;
  ctx.reply("Das Spiel wurde gestartet!");
});

bot.command("/juweiresult", async (ctx) => {
  isRunning = false;
  if (ctx.state.args) {
    const val = +ctx.state.args[0];
    let num = +ctx.state.args[1];
    if (isNaN(num)) num = 6;
    console.dir(num);
    if (!isNaN(val)) {
      const votes = await getAllVotes();
      const bests = [...votes].map((vote) => {
        const est = +vote.val;
        if (isNaN(est)) return undefined;
        return {
          ...vote,
          diff: Math.abs(est - val),
        };
      })
          .filter((vote) => vote !== undefined)
          .sort((a, b) => {
            return a!.diff - b!.diff;
          })
          .slice(0, num);
      console.dir(bests);

      ctx.reply(`
Die folgenden Personen haben sich für die nächste Runde qualifiziert 💯🥳🏅:
${bests.map((b) => b?.name + " " + b?.val + " " + b?.diff + " " + b?.val).join("\n")}
          `);
    } else {
      ctx.reply("retry");
    }
  } else {
    ctx.reply("retry");
  }
});

bot.on(message("text"), async (ctx) => {
  const message = ctx.message;
  const id = message.from.id;
  const name = `${message.from.first_name} ${message.from.last_name ?? ""}`;
  const val = +message.text;
  const chatId = message.chat.id;
  if (!isRunning) {
    ctx.reply("Das Spiel ist schon zu Ende!");
  } else {
    if (!isNaN(val)) {
      const count = await addVote(id, chatId, name, val);
      if (count == 1) {
        ctx.reply("Deine Eingabe wurde gespeichert!").then(() => {
          ctx.reply("Du hast eine letzte Chance, deine Eingabe zu ändern!");
        });
      }
      if (count == 2) {
        ctx.reply("Deine Eingabe wurde endgültig gespeichert!");
      }
    } else {
      ctx.reply("Erneut versuchen!");
    }
  }
});

bot.launch();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const botInit = functions
    .region("europe-west1")
    .https.onRequest((request, response) => {
      bot.handleUpdate(request.body, response);
    });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
