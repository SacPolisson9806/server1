// server1.js
const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // React
app.use(express.json());

// 🔹 Config SQL Server
const config = {
  user: "SacPolisson9806",      // Remplace par ton utilisateur SQL
  password: "Pokemon12****",           // Remplace par ton mot de passe SQL
  server: "sql.bsite.net\\MSSQL2016",           // ou IP de ton serveur SQL
  database: "sacpolisson9806_datahubejeuxreact",   // Nom de ta base
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// 🔹 Route Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Pseudo ou mot de passe manquant" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await sql.connect(config);

    // Vérifie si le pseudo existe déjà
    const check = await sql.query`SELECT * FROM Users WHERE Username = ${username}`;
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "Ce pseudo existe déjà !" });
    }

    // Insère le nouvel utilisateur
    await sql.query`INSERT INTO Users (Username, PasswordHash) VALUES (${username}, ${hash})`;
    console.log("Utilisateur créé :", username);
    res.json({ success: true, message: "Compte créé !" });
  } catch (err) {
    console.error("Erreur signup :", err);
    res.status(500).json({ success: false, message: "Erreur serveur, réessaie plus tard." });
  }
});

// 🔹 Route Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Pseudo ou mot de passe manquant" });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM Users WHERE Username = ${username}`;

    if (result.recordset.length === 0) {
      return res.status(400).json({ success: false, message: "Pseudo inconnu." });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match) {
      return res.status(400).json({ success: false, message: "Mot de passe incorrect." });
    }

    console.log("Connexion réussie pour :", username);
    res.json({ success: true, message: "Connexion réussie" });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ success: false, message: "Erreur serveur, réessaie plus tard." });
  }
});

// 🔹 Démarrage serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
