require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const moment = require("moment");
const archiver = require("archiver");
const secretKey = process.env.TOKEN_JWT;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const nodemailer = require("nodemailer");
const axios = require('axios');
//const API_KEY_PLUGNOTAS = process.env.API_KEY_PLUGNOTAS;
//const BASE_URL_PLUGNOTAS = process.env.BASE_URL_PLUGNOTAS;  // ou a URL correta da API
const logInfo = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret, {
        tolerance: 300 // valor em segundos, padrão é 300 (5 minutos)
      });
  } catch (err) {
      return res.status(400);
  }
  // Verifique o tipo de evento e execute a ação correspondente
  switch (event.type) {
    case 'checkout.session.completed':

      const session = event.data.object;
      const email = session.customer_details.email;
      const name = session.customer_details.name;
      const number = session.customer_details.number;
      const address = session.customer_details.address;
      const value = session.amount_total;
      const moeda = session.currency;
      const token = gerarToken(email);
      const linkDownload = `${process.env.BASE_URL}/download?token=${token}`;

      await sendEmail(email, name, linkDownload);
      break;

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }
  // const dadosNF = [{
  //   idIntegracao: `site${new Date().getFullYear()}-${number}`,
  //   prestador: {
  //     cpfCnpj: process.env.CNPJ_PRESTADOR
  //   },
  //   tomador: {
  //     razaoSocial: name || 'Cliente Exterior',
  //     email: email,
  //     endereco: {
  //       descricaoCidade: "Exterior",
  //       codigoCidade: "0000000",
  //       estado: "EX",
  //       cep: "00000000",
  //       logradouro: "Sem logradouro",
  //       numero: "0",
  //       bairro: "Sem bairro",
  //       complemento: address?.country || "Exterior"
  //     }
  //   },
  //   servico: [{
  //     codigo: "14.10",
  //     codigoTributacao: "14.10",
  //     discriminacao: "Criação de website com HTML, CSS e JAVASCRIPT | Site entregue para cliente nos EUA.",
  //     cnae: "6202300",
  //     iss: {
  //       tipoTributacao: 6,
  //       exigibilidade: 4,
  //       aliquota: 0
  //     },
  //     valor: {
  //       servico: value / 100,
  //       descontoCondicionado: 0,
  //       descontoIncondicionado: 0
  //     }
  //   }]
  // }];

  //Envio para PlugNotas com Axios
  // try {
  //   logInfo('nfse_envio.log', 'Enviando NFS-e...');
  //   const response = await axios.post(`${BASE_URL_PLUGNOTAS}/nfe`, dadosNF, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-Api-Key": process.env.PLUGNOTAS_API_KEY
  //     }
  //   });

  //   const filePath = `./nfse/resposta/NFSe-${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;

  //   // Salva resposta completa da API
  //   fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));

  //   logInfo(
  //     'nfse_respostas.log',
  //     `\n--- Processo finalizado ---\nArquivo: ${filePath}\nProtocolo: ${response.data.protocolo || 'N/A'}\n----------------------\n`
  //   );
  // } catch (error) {
  //   const errMsg = error.response
  //     ? JSON.stringify(error.response.data, null, 2)
  //     : error.message;

  //   const errorPath = `./nfse/erros/NFSe-erro-${moment().format('YYYY-MM-DD_HH-mm-ss')}.log`;

  //   fs.writeFileSync(errorPath, errMsg);

  //   logInfo(
  //     'nfse_erros.log',
  //     `\n--- ERRO NA EMISSÃO ---\nArquivo: ${errorPath}\nErro: ${errMsg}\n----------------------\n`
  //   );
  // }
  res.status(200).json({ received: true });
});


const zipPath = path.join(__dirname, "/private/download.zip");

// Função para criar o ZIP apenas uma vez

function criarZip() {
  if (fs.existsSync(zipPath)) return;

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);

    // Adiciona a pasta inteira como 'website/' dentro do zip
    archive.directory(path.join(__dirname, "private", "site"), "website");

    // Lista de arquivos PDF e PNG
    const basePath = path.join(__dirname, "private", "en");
    const files = [
      "PLR-License.txt",
      "3D.png",
      "FitnessPsychology.pdf",
      "Flat.jpg",
      "Host-a-Website-on-Rendercom-Using-a-Cloned-GitHub-Repository.pdf",
      "How-to-Host-a-Nodejs-Web-Server-on-Render.pdf",
      "Attention.pdf",
      "Creating-Amazing-Ebooks-with-Gammaapp-and-ChatGPT.pdf",
      "Creating-Your-eBook-A-Practical-Guide-to-Editing-HTML-and-CSS.pdf",
      "Host-Your-Website-with-Hostinger-The-Complete-Guide.pdf",
      "How-to-Create-and-Sell-eBooks-Using-ChatGPT-Gamma-App-and-Google-Ads.pdf",
      "How-to-Create-Effective-Ads-on-the-Google-Display-Network.pdf",
      "software_license_agreement.pdf",
      "website-exemple.png" // Aqui está com a extensão correta
    ];

    // Adiciona todos os arquivos ao zip (diretamente na raiz do zip)
    files.forEach(filename => {
      const fullPath = path.join(basePath, filename);
      archive.file(fullPath, { name: filename });
    });

    archive.finalize();
  });
}

