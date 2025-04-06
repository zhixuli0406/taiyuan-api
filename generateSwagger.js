const swaggerJsDoc = require('swagger-jsdoc');
const fs = require('fs');

// Swagger配置
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Taiyuan API',
            version: '1.0.0',
            description: 'API Description',
        },
        servers: [
            {
                url: 'https://api.taiyuan.dudustudio.monster', // 您的 API 主机
            },
        ],
    },
    apis: ['./routes/*.js'], // 指定包含 OpenAPI 注释的文件
};

// 生成 Swagger 文档
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// 将生成的文档写入 swagger.json 文件
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerDocs, null, 2), 'utf8');

console.log('swagger.json has been generated successfully!');
