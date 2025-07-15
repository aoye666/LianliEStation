# Axios 封装 API 使用说明

## 1. 目的

本模块对 Axios 进行了统一封装，主要用于：

- 统一管理接口请求的 baseURL、超时时间等配置
- 自动携带 token，无需手动添加
- 统一处理网络异常，便于维护和扩展
- 简化请求调用方式，提升开发效率

## 2. 引入方式

```typescript
import api from 'path/to/api/index.ts';
```

## 3. 基本用法

### GET 请求

```typescript
const res = await api.get('/users/profile', {
  params: { id: 123 },
  headers: { 'Custom-Header': 'value' }
});
```

### POST 请求

```typescript
const res = await api.post('/users/register', 
  { email: 'test@test.com', password: '123456' }, // data
  { headers: { 'Custom-Header': 'value' } }       // 可选配置
);
```

### PUT/DELETE 请求

```typescript
await api.put('/users/123', { name: 'newName' });
await api.delete('/users/123');
```

## 4. 参数说明

- `url`：请求路径（自动拼接 baseURL）
- `data`：请求体（POST/PUT）
- `config`：可选配置对象，支持 `params`、`headers` 等 axios 原生参数

## 5. 错误处理

- 网络异常（如断网、服务器挂掉）会自动弹出全局提示
- 业务错误（如 400、500）需在业务代码中通过 `catch` 捕获并根据 `error.response.status` 和 `error.response.data.message` 进行处理

```typescript
try {
  const res = await api.post('/users/register', { ... });
  // 注册成功
} catch (error: any) {
  if (error.response) {
    // 这里可以根据 error.response.status 和 error.response.data.message 灵活处理
    if (error.response.status === 400) {
      // 参数错误、邮箱已注册等
      message.error(error.response.data.message);
    } else if (error.response.status === 500) {
      message.error('服务器错误，请稍后重试');
    }
  } else {
    message.error('网络异常，请检查网络连接');
  }
}
```

## 6. 注意事项

- token 会自动从 cookie 获取并添加到请求头，无需手动处理
- 建议所有接口请求均通过本 api 模块发起，便于后续统一维护
- 即使某些请求不需要 token 或者还未加载 token ，使用本封装函数也不会有任何问题

---

如有特殊需求（如文件上传、取消请求等），可参考 axios 官方文档或联系 Proselyte
