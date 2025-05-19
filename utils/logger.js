const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

// Garante que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Função para registrar logs
function logInfo(nomeArquivo, mensagem) {
    const dataHora = new Date().toISOString();
    const logMensagem = `[${dataHora}] ${mensagem}\n`;
    const caminhoArquivo = path.join(LOG_DIR, nomeArquivo);

    fs.appendFile(caminhoArquivo, logMensagem, (err) => {
        if (err) console.error("Erro ao escrever no log:", err);
    });
}

module.exports = logInfo;
