// STORM 1200x compatibility pass.
// Kept isolated from main accessory data until the batch is reviewed.

export const STORM_1200X_ID = 'aputure-storm-1200x';

export const STORM_1200X_COMPATIBILITY = {
  fixtureId: STORM_1200X_ID,
  manufacturer: 'Aputure',
  model: 'STORM 1200x',
  status: 'verification-in-progress',
  notes: [
    'Compatibility relationships must be backed by current official Aputure data before promotion into accessory-library.js.',
    'Do not infer compatibility from Bowens Mount alone.'
  ]
};
