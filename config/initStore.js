const StoreSetting = require("../models/StoreSetting");

const initializeStoreSettings = async () => {
  try {
    const existingSettings = await StoreSetting.findOne();
    if (existingSettings) {
      console.log("Store settings already initialized.");
      return;
    }

    const defaultSettings = new StoreSetting({});
    await defaultSettings.save();
    console.log("Initialized default store settings.");
  } catch (error) {
    console.error("Error initializing store settings:", error.message);
  }
};

module.exports = initializeStoreSettings;