module.exports = app => {
	const generic = require("../controllers/generic.controller.js");

	var router = require("express").Router();

	// Create entity
	router.post("/create", generic.create);

	// Create entity with media
	router.post("/create-with-media", generic.createWithMedia);

	// Retrieve all entity
	router.get("/get-list", generic.findAll);

	// Retrieve a single entity with id
	router.get("/get-by-id/:id", generic.findOne);

	// Delete a single entity with id
	router.delete("/delete", generic.delete);

	// Update a entity with id
	router.put("/update/:id", generic.update);

	// Update a entity with id  and media
	router.put("/update-with-media/:id", generic.updateWithMedia);

	// Delete all generic
	router.delete("/delete-all", generic.deleteAll);

	app.use('/api/generic', router);
};