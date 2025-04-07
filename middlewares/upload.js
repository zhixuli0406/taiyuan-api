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
  return process.env.CLOUD_FRONT_URL + `image-gallery/${Date.now()}_${file.originalname}`; // 返回文件的公開 URL
};

const uploadBase64ImageToS3 = async (base64Data, folder) => {
  const buffer = Buffer.from(base64Data, "base64");
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.jpg`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // S3 存儲桶名稱
    Key: fileName,
    Body: buffer,
    ContentType: "image/jpeg",
  };

  try {
    const result = await S3.upload(params).promise();
    return process.env.CLOUD_FRONT_URL + fileName; // 返回圖片的 S3 URL
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw new Error(`Error uploading image to S3: ${error.message}`);
  }
};

const listImagesFromS3 = async () => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME
    };
    
    const data = await S3.listObjectsV2(params).promise();
    
    // 篩選出圖片類型（如 .jpg, .png, .gif）
    const images = data.Contents.filter(item => 
      item.Key.match(/\.(jpg|jpeg|png|gif)$/i)
    );

    return images.map(img => ({
      url: process.env.CLOUD_FRONT_URL + img.Key,
      key: img.Key
    }));
    
  } catch (err) {
    console.error('列出圖片時發生錯誤:', err);
  }
}

const deleteImageFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };
    
    await S3.deleteObject(params).promise();
    return true;
    
  } catch (err) {
    console.error('刪除圖片時發生錯誤:', err);
    return false;
  }
}

const generatePresignedUrl = async (folder, fileType) => {
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}${fileType}`;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 5, // URL 有效期 5 分鐘
    ContentType: `image/${fileType.replace('.', '')}`,
    ACL: 'public-read',
    Conditions: [
      ['content-length-range', 0, 10485760], // 限制文件大小 10MB
      ['starts-with', '$Content-Type', 'image/'], // 限制文件類型
    ],
  };

  try {
    const signedUrl = await S3.getSignedUrlPromise('putObject', params);
    return {
      uploadUrl: signedUrl,
      imageUrl: process.env.CLOUD_FRONT_URL + fileName,
      headers: {
        'Content-Type': `image/${fileType.replace('.', '')}`,
        'x-amz-acl': 'public-read',
      }
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error(`Error generating presigned URL: ${error.message}`);
  }
};

module.exports = { 
  upload, 
  uploadImageToS3, 
  uploadBase64ImageToS3, 
  listImagesFromS3, 
  deleteImageFromS3,
  generatePresignedUrl  // 導出新函數
};