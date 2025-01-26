import React, { useState, useRef } from 'react';
import './progressBar.scss';

const ProgressBar: React.FC = () => {
  const [leftPosition, setLeftPosition] = useState<number>(0);  // 左滑块位置
  const [rightPosition, setRightPosition] = useState<number>(100);  // 右滑块位置
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent, isLeft: boolean) => {
    const initialX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!progressBarRef.current) return;
      
      const deltaX = moveEvent.clientX - initialX;
      const progressBarWidth = progressBarRef.current.offsetWidth;

      if (isLeft) {
        const newLeft = Math.min(Math.max(0, leftPosition + deltaX), rightPosition - 20); // 限制左滑块的移动范围
        setLeftPosition(newLeft);
      } else {
        const newRight = Math.max(Math.min(progressBarWidth, rightPosition + deltaX), leftPosition + 20); // 限制右滑块的移动范围
        setRightPosition(newRight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" ref={progressBarRef}>
        <div
          className="progress-track"
          style={{ left: leftPosition, width: rightPosition - leftPosition }}
        ></div>
        <div
          className="progress-handle left"
          style={{ left: leftPosition }}
          onMouseDown={(e) => handleMouseDown(e, true)}
        ></div>
        <div
          className="progress-handle right"
          style={{ left: rightPosition }}
          onMouseDown={(e) => handleMouseDown(e, false)}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;