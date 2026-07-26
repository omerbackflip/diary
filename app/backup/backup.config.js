module.exports = {
  driveFolderId: process.env.GOOGLE_BACKUP_FOLDER_ID,
  zipPrefix: 'diary-backup',

  models: [
    {
      key: 'bills',
      modelName: 'Bill',
      archiveName: 'bills.csv'
    },
    {
      key: 'diarydata',
      modelName: 'DiaryData',
      archiveName: 'diarydata.csv'
    },
    {
      key: 'holders',
      modelName: 'Holder',
      archiveName: 'holders.csv'
    },
    {
      key: 'flatissues',
      modelName: 'FlatIssue',
      archiveName: 'flatissues.csv'
    },
    {
      key: 'leads',
      modelName: 'Lead',
      archiveName: 'leads.csv'
    },
    {
      key: 'prices',
      modelName: 'Price',
      archiveName: 'prices.csv'
    },
    {
      key: 'tables',
      modelName: 'Table',
      archiveName: 'tables.csv'
    },
    {
      key: 'pricelist',
      modelName: 'PriceList',
      archiveName: 'pricelist.csv'
    }
  ]
};
