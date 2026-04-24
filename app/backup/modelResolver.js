const db = require('../models');

const MODEL_MAP = {
  Bill: db.bills,
  DiaryData: db.diarydatas,
  Holder: db.holders,
  Lead: db.leads,
  Price: db.prices,
  Table: db.tables
};

function getModel(modelName) {
  const model = MODEL_MAP[modelName];
  if (!model) {
    throw new Error(`Unknown model: ${modelName}`);
  }
  return model;
}

module.exports = {
  getModel
};