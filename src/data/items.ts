export type Yield = {
  itemId: string;
  amount: number;
  chance?: number;
};

export type RecyclerYields = {
  normal: Yield[];
  safezone: Yield[];
};

export type Item = {
  id: string;
  name: string;
  image: string;
  batchSize: number;
  yields?: RecyclerYields;
  isRaw?: boolean;
};

export const ITEMS: Item[] = [
  // Raw Materials
  { id: 'scrap', name: 'Scrap', image: '/assets/items/scrap.png', batchSize: 1, isRaw: true },
  { id: 'metal', name: 'Metal Fragments', image: '/assets/items/metal.png', batchSize: 1, isRaw: true },
  { id: 'hqm', name: 'High Quality Metal', image: '/assets/items/hqm.png', batchSize: 1, isRaw: true },
  { id: 'cloth', name: 'Cloth', image: '/assets/items/cloth.png', batchSize: 1, isRaw: true },
  
  // Intermediate Components
  { 
    id: 'tech_trash', name: 'Tech Trash', image: '/assets/items/tech_trash.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 24 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }],
      safezone: [{ itemId: 'scrap', amount: 16 }, { itemId: 'hqm', amount: 1, chance: 0.8 }]
    }
  },

  // Base Components
  {
    id: 'sheet_metal', name: 'Sheet Metal', image: '/assets/items/sheet_metal.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 9 }, { itemId: 'metal', amount: 120 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }],
      safezone: [{ itemId: 'scrap', amount: 6 }, { itemId: 'metal', amount: 80 }, { itemId: 'hqm', amount: 1, chance: 0.8 }]
    }
  },
  {
    id: 'gears', name: 'Gears', image: '/assets/items/gears.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 12 }, { itemId: 'metal', amount: 15 }],
      safezone: [{ itemId: 'scrap', amount: 8 }, { itemId: 'metal', amount: 10 }]
    }
  },
  {
    id: 'pipe', name: 'Metal Pipe', image: '/assets/items/pipe.png', batchSize: 2,
    yields: {
      normal: [{ itemId: 'scrap', amount: 6 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }],
      safezone: [{ itemId: 'scrap', amount: 4 }, { itemId: 'hqm', amount: 1, chance: 0.8 }]
    }
  },
  {
    id: 'blade', name: 'Metal Blade', image: '/assets/items/blade.png', batchSize: 2,
    yields: {
      normal: [{ itemId: 'scrap', amount: 2 }, { itemId: 'metal', amount: 18 }],
      safezone: [{ itemId: 'scrap', amount: 1 }, { itemId: 'metal', amount: 12 }]
    }
  },
  {
    id: 'spring', name: 'Metal Spring', image: '/assets/items/spring.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 12 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }],
      safezone: [{ itemId: 'scrap', amount: 8 }, { itemId: 'hqm', amount: 1, chance: 0.8 }]
    }
  },
  {
    id: 'road_signs', name: 'Road Signs', image: '/assets/items/road_signs.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 6 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }],
      safezone: [{ itemId: 'scrap', amount: 4 }, { itemId: 'hqm', amount: 1, chance: 0.8 }]
    }
  },
  {
    id: 'propane_tank', name: 'Empty Propane Tank', image: '/assets/items/propane_tank.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 1 }, { itemId: 'metal', amount: 60 }],
      safezone: [{ itemId: 'metal', amount: 40 }]
    }
  },
  {
    id: 'fuse', name: 'Electric Fuse', image: '/assets/items/fuse.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 24 }],
      safezone: [{ itemId: 'scrap', amount: 16 }]
    }
  },
  {
    id: 'cctv', name: 'CCTV Camera', image: '/assets/items/cctv.png', batchSize: 2,
    yields: {
      normal: [{ itemId: 'tech_trash', amount: 1 }, { itemId: 'hqm', amount: 1 }, { itemId: 'tech_trash', amount: 1, chance: 0.8 }, { itemId: 'hqm', amount: 1, chance: 0.8 }],
      safezone: [{ itemId: 'tech_trash', amount: 1 }, { itemId: 'hqm', amount: 1 }, { itemId: 'tech_trash', amount: 1, chance: 0.2 }, { itemId: 'hqm', amount: 1, chance: 0.2 }]
    }
  },
  {
    id: 'computer', name: 'Targeting Computer', image: '/assets/items/computer.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'tech_trash', amount: 3 }, { itemId: 'metal', amount: 60 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }],
      safezone: [{ itemId: 'tech_trash', amount: 2 }, { itemId: 'metal', amount: 40 }, { itemId: 'hqm', amount: 1, chance: 0.8 }]
    }
  },
  {
    id: 'semi_body', name: 'Semi-Automatic Body', image: '/assets/items/semi_body.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 18 }, { itemId: 'metal', amount: 90 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.8 }],
      safezone: [{ itemId: 'scrap', amount: 12 }, { itemId: 'metal', amount: 60 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }]
    }
  },
  {
    id: 'smg_body', name: 'SMG Body', image: '/assets/items/smg_body.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 18 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.8 }],
      safezone: [{ itemId: 'scrap', amount: 12 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }]
    }
  },
  {
    id: 'rifle_body', name: 'Rifle Body', image: '/assets/items/rifle_body.png', batchSize: 1,
    yields: {
      normal: [{ itemId: 'scrap', amount: 30 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.8 }],
      safezone: [{ itemId: 'scrap', amount: 20 }, { itemId: 'hqm', amount: 1 }, { itemId: 'hqm', amount: 1, chance: 0.2 }]
    }
  },
  {
    id: 'sewing_kit', name: 'Sewing Kit', image: '/assets/items/sewing_kit.png', batchSize: 2,
    yields: {
      normal: [{ itemId: 'cloth', amount: 12 }, { itemId: 'rope', amount: 1 }, { itemId: 'rope', amount: 1, chance: 0.8 }],
      safezone: [{ itemId: 'cloth', amount: 8 }, { itemId: 'rope', amount: 1 }, { itemId: 'rope', amount: 1, chance: 0.2 }]
    }
  },
  {
    id: 'rope', name: 'Rope', image: '/assets/items/rope.png', batchSize: 5,
    yields: {
      normal: [{ itemId: 'cloth', amount: 18 }],
      safezone: [{ itemId: 'cloth', amount: 12 }]
    }
  },
  {
    id: 'tarp', name: 'Tarp', image: '/assets/items/tarp.png', batchSize: 2,
    yields: {
      normal: [{ itemId: 'cloth', amount: 60 }],
      safezone: [{ itemId: 'cloth', amount: 40 }]
    }
  }
];

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
      const yieldAmount = y.chance !== undefined ? y.amount * y.chance : y.amount;
      calculateYields(y.itemId, amount * yieldAmount, type, results);
    }
  }
}

