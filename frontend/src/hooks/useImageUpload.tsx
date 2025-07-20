// 用于处理图片上传的自定义 Hook
// 该 Hook 封装了图片验证、压缩和状态管理逻辑
// 使用时只需传入配置参数即可

import { useState, useCallback } from "react";

// 默认配置
const DEFAULT_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};

export interface ImageConfig {
  maxSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowedTypes?: string[];
}

function useImageUpload(config: ImageConfig = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 内部工具函数 - 获取图片尺寸
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('无法加载图片'));
      };
      
      img.src = url;
    });
  };

  // 内部工具函数 - 验证并压缩图片
  const processImage = useCallback(async (file: File) => {
    const options = { ...DEFAULT_CONFIG, ...config };
    
    // 验证文件类型
    if (!options.allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型，仅支持：${options.allowedTypes.join(', ')}`);
    }
    
    // 验证文件大小
    if (file.size > options.maxSize) {
      throw new Error(`文件大小超出限制，最大允许：${(options.maxSize / 1024 / 1024).toFixed(1)}MB`);
    }
    
    // 获取图片尺寸
    const dimensions = await getImageDimensions(file);
    
    // 验证图片尺寸
    if (dimensions.width > options.maxWidth || dimensions.height > options.maxHeight) {
      throw new Error(`图片尺寸超出限制，最大允许：${options.maxWidth}x${options.maxHeight}px`);
    }
    
    // 压缩图片
    return new Promise<File>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const { width, height } = dimensions;
        
        // 计算目标尺寸（保持宽高比）
        let targetWidth = width;
        let targetHeight = height;
        
        if (width > options.maxWidth || height > options.maxHeight) {
          const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
          targetWidth = Math.round(width * ratio);
          targetHeight = Math.round(height * ratio);
        }
        
        // 设置画布尺寸并绘制
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx!.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // 转换为文件
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          options.quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };
      
      img.src = url;
    });
  }, [config]);

  const handleImageUpload = useCallback(async (file: File): Promise<File | null> => {
    setLoading(true);
    setError(null);

    try {
      const processedFile = await processImage(file);
      setLoading(false);
      return processedFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片处理失败');
      setLoading(false);
      return null;
    }
  }, [processImage]);

  const handleMultipleImages = useCallback(async (files: File[]): Promise<File[]> => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        files.map(file => processImage(file))
      );

      const successfulFiles: File[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulFiles.push(result.value);
        } else {
          errors.push(`文件${index + 1}: ${result.reason.message}`);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
      
      setLoading(false);
      return successfulFiles;
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量处理图片失败');
      setLoading(false);
      return [];
    }
  }, [processImage]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { 
    loading, 
    error, 
    handleImageUpload, 
    handleMultipleImages,
    reset
  };
}

export default useImageUpload;

// 使用方法示例：
// import useImageUpload from "../hooks/useImageUpload";
// const { loading, error, handleImageUpload } = useImageUpload({
//   maxSize: 3 * 1024 * 1024, // 3MB
//   maxWidth: 1200,
//   maxHeight: 800,
//   quality: 0.9
// });
// 
// const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (file) {
//     const processedFile = await handleImageUpload(file);
//     if (processedFile) {
//       // 处理成功，可以上传到服务器或设置到 state
//       console.log('处理后的文件:', processedFile);
//     }
//   }
// };