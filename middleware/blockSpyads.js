module.exports = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Agentes comuns de spyads
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.48', // Exemplo de um spyad conhecido
    ];

    if (suspiciousUserAgents.some(agent => userAgent.includes(agent))) {
        return res.status(403).send('Acesso negado: spyad detectado.');
    }

    next();
};
