const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tables = require("./table.model.js")(mongoose);
db.diarydatas = require("./diarydata.model.js")(mongoose);
db.leads = require("./lead.model.js")(mongoose);

module.exports = db; 