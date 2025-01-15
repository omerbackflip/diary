const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
// **************** EXAMPLE FILE FOR SPECIFIC ROUTES ************* //

module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-excel-bulk",upload.single('file'), specific.saveExcelBulk);
  router.get("/get-database-info", specific.getDbInfo);
	router.post("/save-pic", specific.savePic);
	router.post("/delete-pic", specific.deletePic);

  //Google auth  
  router.get("/get-google-connection-status", specific.googleConnectionStatus);
  router.get("/google-auth-handler", specific.googleAuthHandler);

  app.use('/api/specific', router);
};