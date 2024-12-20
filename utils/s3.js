// src/utils/s3.js
const S3 = require("../config/aws");
const path = require("path");

const uploadFileToS3 = async (file, folder) => {
  const fileName = `${folder}/${Date.now()}_${path.basename(
    file.originalname
  )}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // 公開讀取權限，允許公開訪問圖片
  };

  try {
    const result = await S3.upload(params).promise();
    return result.Location; // 返回文件的公開 URL
  } catch (err) {
    throw new Error(`Error uploading file to S3: ${err.message}`);
  }
};

/**
 * 從 AWS S3 中刪除指定文件
 * @param {string} fileKey - 文件的 Key (例如：logos/1697024555_logo.png)
 */
const deleteFileFromS3 = async (fileKey) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // 存儲桶名稱
    Key: fileKey, // 文件的 S3 Key
  };

  try {
    await S3.deleteObject(params).promise();
    console.log(`File deleted successfully from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Error deleting file from S3: ${error.message}`);
    throw new Error("Failed to delete old logo from S3.");
  }
};

module.exports = { uploadFileToS3, deleteFileFromS3 };
