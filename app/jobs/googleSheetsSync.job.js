const cron = require("node-cron");

const db = require("../models");
const googleLeadsSyncService = require("../services/google-leads-sync-service");

const UPLOAD_MODEL = db.leads;

let isSyncRunning = false;

let syncStatus = {
  isRunning: false,
  lastSyncAt: null,
  lastImportedCount: 0,
  lastError: null,
  version: 0,
};

async function runGoogleSheetsSync() {
  if (isSyncRunning) {
    console.log("[Google Sheets Sync] Previous sync still running. Skipping.");
    return;
  }

  isSyncRunning = true;

  syncStatus = {
    ...syncStatus,
    isRunning: true,
    lastError: null,
  };

  try {
    console.log(`[Google Sheets Sync] Started at ${new Date().toLocaleString("he-IL", {timeZone: "Asia/Jerusalem"})}`);

    const newLeads = await googleLeadsSyncService.fetchNewRows(UPLOAD_MODEL);
    const importedCount = Number(newLeads) || 0;

    syncStatus = {
      isRunning: false,
      lastSyncAt: new Date(),
      lastImportedCount: importedCount,
      lastError: null,
      version: syncStatus.version + 1,
    };

    console.log(`[Google Sheets Sync] Finished at ${new Date().toLocaleString("he-IL", {timeZone: "Asia/Jerusalem"})}. ${importedCount} leads imported.`);
  } catch (error) {
    syncStatus = {
      isRunning: false,
      lastSyncAt: new Date(),
      lastImportedCount: 0,
      lastError: error.message,
      version: syncStatus.version + 1,
    };

    console.error(`[Google Sheets Sync] Failed at ${new Date().toLocaleString("he-IL", {timeZone: "Asia/Jerusalem"})}:`, error);
  } finally {
    isSyncRunning = false;
  }
}

function getGoogleSheetsSyncStatus() {
  return syncStatus;
}

function startGoogleSheetsSyncJob() {
  // Time                  | Behavior
  // --------------------- | -------------
  // Sun–Fri 08:00–16:59   | every 5 min
  // Sun–Thu 17:00–23:00   | every 2 hours
  // Mon–Fri 00:00–07:59   | every 2 hours
  // Fri 17:00 → Sat 20:59 | OFF
  // Sat 21:00+            | resumes

  // Sunday-Friday, 08:00-16:59, every 5 minutes
  cron.schedule("*/5 8-16 * * 0-5", runGoogleSheetsSync, {
    timezone: "Asia/Jerusalem",
  });

  // Sunday-Thursday evenings, 17:00-23:00, every 2 hours
  cron.schedule("0 17-23/2 * * 0-4", runGoogleSheetsSync, {
    timezone: "Asia/Jerusalem",
  });

  // Monday-Friday early morning, 00:00-07:00, every 2 hours
  cron.schedule("0 0-7/2 * * 1-5", runGoogleSheetsSync, {
    timezone: "Asia/Jerusalem",
  });

  // Saturday night after Shabbat, 21:00 and 23:00
  cron.schedule("0 21,23 * * 6", runGoogleSheetsSync, {
    timezone: "Asia/Jerusalem",
  });

  console.log("[Google Sheets Sync] Smart cron jobs started.");
}

module.exports = {
  startGoogleSheetsSyncJob,
  runGoogleSheetsSync,
  getGoogleSheetsSyncStatus,
};