// Função para gerar JWT
function gerarToken(email) {
    return jwt.sign({ email }, secretKey, { expiresIn: "1h" }); // Expira em 1 horas
}

// Configuração do Nodemailer para enviar e-mail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // service: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// Função para enviar o e-mail

async function sendEmail(email, name,  linkDownload) {
  
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Payment Confirmed – Download Your Material',
        text: '*This link is valid for 1 hour',
        html: `
          <!DOCTYPE html>
          <html lang="en-US">
          <head>
            <meta charset="UTF-8">
            <title>Payment Confirmation</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                padding: 20px;
                line-height: 1.6;
              }
    
              .container {
                background-color: #ffffff;
                padding: 30px;
                max-width: 600px;
                margin: 0 auto;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              }
    
              .title {
                font-size: 24px;
                font-weight: bold;
                color: #2d6cdf;
                margin-bottom: 10px;
              }
    
              .button {
                display: inline-block;
                padding: 12px 20px;
                background-color: #2d6cdf;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                font-weight: bold;
              }
              
              .button:hover{
                background-color: #1a40af;
              } 
    
              .course-recommendation {
                background-color: #f1f5ff;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
              }
    
              .course-recommendation h3 {
                margin-top: 0;
                color: #1a40af;
              }
    
              .course-image {
                width: 100%;
                max-width: 540px;
                border-radius: 8px;
                margin: 15px 0;
              }
    
              .footer {
                margin-top: 40px;
                font-size: 12px;
                color: #888;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <p class="title">Payment Confirmed ✅</p>
              <p>Hello, ${name}</p>
              <p>Your payment has been successfully processed. Thank you!</p>
              <p>You can now download your material:</p>
              <a href="${linkDownload}" class="button">Download</a>
              <div class="footer">Questions? Contact our support team.<br>&copy; 2025 profitsprinter.com</div>
            </div>
          </body>
          </html>
        `
      };
    await transporter.sendMail(mailOptions);
}

app.get("/", (req, res) => { res.render("index"); });
app.get("/success", (req, res)=> { res.render("success"); });
app.get("/terms-of-use", (req, res) => { res.render("termsofuse"); });
app.get("/privacy-policy", (req, res) => { res.render("privacypolicy"); });
app.get("/refund-policy", (req, res) => { res.render("refundpolicy"); });
app.get("/message", (req, res) => { res.render("m"); });
app.get("/error", (req, res) => { res.render("e"); });

// Rota para envio de e-mail
app.post('/send', async (req, res) => {
  const { nome, email, mensagem } = req.body;

 // Transporter com SMTP da Hostinger
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465, // ou 587 se não usar SSL
    secure: true, // true se porta 465, false se 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS 
    }
  });

  const mailOptions = {
    from: `"${nome}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: 'Nova mensagem do site',
    text: `Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect("/messagem")
  } catch (err) {
    res.redirect("/error")
  }
});

app.get("/download", async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).redirect("/checkout");
  jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) return res.status(403).redirect("/checkout");
      try {
          await criarZip(); // Garantir que o ZIP está pronto antes de enviar
          res.download(zipPath);
      } catch (error) {
          res.status(500);
      }
  });
});

app.post('/checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 6790,
          product_data: {
            name: 'Méthod – Profit Sprinter',
            images: ['https://raw.githubusercontent.com/josuefsy21/images/refs/heads/main/mok2.webp'],
            description: "With your purchase, you'll receive an optimized sales page, Stripe-integrated checkout, and an automatic email delivery system for your customers. Everything ready for you to start selling quickly!"
          }
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success`,
      cancel_url: `${process.env.BASE_URL}/`
    });

    return res.redirect(303, session.url);
  } catch (err) {
    res.status(500).redirect("/");
  }
});

app.use((req, res, next) => { res.redirect("/")});
app.listen(PORT);
