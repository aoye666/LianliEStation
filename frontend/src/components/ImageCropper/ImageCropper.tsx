import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button, Modal, Slider } from 'antd';
import imageCompression from 'browser-image-compression';
import './ImageCropper.scss';

interface ImageCropperProps {
  visible: boolean;
  imageFile: File | null;
  aspectRatio?: number; // 宽高比，例如 1 表示正方形（头像），16/9 表示横屏，9/16 表示竖屏
  circularCrop?: boolean; // 是否圆形裁剪
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
  targetWidth?: number; // 目标宽度（用于压缩）
  targetHeight?: number; // 目标高度（用于压缩）
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  visible,
  imageFile,
  aspectRatio,
  circularCrop = false,
  onConfirm,
  onCancel,
  targetWidth = 800,
  targetHeight = 800,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: aspectRatio ? 90 / aspectRatio : 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 当图片文件改变时，加载图片
  React.useEffect(() => {
    if (imageFile && visible) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, visible]);

  // 图片加载完成
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    
    // 根据纵横比自动设置初始裁剪区域
    const { width, height } = e.currentTarget;
    if (aspectRatio) {
      const cropWidth = width > height ? (height * aspectRatio > width ? 90 : 90) : 90;
      const cropHeight = cropWidth / aspectRatio;
      setCrop({
        unit: '%',
        width: cropWidth,
        height: cropHeight,
        x: (100 - cropWidth) / 2,
        y: (100 - cropHeight) / 2,
      });
    }
  }, [aspectRatio]);

  // 生成裁剪后的图片
  const getCroppedImg = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 计算裁剪后的尺寸
    const pixelCrop = completedCrop;
    
    // 根据目标尺寸调整canvas大小
    let canvasWidth = pixelCrop.width * scaleX;
    let canvasHeight = pixelCrop.height * scaleY;
    
    // 如果裁剪后的图片超过目标尺寸，则按比例缩小
    if (canvasWidth > targetWidth || canvasHeight > targetHeight) {
      const widthRatio = targetWidth / canvasWidth;
      const heightRatio = targetHeight / canvasHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      canvasWidth = canvasWidth * ratio;
      canvasHeight = canvasHeight * ratio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 应用缩放和旋转
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          // 使用browser-image-compression进行无损压缩
          const file = new File([blob], imageFile?.name || 'cropped.jpg', {
            type: 'image/jpeg',
          });

          try {
            const options = {
              maxSizeMB: 1, // 最大文件大小 1MB
              maxWidthOrHeight: Math.max(targetWidth, targetHeight), // 最大宽度或高度
              useWebWorker: true,
              fileType: 'image/jpeg',
              initialQuality: 0.9, // 初始质量
            };

            const compressedFile = await imageCompression(file, options);
            resolve(compressedFile);
          } catch (error) {
            console.error('压缩图片失败:', error);
            resolve(file); // 如果压缩失败，返回原文件
          }
        },
        'image/jpeg',
        0.95 // 质量
      );
    });
  };

  // 确认裁剪
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        onConfirm(croppedFile);
      }
    } catch (error) {
      console.error('裁剪图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 取消裁剪
  const handleCancel = () => {
    setImageSrc('');
    setCrop({
      unit: '%',
      width: 90,
      height: aspectRatio ? 90 / aspectRatio : 90,
      x: 5,
      y: 5,
    });
    setScale(1);
    setRotate(0);
    onCancel();
  };

  return (
    <Modal
      title="裁剪图片"
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" loading={loading} onClick={handleConfirm}>
          确认
        </Button>,
      ]}
      className="image-cropper-modal"
    >
      <div className="cropper-container">
        {imageSrc && (
          <>
            <div className="crop-area">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={circularCrop}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="待裁剪"
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '60vh',
                  }}
                />
              </ReactCrop>
            </div>
            <div className="controls">
              <div className="control-item">
                <span>缩放：</span>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={scale}
                  onChange={(value) => setScale(value)}
                  style={{ width: 200 }}
                />
                <span>{scale.toFixed(1)}x</span>
              </div>
              <div className="control-item">
                <span>旋转：</span>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={rotate}
                  onChange={(value) => setRotate(value)}
                  style={{ width: 200 }}
                />
                <span>{rotate}°</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImageCropper;
