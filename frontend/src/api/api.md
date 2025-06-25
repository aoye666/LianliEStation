# Axios 请求的封装api使用说明

## 1.目的

封装 Axios 请求，

- 省去重复的 url 前缀部分(`process.env.REACT_APP_API_URL || 'http://localhost:5000'`)
- 统一 url 后缀、参数、头部、数据等请求体格式，方便使用

## 2. 引入

```javascript
import api from 'path/to/api/index.ts';
```

## 3. 使用

```javascript
// 使用示例
await api.post('/api/users', 
{
    params: {page: 1, size: 10}, 
    headers: {'Authorization': 'Bearer token'},
    data: {name: 'test'}
});
```

可使用 `api.get`, `api.post`, `api.put`, `api.delete` 方法进行相应的请求, `params`, `headers`, `data` 均为可选参数。
