const db = require("../models");
// const UPLOAD_MODEL = db.prices;
// const UPLOAD_MODEL = db.leads;
const UPLOAD_MODEL = db.pricelist;
// const UPLOAD_MODEL = db.bills;
const csv = require('csvtojson');
var fs = require('fs');
const XLSX = require('xlsx');
const moment = require('moment');
const { transformCSVData, storeMedia } = require("../util/util");
const specificService = require("../services/specific-service");
const { url } = require("../config/db.config");
const path = require('path');
const { ServerApp } = require("../config/constants");
const { google } = require('googleapis');
// const googleService = require('../services/google-service');
const { uploadFile, ensureFolder } = require('../../google/backend');
const googleSubmoduleService = require('../../google/backend/services/google-submodule-service');
const googleLeadsSyncService = require('../services/google-leads-sync-service');
const { getGoogleSheetsSyncStatus } = require("../jobs/googleSheetsSync.job");
const backupService = require('../../backup/backend');
const backupConfig = require('../backup/backup.config');
const { getModel } = require('../backup/modelResolver');


                    // for testing purposes only - to be removed in production
                    // http://localhost:3004/api/specific/test-google-sheets-sync-job
                    const {
                      runGoogleSheetsSync,
                    } = require("../jobs/googleSheetsSync.job");
                    exports.testGoogleSheetsSyncJob = async (req, res) => {
                      try {
                        await runGoogleSheetsSync();

                        res.json({
                          success: true,
                          message: "Google Sheets sync job executed manually",
                        });
                      } catch (error) {
                        console.error("Error running Google Sheets sync job:", error);

                        res.status(500).json({
                          success: false,
                          message: "Error running Google Sheets sync job",
                        });
                      }
                    };


// **************** EXAMPLE FILE FOR SPECIFIC CONTROLLERS ************* //

