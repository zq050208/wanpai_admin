##  后台管理通用统系

### 主要目录
`public` 目录解析
```
├── config.js        // 请求域名地址配置
└── index.html
```

### 主要目录
`src` 目录解析
```
├── App.vue
├── index.less
├── main.js
├── api               // 接口
├── assets
|   ├── icons
│   └── images.js
├── components        // 组件
├── config            // 通用配置
│   └── index.js
├── directive         // 拖拽插件
├── lib
|   ├── api.request.js
│   ├── axios.js
│   ├── excel.js       // excel插件
│   ├── render-dom     // render
│   ├── tools.js       // 工具类
│   └── utils          // 通用类
├── locale             // 语言包
├── mock               // 数据模拟
├── plugin             // 插件包
│   ├── index.js
│   └── error-store.js
│       └── index.js
├── router
│   ├── before-close.js
│   ├── routers.js     // 路由文件
│   └── index.js
├── store
│   ├── index.js
│   └── modules
│       ├── app.js
│       └── user.js    // 用户登录
└── view               // 各种页面
```

### 常用命令
#### 开发
```
npm install
npm install lodash              // 数组序列化
npm install vue-quill-editor    // 富文本编辑器
npm install v-viewer            // 图片查看
npm run dev
```

#### build
```
npm run build
```
