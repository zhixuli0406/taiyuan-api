const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

// Swagger配置
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Taiyuan API",
            version: "1.0.0",
            description: "Taiyuan 電子商務平台 API 文檔",
        },
        servers: [
            {
                url: "https://api.taiyuan.dudustudio.monster", // 您的 API 主機
            },
        ],
    },
    apis: ["./routes/*.js"], // 指定包含 OpenAPI 註釋的文件
};

// 生成 Swagger 文檔
const swaggerSpec = swaggerJsdoc(options);

// 將生成的文檔寫入 swagger.json 文件
fs.writeFileSync("./swagger.json", JSON.stringify(swaggerSpec, null, 2));
console.log("Swagger 文檔已生成");