exports.saveExcelBulk = async (req, res) => {
	try {
        await UPLOAD_MODEL.deleteMany();
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let excelData = specificService.getExcelToSave(data[0]);
		if (excelData) {
			const result = await UPLOAD_MODEL.insertMany(excelData, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} to ${UPLOAD_MODEL} successfully Imported`
				})
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of the read Excel"
		});
	}
};

exports.getDbInfo = (req,res) => {
	try {
		// const local = url.includes('localhost'); //retuens true/false
		const local = url.includes('127.0.0.1'); //retuens true/false
		return res.send({ success: true, local});
	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error getting db info", error });
	}
};

exports.savePic = async(req, res) => {
	try {
		const media = { ...req.body };
		if(media && media.fileContent){
			let picName = storeMedia(media.fileContent); // save the pics
			res.send(picName);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error while savePic function in specifc.controller.js file"});
	}
}

exports.deletePic = async(req, res) => {
  try {
    const fileNames = Array.isArray(req.body) ? req.body : [req.body];

    const uploadFolder = path.join(
      __dirname,
      '../../client',
      process.env.VUE_APP_MEDIA_FILES_REL_DIR_PATH || 'public/media_files/'
    );

    fileNames.forEach((fileName) => {
      if (!fileName) return;

      const filePath = path.join(uploadFolder, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message || "Some error while deletePic function in specific.controller.js file"
    });
  }
};

exports.uploadHolderPic = async(req, res) => {
  try {
    const { fileContent, parentFolderId, name, capturedAt } = req.body || {};

    if (!fileContent) {
      return res.status(400).send({ message: "Missing fileContent" });
    }

    if (!parentFolderId) {
      return res.status(400).send({ message: "Missing parentFolderId" });
    }

    const oAuth2Client = googleSubmoduleService.getOAuthClientFromStoredTokens();
    const picsFolder = await ensureFolder({
      oAuth2Client,
      folderName: "pics",
      parentId: parentFolderId,
    });

    const base64 = fileContent.replace(/^data:image\/[^;]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const requestedName = name && String(name).trim();
    const filename = requestedName
      ? requestedName.replace(/\.(jpg|jpeg)$/i, "") + ".jpeg"
      : `pic-${moment(new Date()).format("YYYY-MM-DD-HH.mm.ss")}.jpeg`;

    const file = await uploadFile({
      oAuth2Client,
      name: filename,
      mimeType: "image/jpeg",
      body: buffer,
      folderId: picsFolder.id,
    });

    return res.send({
      success: true,
      pic: {
        name: file.name,
        fileId: file.id,
        folderId: picsFolder.id,
        url: file.webViewLink,
        capturedAt: capturedAt || new Date(),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message || "Some error while uploading holder pic to Google Drive",
    });
  }
};

exports.listHolderPics = async(req, res) => {
  try {
    const { parentFolderId } = req.query || {};

    if (!parentFolderId) {
      return res.status(400).send({ message: "Missing parentFolderId" });
    }

    const oAuth2Client = googleSubmoduleService.getOAuthClientFromStoredTokens();
    const picsFolder = await ensureFolder({
      oAuth2Client,
      folderName: "pics",
      parentId: parentFolderId,
    });

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const response = await drive.files.list({
      q: `'${picsFolder.id}' in parents and trashed = false`,
      orderBy: 'createdTime desc',
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime)',
      pageSize: 1000,
    });

    const pics = (response.data.files || []).map((file) => ({
      name: file.name,
      fileId: file.id,
      folderId: picsFolder.id,
      url: file.webViewLink,
      mimeType: file.mimeType,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
    }));

    return res.send({
      success: true,
      folderId: picsFolder.id,
      pics,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message || "Some error while listing holder pics from Google Drive",
    });
  }
};

exports.deleteHolderPic = async(req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const fileIds = items
      .map((item) => typeof item === "string" ? item : item && item.fileId)
      .filter(Boolean);

    if (!fileIds.length) {
      return res.send({ success: true, deletedCount: 0 });
    }

    const oAuth2Client = googleSubmoduleService.getOAuthClientFromStoredTokens();
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    for (const fileId of fileIds) {
      try {
        await drive.files.delete({ fileId });
      } catch (error) {
        if (error && error.code !== 404) {
          throw error;
        }
      }
    }

    return res.send({ success: true, deletedCount: fileIds.length });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message || "Some error while deleting holder pic from Google Drive",
    });
  }
};

exports.googleConnectionStatus = async (req, res) => {
  try {
    const tokens = googleSubmoduleService.getStoredTokens();

    if (!tokens) {
      return res.send({
        connected: false,
        authUrl: '/api/google/auth'
      });
    }

    return res.send({
      connected: true,
      username: null,
      client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      developerKey: process.env.VUE_APP_GOOGLE_API_KEY || null,
      locale: process.env.VUE_APP_GOOGLE_PICKER_LOCALE || 'en',
      access_token: tokens.access_token || null,

      // app-specific only:
      folderId: ServerApp.google.pickerRootFolder
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while checking google connection."
    });
  }
};

exports.syncGoogleSheets = async (req, res) => {
  try {
    // let newLeads = await googleLeadsSyncService.fetchNewRows(UPLOAD_MODEL);
    let newLeads = await googleLeadsSyncService.fetchNewRows(db.leads);
    res.json({ success: true, message: `${newLeads} leads where imported` });
  } catch (error) {
    console.error("Error syncing Google Sheets:", error);
    res.status(500).json({ success: false, message: "Error syncing Google Sheets" });
  }
};

exports.bulkWriteControl = async (req, res) => {
	try {
		const items = req.body
		const {flatId,bill_id} = items[0]
		const itemIds = items.filter(i => i._id).map(i => i._id); // Extract existing IDs

		// Step 1: Find existing items for this flatId
		const existingItems = await db[req.query.model].find({ flatId: flatId, bill_id:bill_id });
		const existingItemIds = existingItems.map(item => item._id.toString());

		// Step 2: Determine which items to insert, update, or delete
		const bulkOps = [];
		items.forEach(item => {
			if (item._id) { // Update existing item
				bulkOps.push({
					updateOne: {filter: { _id: item._id },update: { $set: item }}
				});
			} else { // Insert new item
				bulkOps.push({
					insertOne: { document: {...item} }
				});
			}
		});

		// Step 3: Delete missing items
		const itemsToDelete = existingItemIds.filter(id => !itemIds.includes(id));
		if (itemsToDelete.length > 0) {
			bulkOps.push({
				deleteMany: {filter: { _id: { $in: itemsToDelete } }
				}
			});
		}
		const data = await specificService.bulkWriteService(db[req.query.model], bulkOps);
		if (data) {
			res.send(data);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error occurred while create entity."});
	}
};

exports.runBackup = async (req, res) => {
  try {
    const result = await backupService.runBackup({
      config: backupConfig,
      getModel,
      uploader: googleSubmoduleService.uploadFileToDrive,
      tmpDir: path.resolve(__dirname, '../../tmp')
    });

    return res.json(result);
  } catch (error) {
    console.error('runBackup error:', error);
    return res.status(500).send({
      message: 'Error creating backup',
      error: error.message || error
    });
  }
};

exports.runRestore = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).send({
        success: false,
        message: 'Backup ZIP file is required'
      });
    }

    if (!req.body || req.body.confirm !== 'YES') {
      return res.status(400).send({
        success: false,
        message: 'Restore requires confirmation: confirm=YES'
      });
    }

    const result = await backupService.runRestore({
      zipPath: req.file.path,
      config: backupConfig,
      getModel,
      tmpDir: path.resolve(__dirname, '../../tmp')
    });

    unLinkFile(req.file.path);

    return res.json(result);
  } catch (error) {
    console.error('runRestore error:', error);

    if (req.file && req.file.path) {
      try {
        unLinkFile(req.file.path);
      } catch (e) {}
    }

    return res.status(500).send({
      message: 'Error restoring backup',
      error: error.message || error
    });
  }
};

exports.getGoogleSheetsSyncStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      status: getGoogleSheetsSyncStatus(),
    });
  } catch (error) {
    console.error("Error getting Google Sheets sync status:", error);

    res.status(500).json({
      success: false,
      message: "Error getting Google Sheets sync status",
    });
  }
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}
