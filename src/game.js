const attack = (name, minDamage, maxDamage, accuracy, description, effects = {}) => ({
  type: 'attack', name, minDamage, maxDamage, accuracy, description, ...effects,
})

const defend = (name, guard, focus, description, effects = {}) => ({
  type: 'defend', name, guard, focus, description, ...effects,
})

export const ANIMALS = [
  {
    id: 'tiger', name: 'Tiger', color: '#ee7b24', detail: 'Balanced hunter', archetype: 'all-rounder', col: 0, health: 40, strength: 7, defense: 6, speed: 7, home: 'Sunstripe Jungle', legs: 4,
    budget: { strength: 5, speed: 5, defense: 5, accuracy: 5, utility: 5, initiative: 5 },
    moves: [
      attack('Quick Pounce', 4, 6, 0.96, 'Reliable. Builds +12% focus.', { focusGain: 0.12 }),
      attack('Raking Claws', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Wild Ambush', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Battle Roar', 0.45, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'gorilla', name: 'Gorilla', color: '#6f7781', detail: 'Heavy bruiser', archetype: 'bruiser', col: 1, health: 48, strength: 10, defense: 7, speed: 4, home: 'Mistpeak Rainforest', legs: 4,
    budget: { strength: 8, speed: 2, defense: 7, accuracy: 4, utility: 5, initiative: 4 },
    moves: [
      attack('Knuckle Jab', 5, 7, 0.92, 'Heavy and dependable.'),
      attack('Rock Hurler', 9, 12, 0.72, 'Ignores 25% of guard.', { guardPierce: 0.25 }),
      attack('Ground Breaker', 15, 20, 0.46, 'Massive, guard-breaking hit.', { guardPierce: 0.45 }),
      defend('Iron Chest', 0.7, 0.05, 'The strongest guard in the wild.'),
    ],
  },
  {
    id: 'eagle', name: 'Eagle', color: '#f5d78a', detail: 'Swift trickster', archetype: 'skirmisher', col: 2, health: 30, strength: 5, defense: 4, speed: 10, home: 'Skyreach Cliffs', legs: 2,
    budget: { strength: 2, speed: 8, defense: 2, accuracy: 8, utility: 6, initiative: 4 },
    moves: [
      attack('Wing Feint', 4, 6, 0.99, 'Expose the foe: the next hit deals +2 damage.', { expose: 2 }),
      attack('Talon Rush', 4, 5, 0.84, 'Two separate chances to hit.', { hits: 2 }),
      attack('Skyfall Dive', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Keen Winds', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'crocodile', name: 'Crocodile', color: '#54a84b', detail: 'Armored survivor', archetype: 'survivor', col: 3, health: 44, strength: 8, defense: 10, speed: 5, home: 'Blackwater Mangroves', legs: 4,
    budget: { strength: 5, speed: 3, defense: 8, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Tail Snap', 4, 7, 0.94, 'Reliable pressure attack.'),
      attack('Death Roll', 8, 11, 0.78, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Marsh Lunge', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Scaled Stance', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'rhino', name: 'Rhino', color: '#8d98a5', detail: 'Relentless charger', archetype: 'bruiser', col: 4, health: 52, strength: 10, defense: 9, speed: 3, home: 'Sunstone Savanna', legs: 4,
    budget: { strength: 8, speed: 2, defense: 8, accuracy: 4, utility: 6, initiative: 2 },
    moves: [
      attack('Horn Feint', 5, 8, 0.93, 'Reliable. Slips through 15% of guard.', { guardPierce: 0.15 }),
      attack('Stampede', 9, 11, 0.78, 'Deals +2 through any guard.', { bonusVsGuard: 2 }),
      attack('Horn Charge', 13, 17, 0.6, 'Heavy charge that pierces 35% of guard.', { guardPierce: 0.35 }),
      defend('Thick Hide', 0.66, 0.06, 'Powerful guard with a little focus.'),
    ],
  },
  {
    id: 'hippo', name: 'Hippo', color: '#80708f', detail: 'River powerhouse', archetype: 'bruiser', col: 5, health: 56, strength: 11, defense: 8, speed: 3, home: 'Sunset Riverbank', legs: 4,
    budget: { strength: 9, speed: 2, defense: 8, accuracy: 5, utility: 4, initiative: 2 },
    moves: [
      attack('Jaw Jab', 5, 7, 0.95, 'Short-range, dependable bite.'),
      attack('River Rush', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Crushing Bite', 12, 16, 0.64, 'A fearsome all-or-nothing chomp.'),
      defend('Mud Wall', 0.675, 0.03, 'Heavy guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'horse', name: 'Horse', color: '#c56c2d', detail: 'Fleet combo fighter', archetype: 'skirmisher', col: 6, health: 36, strength: 5, defense: 4, speed: 9, home: 'Wildflower Prairie', legs: 4,
    budget: { strength: 3, speed: 8, defense: 3, accuracy: 7, utility: 5, initiative: 4 },
    moves: [
      attack('Dust Feint', 6, 9, 0.97, "Daze the foe: their next attack loses 10% accuracy.", { daze: 0.1 }),
      attack('Gallop Combo', 4, 5, 0.8, 'Two separate chances to connect.', { hits: 2 }),
      attack('Rear Kick', 11, 15, 0.7, 'Strong. Gain 12% evasion.', { evasionGain: 0.12 }),
      defend('Second Wind', 0.35, 0.2, 'Light guard with focus and evasion.', { evasionGain: 0.1 }),
    ],
  },
  {
    id: 'elephant', name: 'Elephant', color: '#718da2', detail: 'Steady tactician', archetype: 'survivor', col: 7, health: 60, strength: 9, defense: 8, speed: 5, home: 'Baobab Floodplain', legs: 4,
    budget: { strength: 7, speed: 3, defense: 8, accuracy: 5, utility: 4, initiative: 3 },
    moves: [
      attack('Trunk Tap', 4, 6, 0.96, 'Reliable pressure attack.'),
      attack('Tusk Sweep', 8, 11, 0.82, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Earthshaker', 13, 17, 0.62, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Memory Guard', 0.62, 0.1, 'Strong guard with measured focus.'),
    ],
  },
  {
    id: 'grizzly-bear', name: 'Grizzly Bear', color: '#9a582d', detail: 'Savage grappler', archetype: 'bruiser', col: 8, health: 50, strength: 9, defense: 7, speed: 4, home: 'Cedar Run', legs: 4,
    budget: { strength: 7, speed: 3, defense: 6, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Paw Swipe', 5, 7, 0.95, 'Reliable. Builds +8% focus.', { focusGain: 0.08 }),
      attack('Mauling Rush', 4, 5, 0.82, 'Two separate chances to hit.', { hits: 2 }),
      attack('Bear Hug', 12, 16, 0.58, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      defend('Den Up', 0.64, 0.05, 'Strong guard, 10% evasion, and recover 2 HP.', { evasionGain: 0.1, heal: 2 }),
    ],
  },
  {
    id: 'polar-bear', name: 'Polar Bear', color: '#dbe8ef', detail: 'Cold opportunist', archetype: 'all-rounder', col: 9, health: 46, strength: 8, defense: 6, speed: 6, home: 'Aurora Ice Shelf', legs: 4,
    budget: { strength: 6, speed: 5, defense: 5, accuracy: 6, utility: 5, initiative: 3 },
    moves: [
      attack('Frost Feint', 3, 5, 0.97, 'Reliable. Gain 10% evasion.', { evasionGain: 0.1 }),
      attack('Ice Claws', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Glacier Crash', 12, 15, 0.64, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Snowdrift Guard', 0.55, 0.14, 'Guard, focus, and recover 1 HP.', { heal: 1 }),
    ],
  },
  {
    id: 'wolf', name: 'Wolf', color: '#7f8995', detail: 'Pack tactician', archetype: 'all-rounder', col: 10, health: 38, strength: 7, defense: 6, speed: 7, home: 'Moonpine Valley', legs: 4,
    budget: { strength: 5, speed: 6, defense: 5, accuracy: 6, utility: 5, initiative: 3 },
    moves: [
      attack('Driving Bite', 4, 6, 0.96, 'Reliable. Builds +13% focus.', { focusGain: 0.13 }),
      attack('Pack Feint', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Hamstring Rush', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Circle Up', 0.45, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'komodo-dragon', name: 'Komodo Dragon', color: '#76694f', detail: 'Patient predator', archetype: 'survivor', col: 11, health: 45, strength: 8, defense: 10, speed: 5, home: 'Sundown Scrubland', legs: 4,
    budget: { strength: 6, speed: 3, defense: 8, accuracy: 4, utility: 6, initiative: 3 },
    moves: [
      attack('Claw Rake', 4, 7, 0.95, 'Reliable pressure attack.'),
      attack('Venom Bite', 6, 9, 0.78, "Poison for 1 damage after each of the foe's next 3 moves.", { poison: { damage: 1, turns: 3 } }),
      attack('Ambush Bite', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Burrow Brace', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'lion', name: 'Lion', color: '#d39235', detail: 'Regal finisher', archetype: 'bruiser', col: 12, health: 49, strength: 10, defense: 7, speed: 4, home: 'Golden Grasslands', legs: 4,
    budget: { strength: 8, speed: 2, defense: 7, accuracy: 4, utility: 5, initiative: 4 },
    moves: [
      attack('Paw Strike', 5, 7, 0.92, 'Heavy and dependable.'),
      attack('Mane Rush', 9, 12, 0.72, 'Ignores 25% of guard.', { guardPierce: 0.25 }),
      attack('Throat Lunge', 15, 20, 0.46, 'Massive, guard-breaking hit.', { guardPierce: 0.45 }),
      defend('Pride Stance', 0.69, 0.05, 'A commanding guard with a little focus.'),
    ],
  },
  {
    id: 'anaconda', name: 'Anaconda', color: '#768c3a', detail: 'Coiling controller', archetype: 'tactician', col: 13, health: 42, strength: 7, defense: 6, speed: 7, home: 'Emerald Backwater', legs: 0,
    budget: { strength: 5, speed: 6, defense: 5, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Snap Bite', 4, 6, 0.96, 'Reliable. Builds +12% focus.', { focusGain: 0.12 }),
      attack('Coil Crush', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Constrict', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Tight Coil', 0.46, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'water-buffalo', name: 'Water Buffalo', color: '#665e56', detail: 'Marsh juggernaut', archetype: 'bruiser', col: 14, health: 58, strength: 11, defense: 8, speed: 3, home: 'Monsoon Wetlands', legs: 4,
    budget: { strength: 9, speed: 2, defense: 8, accuracy: 5, utility: 4, initiative: 2 },
    moves: [
      attack('Horn Jab', 5, 7, 0.95, 'Short-range, dependable strike.'),
      attack('Marsh Trample', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Floodplain Charge', 12, 16, 0.64, 'A fearsome all-or-nothing charge.'),
      defend('Mud Brace', 0.67, 0.03, 'Heavy guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'shark', name: 'Shark', color: '#507f9b', detail: 'Relentless striker', archetype: 'all-rounder', col: 15, health: 47, strength: 8, defense: 6, speed: 6, home: 'Bluewater Reef', legs: 0,
    budget: { strength: 6, speed: 5, defense: 4, accuracy: 6, utility: 5, initiative: 4 },
    moves: [
      attack('Bite Feint', 4, 6, 0.97, 'Reliable. Gain 4% evasion.', { evasionGain: 0.04 }),
      attack('Ramming Strike', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Breach Attack', 12, 15, 0.64, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Countercurrent', 0.55, 0.14, 'Guard, focus, and recover 1 HP.', { heal: 1 }),
    ],
  },
  {
    id: 'orca', name: 'Orca', color: '#394b61', detail: 'Ocean powerhouse', archetype: 'all-rounder', col: 16, health: 54, strength: 9, defense: 8, speed: 6, home: 'Kelp Channel', legs: 0,
    budget: { strength: 7, speed: 5, defense: 7, accuracy: 5, utility: 3, initiative: 3 },
    moves: [
      attack('Tail Slap', 3, 5, 0.96, 'Reliable pressure attack.'),
      attack('Wave Ram', 9, 12, 0.82, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Surge Breach', 12, 16, 0.62, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Pod Circle', 0.62, 0.11, 'Strong guard with measured focus.'),
    ],
  },
  {
    id: 'ostrich', name: 'Ostrich', color: '#d6c2a1', detail: 'Fleet kicker', archetype: 'skirmisher', col: 17, health: 34, strength: 5, defense: 4, speed: 10, home: 'Acacia Flats', legs: 2,
    budget: { strength: 3, speed: 8, defense: 3, accuracy: 7, utility: 5, initiative: 4 },
    moves: [
      attack('Beak Jab', 4, 6, 0.99, 'Reliable. Gain 16% evasion.', { evasionGain: 0.16 }),
      attack('Double Kick', 4, 5, 0.84, 'Two separate chances to connect.', { hits: 2 }),
      attack('Sprint Kick', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Wing Screen', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'falcon', name: 'Falcon', color: '#9c8062', detail: 'Aerial daredevil', archetype: 'skirmisher', col: 18, health: 28, strength: 5, defense: 4, speed: 10, home: 'Redstone Aerie', legs: 2,
    budget: { strength: 2, speed: 8, defense: 2, accuracy: 8, utility: 6, initiative: 4 },
    moves: [
      attack('Dust Dive', 4, 6, 0.98, "Daze the foe: their next attack loses 12% accuracy.", { daze: 0.12 }),
      attack('Talon Flurry', 4, 5, 0.84, 'Two separate chances to hit.', { hits: 2 }),
      attack('Stooping Dive', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Thermal Ride', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'octopus', name: 'Octopus', color: '#b65f48', detail: 'Elusive grappler', archetype: 'tactician', col: 19, health: 41, strength: 8, defense: 9, speed: 5, home: 'Tidepool Grotto', legs: 8,
    budget: { strength: 5, speed: 3, defense: 8, accuracy: 4, utility: 7, initiative: 3 },
    moves: [
      attack('Arm Snap', 4, 6, 0.92, 'Reliable pressure attack.'),
      attack('Sucker Grip', 8, 11, 0.78, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Beak Bite', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Ink Screen', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'panda', name: 'Panda', color: '#d9d5c9', detail: 'Bamboo counterpuncher', archetype: 'survivor', col: 20, health: 48, strength: 8, defense: 8, speed: 5, home: 'Cloudbamboo Grove', legs: 4,
    budget: { strength: 6, speed: 3, defense: 7, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Bamboo Jab', 4, 7, 0.95, 'Reliable. Builds +9% focus.', { focusGain: 0.09 }),
      attack('Rolling Swipe', 7, 10, 0.8, 'Deals +2 through any guard.', { bonusVsGuard: 2 }),
      attack('Shoulder Tumble', 11, 15, 0.63, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Bamboo Brace', 0.58, 0.09, 'Strong guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'hawk', name: 'Hawk', color: '#a66b35', detail: 'Precision harrier', archetype: 'skirmisher', col: 21, health: 29, strength: 5, defense: 4, speed: 10, home: 'Copperwind Mesa', legs: 2,
    budget: { strength: 2, speed: 8, defense: 2, accuracy: 8, utility: 6, initiative: 4 },
    moves: [
      attack('Raking Pass', 4, 6, 0.99, 'Expose the foe: the next hit deals +1 damage.', { expose: 1 }),
      attack('Talon Barrage', 4, 5, 0.87, 'Two precise chances that pierce 12% of guard.', { hits: 2, guardPierce: 0.12 }),
      attack('Redtail Dive', 10, 14, 0.69, 'Strong. Gain 19% evasion.', { evasionGain: 0.19 }),
      defend('Ride the Updraft', 0.28, 0.3, 'Use altitude for focus and evasion.', { evasionGain: 0.17 }),
    ],
  },
  {
    id: 'honey-badger', name: 'Honey Badger', color: '#9e947d', detail: 'Fearless scrapper', archetype: 'survivor', col: 22, health: 35, strength: 7, defense: 9, speed: 7, home: 'Termitebrush Hollow', legs: 4,
    budget: { strength: 6, speed: 4, defense: 7, accuracy: 4, utility: 6, initiative: 3 },
    moves: [
      attack('Burrow Jab', 4, 6, 0.96, 'Reliable pressure attack.'),
      attack('Fearless Rush', 8, 11, 0.8, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Clamp and Twist', 12, 16, 0.62, 'Pierces 32% of guard.', { guardPierce: 0.32 }),
      defend('Loose-Hide Roll', 0.57, 0.09, 'Guard, slip away, and recover 1 HP.', { evasionGain: 0.08, heal: 1 }),
    ],
  },
  {
    id: 'leopard', name: 'Leopard', color: '#d49a3a', detail: 'Explosive ambusher', archetype: 'skirmisher', col: 23, health: 39, strength: 5, defense: 4, speed: 9, home: 'Dappled Kopje', legs: 4,
    budget: { strength: 4, speed: 8, defense: 3, accuracy: 6, utility: 5, initiative: 4 },
    moves: [
      attack('Spot-Step Feint', 5, 7, 0.97, 'Reliable. Gain 9% evasion.', { evasionGain: 0.09 }),
      attack('Branch Ambush', 7, 10, 0.81, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Rosette Rush', 11, 15, 0.58, 'Pierces 34% of guard.', { guardPierce: 0.34 }),
      defend('Canopy Stalk', 0.4, 0.2, 'Guard, focus, and vanish into cover.', { evasionGain: 0.1 }),
    ],
  },
  {
    id: 'panther', name: 'Panther', color: '#393846', detail: 'Shadow tactician', archetype: 'tactician', col: 24, health: 40, strength: 6, defense: 6, speed: 8, home: 'Moonshade Jungle', legs: 4,
    budget: { strength: 5, speed: 6, defense: 4, accuracy: 5, utility: 7, initiative: 3 },
    moves: [
      attack('Shadow Probe', 4, 6, 0.94, 'Expose the foe: the next hit deals +2 damage.', { expose: 2 }),
      attack('Night Claws', 6, 9, 0.83, 'Deals +2 to wounded foes and pierces 12% of guard.', { bonusBelowHalf: 2, guardPierce: 0.12 }),
      attack('Blackout Pounce', 10, 14, 0.61, 'Gain 12% evasion after landing.', { evasionGain: 0.12 }),
      defend('Fade to Black', 0.4, 0.18, 'Guard, focus, and gain 10% evasion.', { evasionGain: 0.1 }),
    ],
  },
  {
    id: 'moose', name: 'Moose', color: '#765236', detail: 'Antlered juggernaut', archetype: 'bruiser', col: 25, health: 55, strength: 10, defense: 8, speed: 4, home: 'Mirrorlake Taiga', legs: 4,
    budget: { strength: 8, speed: 2, defense: 8, accuracy: 4, utility: 5, initiative: 3 },
    moves: [
      attack('Antler Check', 5, 7, 0.94, 'Heavy, dependable pressure.'),
      attack('Bog Charge', 8, 11, 0.76, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Broadside Rush', 14, 18, 0.54, 'Massive hit that pierces 40% of guard.', { guardPierce: 0.4 }),
      defend('Taiga Stand', 0.68, 0.05, 'Root down behind a towering guard.'),
    ],
  },
  {
    id: 'yak', name: 'Yak', color: '#6f4933', detail: 'Highland survivor', archetype: 'survivor', col: 26, health: 53, strength: 9, defense: 9, speed: 3, home: 'Snowpass Plateau', legs: 4,
    budget: { strength: 6, speed: 2, defense: 9, accuracy: 4, utility: 6, initiative: 3 },
    moves: [
      attack('Horn Nudge', 5, 8, 0.95, 'Reliable highland pressure.'),
      attack('Shaggy Shove', 9, 12, 0.79, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Mountain Drive', 14, 18, 0.63, 'Recover 2 HP on a hit.', { heal: 2 }),
      defend('Woolly Bulwark', 0.7, 0.04, 'The mountain coat absorbs the charge.', { heal: 1 }),
    ],
  },
  {
    id: 'bull', name: 'Bull', color: '#8c4430', detail: 'Headlong bruiser', archetype: 'bruiser', col: 27, health: 52, strength: 10, defense: 8, speed: 4, home: 'Dusthorn Dehesa', legs: 4,
    budget: { strength: 9, speed: 2, defense: 7, accuracy: 4, utility: 5, initiative: 3 },
    moves: [
      attack('Horn Fake', 5, 8, 0.93, 'Reliable. Builds +7% focus.', { focusGain: 0.07 }),
      attack('Dust Charge', 9, 12, 0.73, 'Pierces 28% of guard.', { guardPierce: 0.28 }),
      attack('Redline Rush', 15, 19, 0.47, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Hoof the Earth', 0.65, 0.07, 'Brace behind a stubborn guard.'),
    ],
  },
  {
    id: 'snow-leopard', name: 'Snow Leopard', color: '#b9b8ad', detail: 'Alpine ambusher', archetype: 'skirmisher', col: 28, health: 37, strength: 5, defense: 5, speed: 9, home: 'Ghostpeak Ledges', legs: 4,
    budget: { strength: 4, speed: 8, defense: 3, accuracy: 6, utility: 5, initiative: 4 },
    moves: [
      attack('Snowstep', 5, 8, 0.98, 'Reliable. Gain 13% evasion.', { evasionGain: 0.13 }),
      attack('Cliffside Combo', 4, 5, 0.82, 'Two separate chances to connect.', { hits: 2 }),
      attack('Ghost Pounce', 11, 15, 0.66, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      defend('Whiteout Stalk', 0.34, 0.24, 'Use the terrain for focus and evasion.', { evasionGain: 0.13 }),
    ],
  },
  {
    id: 'king-cobra', name: 'King Cobra', color: '#8b7040', detail: 'Venomous zoner', archetype: 'tactician', col: 29, health: 31, strength: 5, defense: 4, speed: 9, home: 'Monsoon Ruins', legs: 0,
    budget: { strength: 3, speed: 7, defense: 3, accuracy: 6, utility: 8, initiative: 3 },
    moves: [
      attack('Hood Feint', 5, 7, 0.98, "Daze the foe: their next attack loses 11% accuracy.", { daze: 0.11 }),
      attack('Venom Fang', 6, 9, 0.81, "Poison for 1 damage after each of the foe's next 4 moves.", { poison: { damage: 1, turns: 4 } }),
      attack('Rising Strike', 11, 15, 0.67, 'Gain 15% evasion after landing.', { evasionGain: 0.15 }),
      defend('Swaying Hood', 0.3, 0.27, 'Track the foe while swaying clear.', { evasionGain: 0.18 }),
    ],
  },
  {
    id: 'hammerhead-shark', name: 'Hammerhead Shark', color: '#63879a', detail: 'Wide-sense hunter', archetype: 'all-rounder', col: 30, health: 46, strength: 7, defense: 7, speed: 7, home: 'Seamount Passage', legs: 0,
    budget: { strength: 6, speed: 5, defense: 5, accuracy: 6, utility: 5, initiative: 3 },
    moves: [
      attack('Wide Sweep', 4, 6, 0.97, 'Expose the foe: the next hit deals +2 damage.', { expose: 2 }),
      attack('Head Ram', 8, 11, 0.81, 'Deals +2 through any guard.', { bonusVsGuard: 2 }),
      attack('Sensor Rush', 12, 16, 0.62, 'Pierces 31% of guard.', { guardPierce: 0.31 }),
      defend('Schooling Turn', 0.53, 0.14, 'Circle into guard and focus.'),
    ],
  },
  {
    id: 'alligator', name: 'Alligator', color: '#4f763f', detail: 'Swamp counterfighter', archetype: 'survivor', col: 31, health: 45, strength: 8, defense: 10, speed: 5, home: 'Cypress Bayou', legs: 4,
    budget: { strength: 6, speed: 3, defense: 8, accuracy: 4, utility: 6, initiative: 3 },
    moves: [
      attack('Bayou Snap', 4, 7, 0.95, 'Reliable pressure attack.'),
      attack('Tail Counter', 7, 10, 0.8, 'Deals +4 through any guard.', { bonusVsGuard: 4 }),
      attack('Gator Roll', 11, 15, 0.63, 'Recover 2 HP on a hit.', { heal: 2 }),
      defend('Muck Hide', 0.61, 0.07, 'Guard and recover 3 HP.', { heal: 3 }),
    ],
  },
  {
    id: 'warthog', name: 'Warthog', color: '#8b6848', detail: 'Scrappy charger', archetype: 'bruiser', col: 32, health: 43, strength: 8, defense: 7, speed: 5, home: 'Thornscrub Pan', legs: 4,
    budget: { strength: 7, speed: 5, defense: 6, accuracy: 4, utility: 5, initiative: 3 },
    moves: [
      attack('Tusk Jab', 4, 7, 0.95, 'Reliable. Slips through 12% of guard.', { guardPierce: 0.12 }),
      attack('Scrub Rush', 8, 11, 0.78, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Mudburst Charge', 12, 16, 0.59, 'Pierces 36% of guard.', { guardPierce: 0.36 }),
      defend('Dust Wallow', 0.54, 0.1, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'giraffe', name: 'Giraffe', color: '#d5a34b', detail: 'Long-range kicker', archetype: 'skirmisher', col: 33, health: 51, strength: 7, defense: 5, speed: 8, home: 'Umbrella Acacia Rise', legs: 4,
    budget: { strength: 4, speed: 7, defense: 4, accuracy: 7, utility: 4, initiative: 4 },
    moves: [
      attack('Neck Check', 4, 6, 0.98, 'Reliable. Builds +10% focus.', { focusGain: 0.1 }),
      attack('Stilt-Step Kicks', 4, 5, 0.81, 'Two long-range chances to connect.', { hits: 2 }),
      attack('Towering Kick', 11, 15, 0.65, 'Strong. Gain 11% evasion.', { evasionGain: 0.11 }),
      defend('High Lookout', 0.36, 0.23, 'See the attack coming and step aside.', { evasionGain: 0.1 }),
    ],
  },
  {
    id: 'skunk', name: 'Skunk', color: '#c9c6b9', detail: 'Scent-screen trickster', archetype: 'tactician', col: 34, health: 27, strength: 4, defense: 4, speed: 7, home: 'Fernwood Burrow', legs: 4,
    budget: { strength: 3, speed: 6, defense: 4, accuracy: 6, utility: 8, initiative: 3 },
    moves: [
      attack('Warning Stomp', 5, 7, 0.99, "Daze the foe: their next attack loses 16% accuracy.", { daze: 0.16 }),
      attack('Scent Screen', 7, 10, 0.88, 'Expose the distracted foe for +3 damage.', { expose: 3 }),
      attack('Turnabout Bite', 11, 15, 0.7, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      defend('Tail Warning', 0.24, 0.28, 'Keep distance with focus and evasion.', { evasionGain: 0.22 }),
    ],
  },
  {
    id: 'bunny', name: 'Bunny', color: '#cbb9a1', detail: 'Alert evasive kicker', archetype: 'skirmisher', col: 35, health: 24, strength: 4, defense: 3, speed: 9, home: 'Bramble Meadow', legs: 4,
    budget: { strength: 2, speed: 9, defense: 3, accuracy: 8, utility: 6, initiative: 2 },
    moves: [
      attack('Feinting Hop', 6, 8, 0.99, 'Sidestep and gain 16% evasion.', { evasionGain: 0.16 }),
      attack('Double Kick', 4, 5, 0.86, 'Two grounded hind-leg kicks.', { hits: 2 }),
      attack('Breakaway Kick', 10, 14, 0.7, 'Kick, then gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Bramble Cover', 0.25, 0.25, 'Use cover and watch for an opening.', { evasionGain: 0.18 }),
    ],
  },
  {
    id: 'goat', name: 'Goat', color: '#bca981', detail: 'Sure-footed duelist', archetype: 'all-rounder', col: 36, health: 33, strength: 6, defense: 6, speed: 8, home: 'Highcrag Pasture', legs: 4,
    budget: { strength: 4, speed: 6, defense: 5, accuracy: 6, utility: 5, initiative: 4 },
    moves: [
      attack('Horn Tap', 4, 6, 0.98, 'Reliable. Builds +11% focus.', { focusGain: 0.11 }),
      attack('Cliffside Ram', 8, 11, 0.82, 'Pierces 22% of guard.', { guardPierce: 0.22 }),
      attack('Bounding Bash', 11, 14, 0.66, 'Gain 13% evasion after landing.', { evasionGain: 0.13 }),
      defend('Sure-Footed Stance', 0.43, 0.18, 'Brace, focus, and step clear.', { evasionGain: 0.08 }),
    ],
  },
  {
    id: 'dolphin', name: 'Dolphin', color: '#62a9bb', detail: 'Echolocating tactician', archetype: 'tactician', col: 37, health: 44, strength: 6, defense: 6, speed: 9, home: 'Sunlit Atoll', legs: 0,
    budget: { strength: 4, speed: 7, defense: 4, accuracy: 6, utility: 6, initiative: 3 },
    moves: [
      attack('Echo Ping', 3, 5, 0.99, 'Expose the foe: the next hit deals +2 damage.', { expose: 2 }),
      attack('Pod Rush', 3, 4, 0.84, 'Two coordinated chances to hit.', { hits: 2 }),
      attack('Spiral Ram', 10, 14, 0.68, 'Gain 16% evasion after landing.', { evasionGain: 0.16 }),
      defend('Slipstream', 0.32, 0.26, 'Use the current for focus and evasion.', { evasionGain: 0.16 }),
    ],
  },
  {
    id: 'dog', name: 'Dog', color: '#b97a43', detail: 'Tenacious team fighter', archetype: 'all-rounder', col: 38, health: 34, strength: 6, defense: 5, speed: 8, home: 'Hillside Farm', legs: 4,
    budget: { strength: 4, speed: 6, defense: 4, accuracy: 7, utility: 5, initiative: 4 },
    moves: [
      attack('Nipping Feint', 4, 6, 0.98, "Daze the foe: their next attack loses 9% accuracy.", { daze: 0.09 }),
      attack('Driving Bite', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Bounding Tackle', 11, 15, 0.67, 'Gain 12% evasion after landing.', { evasionGain: 0.12 }),
      defend('Circle the Flock', 0.4, 0.2, 'Guard, focus, and recover 1 HP.', { heal: 1 }),
    ],
  },
]

export const strengthBonus = (strength) => Math.round((strength - 7) * 0.5)
export const defenseMultiplier = (defense) => 1 - (defense - 6) * 0.01
export const turnDelay = (speed) => 1 + (10 - speed) * 0.06

export function getDamageRange(animal, move) {
  if (move.type !== 'attack') return null
  const bonus = strengthBonus(animal.strength)
  return {
    min: Math.max(1, move.minDamage + bonus),
    max: Math.max(1, move.maxDamage + bonus),
    hits: move.hits ?? 1,
  }
}

export function getOpeningActor(animals, random = Math.random) {
  if (animals[0].speed === animals[1].speed) return random() < 0.5 ? 0 : 1
  return animals[0].speed > animals[1].speed ? 0 : 1
}

export function createFighter(animal) {
  return {
    animal,
    health: animal.health,
    guard: 0,
    focus: 0,
    evasion: 0,
    poisoned: null,
    exposed: 0,
    dazed: 0,
    defenseReady: true,
    initiative: 0,
  }
}

export function getLegalMoves(player) {
  return player.animal.moves.filter((move) => move.type !== 'defend' || player.defenseReady)
}

const damageTakenMultiplier = (animal) => animal.health / 40

const resolvedHitDamage = (damage, defender, guardReduction) => Math.max(1, Math.ceil(
  damage * (1 - guardReduction) * damageTakenMultiplier(defender.animal) * defenseMultiplier(defender.animal.defense),
))

function expectedAttackDamage(attacker, defender, move) {
  const range = getDamageRange(attacker.animal, move)
  const accuracy = clampAccuracy(move.accuracy + attacker.focus - defender.evasion - (attacker.dazed ?? 0))
  const guarded = defender.guard > 0
  const bonus = (defender.health <= defender.animal.health / 2 ? move.bonusBelowHalf ?? 0 : 0)
    + (guarded ? move.bonusVsGuard ?? 0 : 0)
  const averageHit = (range.min + range.max) / 2 + bonus
  const guardReduction = guarded ? Math.max(0, defender.guard - (move.guardPierce ?? 0)) : 0
  const baseDamage = resolvedHitDamage(averageHit, defender, guardReduction) * range.hits * accuracy
  const exposedDamage = defender.exposed
    ? resolvedHitDamage(defender.exposed, defender, guardReduction) * (1 - (1 - accuracy) ** range.hits)
    : 0
  return baseDamage + exposedDamage
}

export function chooseCpuMove(players, active, random = Math.random) {
  const attacker = players[active]
  const defender = players[1 - active]
  const legalMoves = getLegalMoves(attacker)
  let bestMove = legalMoves[0]
  let bestScore = -Infinity

  for (const move of legalMoves) {
    let score
    if (move.type === 'attack') {
      const expectedDamage = expectedAttackDamage(attacker, defender, move)
      const reliableFinish = defender.health <= expectedDamage && move.accuracy >= 0.8 ? 5 : 0
      const currentPoisonValue = (defender.poisoned?.damage ?? 0) * (defender.poisoned?.turns ?? 0)
      const nextPoisonValue = move.poison
        ? Math.max(defender.poisoned?.damage ?? 0, move.poison.damage)
          * Math.max(defender.poisoned?.turns ?? 0, move.poison.turns)
        : currentPoisonValue
      const utility = (move.heal ?? 0) * (attacker.health < attacker.animal.health ? 0.7 : 0)
        + (move.focusGain ?? 0) * 8
        + (move.evasionGain ?? 0) * 7
        + (nextPoisonValue - currentPoisonValue) * 0.8
        + Math.max(0, (move.expose ?? 0) - (defender.exposed ?? 0)) * 0.8
        + Math.max(0, (move.daze ?? 0) - (defender.dazed ?? 0)) * 10
      score = expectedDamage + reliableFinish + utility
    } else {
      const missingHealth = attacker.animal.health - attacker.health
      const healthPressure = (1 - attacker.health / attacker.animal.health) * 10
      const incomingThreat = expectedAttackDamage(defender, attacker, defender.animal.moves[1])
      score = healthPressure + move.guard * incomingThreat + move.focus * 9
        + (move.evasionGain ?? 0) * 8 + Math.min(missingHealth, move.heal ?? 0)
      if (attacker.health === attacker.animal.health && !defender.guard) score -= 3
    }

    // A small independent preference roll keeps equally sound turns from becoming scripted.
    score += random() * 4
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

function rollDamage(animal, move, random) {
  const range = getDamageRange(animal, move)
  return Math.floor(random() * (range.max - range.min + 1)) + range.min
}

function nextActor(players, acting) {
  players[acting].initiative += turnDelay(players[acting].animal.speed)
  const other = 1 - acting
  if (players[acting].initiative < players[other].initiative) return acting
  if (players[acting].initiative > players[other].initiative) return other
  return players[acting].animal.speed > players[other].animal.speed ? acting : other
}

const clampAccuracy = (value) => Math.max(0.25, Math.min(0.99, value))

function applyPoisonTick(player) {
  if (!player.poisoned) return null
  const damage = Math.min(player.health, player.poisoned.damage)
  const turns = player.poisoned.turns - 1
  player.health -= damage
  player.poisoned = turns > 0 ? { ...player.poisoned, turns } : null
  return { damage, turns }
}

function finishAction(nextPlayers, active, message, winner = null) {
  let resolvedWinner = winner
  let resolvedMessage = message

  const poisonTick = applyPoisonTick(nextPlayers[active])
  if (poisonTick) {
    const turnsLeft = poisonTick.turns > 0 ? ` ${poisonTick.turns} move${poisonTick.turns === 1 ? '' : 's'} left.` : ' The poison faded.'
    resolvedMessage += ` Venom dealt ${poisonTick.damage} damage to ${nextPlayers[active].animal.name}.${turnsLeft}`
    if (nextPlayers[active].health === 0) resolvedWinner = 1 - active
  }

  return {
    players: nextPlayers,
    message: resolvedMessage,
    log: resolvedMessage,
    winner: resolvedWinner,
    nextActive: resolvedWinner === null ? nextActor(nextPlayers, active) : resolvedWinner,
  }
}

export function resolveAction(players, active, move, random = Math.random) {
  const nextPlayers = players.map((player) => ({ ...player }))
  const attacker = nextPlayers[active]
  const defender = nextPlayers[1 - active]
  const attackerName = attacker.animal.name
  const defenderName = defender.animal.name

  if (move.type === 'defend') {
    if (!attacker.defenseReady) {
      return { players, message: `${move.name} needs an attack to recharge.`, log: null, winner: null, nextActive: active }
    }
    attacker.guard = move.guard
    attacker.focus = move.focus
    attacker.evasion = Math.max(attacker.evasion, move.evasionGain ?? 0)
    attacker.health = Math.min(attacker.animal.health, attacker.health + (move.heal ?? 0))
    attacker.defenseReady = false
    const effects = [`${Math.round(move.guard * 100)}% guard`]
    if (move.focus) effects.push(`+${Math.round(move.focus * 100)}% focus`)
    if (move.evasionGain) effects.push(`+${Math.round(move.evasionGain * 100)}% evasion`)
    if (move.heal) effects.push(`healed ${move.heal}`)
    const message = `${attackerName} used ${move.name}: ${effects.join(', ')}.`
    return finishAction(nextPlayers, active, message)
  }

  const guardValue = defender.guard
  const guarded = guardValue > 0
  const targetWasWounded = defender.health <= defender.animal.health / 2
  const accuracy = clampAccuracy(move.accuracy + attacker.focus - defender.evasion - (attacker.dazed ?? 0))
  const focused = attacker.focus > 0
  const evasive = defender.evasion > 0
  const dazed = (attacker.dazed ?? 0) > 0
  const hitCount = move.hits ?? 1
  let landedHits = 0
  let totalDamage = 0
  let exposedBonus = 0

  attacker.focus = 0
  attacker.dazed = 0
  attacker.defenseReady = true
  defender.guard = 0
  defender.evasion = 0

  for (let hit = 0; hit < hitCount; hit += 1) {
    if (random() >= accuracy) continue
    landedHits += 1
    let damage = rollDamage(attacker.animal, move, random)
    if (targetWasWounded) damage += move.bonusBelowHalf ?? 0
    if (guarded) damage += move.bonusVsGuard ?? 0
    if (defender.exposed) {
      exposedBonus = defender.exposed
      damage += defender.exposed
      defender.exposed = 0
    }
    const guardReduction = Math.max(0, guardValue - (move.guardPierce ?? 0))
    totalDamage += resolvedHitDamage(damage, defender, guardReduction)
  }

  if (landedHits === 0) {
    const details = [evasive ? `${defenderName} evaded` : 'it missed', dazed ? 'daze cut accuracy' : null, guarded ? 'guard expired' : null].filter(Boolean).join(', ')
    const message = `${attackerName} used ${move.name} — ${details}!`
    return finishAction(nextPlayers, active, message)
  }

  defender.health = Math.max(0, defender.health - totalDamage)
  attacker.health = Math.min(attacker.animal.health, attacker.health + (move.heal ?? 0))
  attacker.focus = Math.max(attacker.focus, move.focusGain ?? 0)
  attacker.evasion = Math.max(attacker.evasion, move.evasionGain ?? 0)
  if (move.poison) {
    const currentPotency = defender.poisoned?.damage ?? 0
    const currentTurns = defender.poisoned?.turns ?? 0
    defender.poisoned = {
      damage: Math.max(currentPotency, move.poison.damage),
      turns: Math.max(currentTurns, move.poison.turns),
    }
  }
  defender.exposed = Math.max(defender.exposed ?? 0, move.expose ?? 0)
  defender.dazed = Math.max(defender.dazed ?? 0, move.daze ?? 0)

  const effects = []
  if (hitCount > 1) effects.push(`${landedHits}/${hitCount} hits`)
  if (guarded) effects.push(move.guardPierce ? 'pierced guard' : 'guard softened it')
  if (focused) effects.push('focus boosted accuracy')
  if (dazed) effects.push('daze reduced accuracy')
  if (exposedBonus) effects.push(`exposure added ${exposedBonus}`)
  if (move.heal) effects.push(`healed ${move.heal}`)
  if (move.focusGain) effects.push(`gained ${Math.round(move.focusGain * 100)}% focus`)
  if (move.evasionGain) effects.push(`gained ${Math.round(move.evasionGain * 100)}% evasion`)
  if (move.poison) effects.push(`inflicted venom ${move.poison.damage}×${move.poison.turns}`)
  if (move.expose) effects.push(`exposed +${move.expose}`)
  if (move.daze) effects.push(`dazed -${Math.round(move.daze * 100)}% accuracy`)
  const effectText = effects.length ? ` (${effects.join(', ')})` : ''
  const message = `${attackerName} used ${move.name} for ${totalDamage} damage${effectText}!`
  const winner = defender.health === 0 ? active : null
  return finishAction(nextPlayers, active, message, winner)
}
