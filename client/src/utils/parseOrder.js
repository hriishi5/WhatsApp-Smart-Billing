export function parseOrder(message) {
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return {
    customer: lines[0],
    phone: lines[1],
    items: lines.slice(2, lines.length - 1),
    amount: lines[lines.length - 1],
  };
}