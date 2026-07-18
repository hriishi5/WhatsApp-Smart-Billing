/*export function parseOrder(message) {
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
}*/ 

export function parseOrder(message) {
  const lines = message
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");

  let customer = "";
  let phone = "";
  let amount = 0;
  let items = [];

  lines.forEach(line => {

    // -----------------------------
    // Phone Number (10 digits)
    // -----------------------------
    if (/^\d{10}$/.test(line)) {
      phone = line;
      return;
    }

    // -----------------------------
    // Total Amount
    // (Only digits)
    // -----------------------------
    if (/^\d+$/.test(line)) {
      amount = Number(line);
      return;
    }

    // -----------------------------
    // Item
    // Starts with quantity
    // Example:
    // 2 Crispy Corn
    // 1 Pepsi
    // 5 Burger
    // -----------------------------
    if (/^\d+\s+.+/.test(line)) {
      items.push(line);
      return;
    }

    // -----------------------------
    // Customer Name
    // -----------------------------
    customer = line;
  });

  return {
    customer,
    phone,
    items,
    amount
  };
}