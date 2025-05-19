const express = require("express");
const cors = require("cors");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const nodemailer = require("nodemailer");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
//
//-------------------------------------------------------------------------------------




//------------------------------------------- Nodemailer -------------------
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",// exemple smtp.gmail.com
    port: 587,// exemple 587
    service: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});
//
//-------------------------------------------------------------------------------------




//------------------------------------------- Function to send email -----------------
async function sendEmail(email) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Ebook Is Here! 📚",
        text: "Thank you for your purchase! Attached is your ebook.",
        attachments: [
            {
                filename: "ebook.pdf",
                path: path.join(__dirname, "/private/ebook.pdf"),// Name your .pdf inside the private folder.
                contentType: "application/pdf"
            }
        ]
    };
    await transporter.sendMail(mailOptions);
}
//
//-------------------------------------------------------------------------------------




//------------------------------------------- Page routes -----------------------------
//
app.get("/", (req, res) => res.render("site"));
app.get("/success", (req, res) => res.render("success"));
app.get("/cancel", (req, res) => res.render("cancel"));
app.get("/terms", (req, res) => res.render("terms"));
//
//-------------------------------------------------------------------------------------




//------------------------------------------- Checkout --------------------------------
//
app.post("/checkout", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                    {
                    price_data: {
                        currency: "usd",
                        product_data: { 
                            name: "Name of your eBook", // Put your product name inside "".
                            images: [""], // Put your image URL inside "", the URL needs to be public! (optional)
                            description: "" // Put your product description here. (optional)
                        },
                        unit_amount: 9900, // $99.00 --> Put Your Price Here!
                    },
                    quantity: 1,
                }
            ],
            mode: "payment",
            success_url: `${process.env.BASE_URL}/success`,
            cancel_url: `${process.env.BASE_URL}/cancel`,
        });

        res.redirect(303, session.url);
    } catch (error) {
        res.status(500).redirect("/");
    }
});
//
//-------------------------------------------------------------------------------------




//------------------------------------------- Webhook ---------------------------------
//
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        return res.status(400);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const paymentStatus = session.payment_status; 
        const email = session.customer_details?.email;

        if (paymentStatus === "paid") {
            sendEmail(email);
        }
    }
    res.status(200);
});
//
//-------------------------------------------------------------------------------------




// ----------------------------------------- Server -----------------------------------
app.get("*", (req, res) => res.redirect("/"));
app.listen(PORT);
//
//-------------------------------------------------------------------------------------




//........................Here’s a professional copyright notice for your Node.js code:

//....................................This Node.js code is protected by copyright laws. 
//............................Unauthorized reproduction, distribution, or modification 
//............................of this code, in whole or in part, without explicit
//............................permission from the owner is strictly prohibited. 

//............................All rights reserved.