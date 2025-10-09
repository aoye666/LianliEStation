/**
 * rem动态适配方案
 * 
 * 重要说明：
 * - html的font-size仅用于rem单位计算，不影响实际文字大小
 * - body的font-size在CSS中设置为16px，用于实际文字显示
 * 
 * 设计稿宽度：375px
 * 基准：1rem = 37.5px（在375px屏幕下）
 * 
 * 示例：
 *   屏幕375px -> html font-size: 37.5px -> 10px的元素 = 10/37.5 = 0.267rem
 *   屏幕414px -> html font-size: 41.4px -> 0.267rem = 11.04px（自动适配）
 */
(function(doc, win) {
    const docEl = doc.documentElement;
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    
    const recalc = function() {
        const clientWidth = docEl.clientWidth;
        if (!clientWidth) return;
        
        // 计算html的font-size（仅用于rem单位，不影响文字大小）
        let fontSize;
        if (clientWidth >= 750) {
            fontSize = 75; // PC端最大75px
        } else if (clientWidth <= 320) {
            fontSize = 32; // 小屏最小32px
        } else {
            fontSize = clientWidth / 10; // 正常手机：屏幕宽度/10
        }
        
        // 设置html的font-size（rem计算基准）
        docEl.style.fontSize = fontSize + 'px';
    };
    
    if (!doc.addEventListener) return;
    
    // 监听窗口变化
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
    
    // 立即执行
    recalc();
})(document, window);
