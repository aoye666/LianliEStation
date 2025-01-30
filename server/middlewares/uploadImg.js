import multer from 'multer';
import path from 'path';

// 设置存储位置和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // 存储目录
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 获取文件扩展名
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // 只接受图片类型的文件
    } else {
      cb(new Error('只能上传图片文件'), false); // 其他类型文件返回错误
    }
  },
});

export default upload;
