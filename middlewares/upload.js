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
  try {
    console.log('開始處理圖片上傳...');
    
    // 檢查 base64 數據是否有效
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('無效的 base64 數據');
    }

    // 移除 base64 前缀（如果有）
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    console.log('Base64 數據長度:', base64String.length);
    
    // 將 base64 轉換為 Buffer
    const buffer = Buffer.from(base64String, 'base64');
    console.log('Buffer 大小:', buffer.length);
    
    // 檢查 Buffer 是否有效
    if (buffer.length === 0) {
      throw new Error('無效的圖片數據');
    }

    // 生成文件名
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.jpg`;
    console.log('生成的文件名:', fileName);

    // 使用 sharp 處理圖片
    const processedBuffer = await sharp(buffer)
      .jpeg({ 
        quality: 80,
        chromaSubsampling: '4:4:4' // 保持較高的色彩質量
      })
      .toBuffer();
    
    console.log('處理後的圖片大小:', processedBuffer.length);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: processedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
      CacheControl: 'max-age=31536000',
      Metadata: {
        'Content-Type': 'image/jpeg'
      }
    };

    console.log('開始上傳到 S3...');
    const result = await S3.upload(params).promise();
    console.log('S3 上傳結果:', result);

    const imageUrl = process.env.CLOUD_FRONT_URL + fileName;
    console.log('生成的圖片 URL:', imageUrl);

    // 驗證圖片是否可訪問
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`圖片驗證失敗: ${response.status}`);
      }
      console.log('圖片驗證成功');
    } catch (error) {
      console.error('圖片驗證失敗:', error);
      throw new Error(`圖片驗證失敗: ${error.message}`);
    }

    return imageUrl;
  } catch (error) {
    console.error("上傳圖片到 S3 失敗:", error);
    throw new Error(`上傳圖片到 S3 失敗: ${error.message}`);
  }
};

const listImagesFromS3 = async () => {
  try {
    console.log('開始獲取 S3 圖片列表...');
    console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME
    };
    
    console.log('S3 請求參數:', params);
    const data = await S3.listObjectsV2(params).promise();
    console.log('S3 響應數據:', data);
    
    if (!data.Contents) {
      console.log('S3 返回的數據中沒有 Contents 字段');
      return [];
    }
    
    // 篩選出圖片類型（如 .jpg, .png, .gif）
    const images = data.Contents.filter(item => 
      item.Key && item.Key.match(/\.(jpg|jpeg|png|gif)$/i)
    );

    console.log('篩選後的圖片數量:', images.length);
    
    const result = images.map(img => ({
      url: process.env.CLOUD_FRONT_URL + img.Key,
      key: img.Key
    }));

    console.log('最終返回的圖片列表:', result);
    return result;
    
  } catch (err) {
    console.error('列出圖片時發生錯誤:', {
      error: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode
    });
    throw new Error('獲取圖片列表失敗: ' + err.message);
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
  
  // 确保文件类型是有效的图片格式
  const validImageTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  if (!validImageTypes.includes(fileType.toLowerCase())) {
    throw new Error('不支援的圖片格式');
  }

  // 根据文件类型设置正确的 Content-Type
  const contentTypeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 5, // URL 有效期 5 分鐘
    ContentType: contentTypeMap[fileType.toLowerCase()],
    ACL: 'public-read'
  };

  try {
    // 檢查必要的環境變量
    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME environment variable is not set');
    }
    if (!process.env.CLOUD_FRONT_URL) {
      throw new Error('CLOUD_FRONT_URL environment variable is not set');
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials are not properly configured');
    }

    console.log('Generating presigned URL with params:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType
    });

    // 使用 getSignedUrlPromise
    const signedUrl = await S3.getSignedUrlPromise('putObject', params);
    
    console.log('Successfully generated presigned URL');
    
    return {
      uploadUrl: signedUrl,
      imageUrl: process.env.CLOUD_FRONT_URL + fileName,
      headers: {
        'Content-Type': params.ContentType,
        'x-amz-acl': 'public-read'
      }
    };
  } catch (error) {
    console.error('Error in generatePresignedUrl:', {
      error: error.message,
      stack: error.stack,
      params: {
        Bucket: params.Bucket,
        Key: params.Key,
        ContentType: params.ContentType
      }
    });
    throw error;
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