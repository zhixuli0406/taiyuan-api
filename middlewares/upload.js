// src/middlewares/upload.js
const multer = require("multer");
const sharp = require("sharp");
const S3 = require("../config/aws");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 文件大小限制 5MB
});

const uploadImageToS3 = async (file) => {
  const buffer = await sharp(file.buffer)
    .resize(800, 800, { fit: "inside" }) // 調整圖片大小 (最大寬高為800px)
    .toFormat("jpeg")
    .jpeg({ quality: 80 }) // 壓縮品質
    .toBuffer();

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `image-gallery/${Date.now()}_${file.originalname}`, // 文件存儲鍵
    Body: buffer,
    ContentType: "image/jpeg",
    ACL: "public-read", // 設置為公共讀取
  };

  const result = await S3.upload(params).promise();
  return result.Location; // 返回文件的公開 URL
};

module.exports = { upload, uploadImageToS3 };