import fs from 'fs';

const items = [
  { id: 'tech_trash', name: 'Tech Trash', scrap: 20, hqm: 1, batchSize: 5, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/techparts.png' },
  { id: 'rifle_body', name: 'Rifle Body', scrap: 25, metal: 100, hqm: 2, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/riflebody.png' },
  { id: 'smg_body', name: 'SMG Body', scrap: 15, metal: 50, hqm: 2, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/smgbody.png' },
  { id: 'semi_body', name: 'Semi-Automatic Body', scrap: 15, metal: 75, hqm: 2, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/semibody.png' },
  { id: 'gears', name: 'Gears', scrap: 10, metal: 50, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/gears.png' },
  { id: 'spring', name: 'Metal Spring', scrap: 10, hqm: 1, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/metalspring.png' },
  { id: 'sheet_metal', name: 'Sheet Metal', scrap: 8, metal: 100, batchSize: 3, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/sheetmetal.png' },
  { id: 'road_signs', name: 'Road Signs', scrap: 5, metal: 50, hqm: 1, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/roadsigns.png' },
  { id: 'pipe', name: 'Metal Pipe', scrap: 5, metal: 50, hqm: 1, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/metalpipe.png' },
  { id: 'blade', name: 'Metal Blade', scrap: 2, metal: 15, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/metalblade.png' },
  { id: 'propane_tank', name: 'Empty Propane Tank', scrap: 1, metal: 50, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/propanetank.png' },
  { id: 'fuse', name: 'Electric Fuse', scrap: 20, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/fuse.png' },
  { id: 'cctv', name: 'CCTV Camera', scrap: 36, hqm: 1.8, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/resources/cctv.camera.png' },
  { id: 'computer', name: 'Targeting Computer', scrap: 60, metal: 50, hqm: 5, batchSize: 1, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/resources/targeting.computer.png' },
  { id: 'sewing_kit', name: 'Sewing Kit', scrap: 0, cloth: 25, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/sewingkit.png' },
  { id: 'rope', name: 'Rope', scrap: 0, cloth: 15, batchSize: 5, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/rope.png' },
  { id: 'tarp', name: 'Tarp', scrap: 0, cloth: 50, batchSize: 2, image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/components/tarp.png' },
];

function formatYield(amount, multiplier) {
  const total = amount * multiplier;
  const guaranteed = Math.floor(total);
  const chance = total - guaranteed;
  if (chance > 0.01) {
    return \`{ itemId: '\${arguments[2]}', amount: \${guaranteed}, chance: \${chance.toFixed(2)} }\`;
  }
  return \`{ itemId: '\${arguments[2]}', amount: \${guaranteed} }\`;
}

let output = \`export type Yield = {
  itemId: string;
  amount: number;
  chance?: number;
};

export type Item = {
  id: string;
  name: string;
  image: string;
  batchSize: number;
  isRaw?: boolean;
  yields?: {
    normal: Yield[];
    safezone: Yield[];
  };
};

export const ITEMS: Item[] = [
  // Raw Materials
  { id: 'scrap', name: 'Scrap', image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/resources/scrap.png', batchSize: 1, isRaw: true },
  { id: 'metal', name: 'Metal Fragments', image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/resources/metal.fragments.png', batchSize: 1, isRaw: true },
  { id: 'hqm', name: 'High Quality Metal', image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/resources/metal.refined.png', batchSize: 1, isRaw: true },
  { id: 'cloth', name: 'Cloth', image: 'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large/resources/cloth.png', batchSize: 1, isRaw: true },
  
  // Components
\`;

for (const item of items) {
  const normal = [];
  const safezone = [];
  
  if (item.scrap) {
    normal.push(formatYield(item.scrap, 1.2, 'scrap'));
    safezone.push(formatYield(item.scrap, 0.8, 'scrap'));
  }
  if (item.metal) {
    normal.push(formatYield(item.metal, 1.2, 'metal'));
    safezone.push(formatYield(item.metal, 0.8, 'metal'));
  }
  if (item.hqm) {
    normal.push(formatYield(item.hqm, 1.2, 'hqm'));
    safezone.push(formatYield(item.hqm, 0.8, 'hqm'));
  }
  if (item.cloth) {
    normal.push(formatYield(item.cloth, 1.2, 'cloth'));
    safezone.push(formatYield(item.cloth, 0.8, 'cloth'));
  }
  
  output += \`  {
    id: '\${item.id}', name: '\${item.name}', image: '\${item.image}', batchSize: \${item.batchSize},
    yields: {
      normal: [\${normal.join(', ')}],
      safezone: [\${safezone.join(', ')}]
    }
  },
\`;
}

output += \`];

export type CalculatedYield = {
  [itemId: string]: number;
};

export function calculateYields(itemId: string, amount: number, type: 'normal' | 'safezone', results: CalculatedYield) {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if (item.isRaw) {
    results[itemId] = (results[itemId] || 0) + amount;
    return;
  }

  if (item.yields) {
    const yields = item.yields[type];
    for (const y of yields) {
      const yieldAmount = y.amount + (y.chance || 0);
      results[y.itemId] = (results[y.itemId] || 0) + amount * yieldAmount;
    }
  }
}
\`;

fs.writeFileSync('src/data/items.ts', output);
