export const commandArgsMiddleware = () => (ctx: any, next: () => any) => {
  if (ctx.update.message && ctx.update.message.text) {
    const text = ctx.update.message.text.toLowerCase();
    if (text.startsWith("/")) {
      const match = text.match(/^\/([^\s]+)\s?(.+)?/);
      let args: string[] = [];
      let command;
      if (match !== null) {
        if (match[1]) {
          command = match[1];
        }
        if (match[2]) {
          args = match[2].split(" ");
        }
      }

      ctx.state = {
        raw: text,
        command,
        args,
        ...ctx.state,
      };
    }
  }
  return next();
};
