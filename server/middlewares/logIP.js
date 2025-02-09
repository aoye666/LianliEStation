const logIP = (req, res, next) => {
    // 优先从 x-forwarded-for 获取真实 IP（如使用代理服务器）
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress;
    console.log(`Register request from IP: ${ip}`);
    next();
};

export default logIP;
