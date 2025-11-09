import readline from "node:readline/promises";

export const getPassword = async (): Promise<string> => {
  const password = process.env["ATDOWN_PASSWORD"];
  if (password) {
    return password;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const input = await rl.question("Password: ");
  rl.close();
  return input;
};
