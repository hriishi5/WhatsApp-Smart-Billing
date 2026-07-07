export function normalizeItem(item) {

  const unitMap = {

    kg: { base: "gm", factor: 1000 },

    g: { base: "gm", factor: 1 },

    gm: { base: "gm", factor: 1 },

    l: { base: "ml", factor: 1000 },

    ml: { base: "ml", factor: 1 },

    dozen: { base: "pcs", factor: 12 },

    piece: { base: "pcs", factor: 1 },

    pieces: { base: "pcs", factor: 1 },

    pcs: { base: "pcs", factor: 1 },

    bottle: { base: "bottle", factor: 1 },

    bottles: { base: "bottle", factor: 1 },

    packet: { base: "packet", factor: 1 },

    packets: { base: "packet", factor: 1 },

    pack: { base: "packet", factor: 1 },

    box: { base: "box", factor: 1 },

    boxes: { base: "box", factor: 1 }

  };

  const words = item.trim().split(/\s+/);

  let quantity = 1;

  let unit = "pcs";

  let product = "";

  // Case 1 → 2kg Chicken

  const attached = words[0].match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);

  if (attached) {

    quantity = parseFloat(attached[1]);

    unit = attached[2].toLowerCase();

    product = words.slice(1).join(" ");

  }

  // Case 2 → 2 Dozen Banana

  else if (

    words.length > 2 &&

    !isNaN(words[0]) &&

    unitMap[words[1].toLowerCase()]

  ) {

    quantity = parseFloat(words[0]);

    unit = words[1].toLowerCase();

    product = words.slice(2).join(" ");

  }

  // Case 3 → 2 Coke

  else if (!isNaN(words[0])) {

    quantity = parseFloat(words[0]);

    product = words.slice(1).join(" ");

  }

  // Case 4 → Coke

  else {

    product = item;

  }

  const map = unitMap[unit] || {

    base: unit,

    factor: 1

  };

  return {

    original: item,

    product,

    displayQuantity: quantity,

    displayUnit: unit,

    normalizedQuantity: quantity * map.factor,

    normalizedUnit: map.base

  };

}