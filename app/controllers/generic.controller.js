const db = require("../models");
var fs = require('fs');
const csv = require('csvtojson');
const dbService = require("../services/db-service");
const util = require("../util/util.js");

//Create and Save a new entity:
exports.create = async (req, res) => {
	try {
		const entity = { ...req.body };
		const data = await dbService.createItem(db[req.query.model], entity);
		if (data) {
			res.send(data);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error occurred while retrieving entity."});
	}
};

//Create and Save a new entity with media files:
exports.createWithMedia = async (req, res) => {
	try {
		const entity = { ...req.body };
		
		let medias = [];
		if(entity.medias){
			medias = entity.medias;
			delete entity.medias;
		}

		const data = await dbService.createItem(db[req.query.model], entity);
		
		if (data) {
			
			if(medias.length > 0){
				rec_id = data._id.toString();
				let mediasInfo = util.checkAndStoreMedia(rec_id, medias);

				entity.medias = mediasInfo;
				const updateData = await dbService.updateItem(db[req.query.model], {_id: rec_id}, entity);

				res.send(updateData)
			}else{
				res.send(data);
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error occurred while retrieving entity."});
	}
};

exports.findAll = async (req, res) => {
	try {
		const query = {... req.query};
		const model = req.query.model;
		delete query.model;
		return res.send(await dbService.getMultipleItems(db[model], req.query));
	} catch (error) {
		res.status(500).send({message: error.message || "Some error occurred while retrieving entity."});		
	}
};


//Find a single entity with an id:
exports.findOne = async (req, res) => {
	try {
		const id = req.params.id;
		return res.send(await dbService.getSingleItem(db[req.query.model], {_id: id}));
	} catch (error) {
		res.status(500).send({ message: "Error retrieving entity!"});		
	}
};


//Update a entity identified by the id in the request:
exports.update = async (req, res) => {
	try {
		const id = req.params.id;
		const data = await dbService.updateItem(db[req.query.model], {_id: id}, req.body);
		if(data) {
			res.send({ message: "entity was updated successfully." });
		} else {
			res.status(404).send({message: `Cannot update entity with id=${id}. Maybe entity was not found!`});
		}
	} catch (error) {
		res.status(500).send({ message: "Error updating entity!"});		
	}
};

//Update a entity identified by the id in the request:
exports.updateWithMedia = async (req, res) => {
	try {
		const id = req.params.id;
		const entity = { ...req.body };

		let medias = [];
		if(entity.medias){
			medias = entity.medias;
			delete entity.medias;
		}

		const data = await dbService.updateItem(db[req.query.model], {_id: id}, entity);

		if(data) {
			
			if(medias.length > 0){
				
				let mediasInfo = util.checkAndStoreMedia(id, medias, data.medias.length);
				
				entity.medias = data.medias.concat(mediasInfo);

				const updateData = await dbService.updateItem(db[req.query.model], {_id: id}, entity);
			}

			res.send({ message: "entity was updated successfully." });

		} else {
			res.status(404).send({message: `Cannot update entity with id=${id}. Maybe entity was not found!`});
		}
	} catch (error) {
		res.status(500).send({ message: "Error updating entity!"});		
	}
};


//Delete a entity with the specified id:
exports.delete = async (req, res) => {
	try {
		const id = req.query.id;
		const data = await dbService.deleteItem(db[req.query.model], {_id: id});
		if(data) {
			res.send({ message: "entity was updated successfully." });
		} else {
			res.status(404).send({message: `Cannot delete entity with id=${id}. Maybe entity was not found!`});
		}
	} catch (error) {
		res.status(500).send({ message: "Error updating entity!"});		
	}
};


//Delete all records with specified year - if year not specified - delete all data from the database:
exports.deleteAll = async (req, res) => {
	try {
		const query = {... req.query};
		const model = req.query.model;
		delete query.model;

		const data = await dbService.deleteMany(db[model], query);
		if(data) {
			res.send({
				message: `${data.deletedCount} data were deleted successfully!`
			});
		}
	} catch (error) {
		res.status(500).send({
			message:
				err.message || "Some error occurred while removing all data."
		});
	}
};
