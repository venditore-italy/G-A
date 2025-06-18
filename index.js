const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// In-memory data per esempio, usato come database (da sostituire con un DB vero)
let users = [{ email: "admin@ga.com", password: "admin123" }];
let products = [
  { id: 1, name: 'Prodotto Esempio 1', description: 'Descrizione prodotto 1', price: 100, image: 'https://via.placeholder.com/150' }
];

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Autenticazione (solo tu puoi aggiungere prodotti)
let currentUser = null;

// Funzione per verificare il login
function verifyLogin(req, res, next) {
  if (!currentUser) {
    return res.status(401).send('Accesso negato. Devi effettuare il login.');
  }
  next();
}

// Rotta di login (solo per admin)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).send('Credenziali errate.');
  }
  currentUser = user;
  res.send('Login effettuato con successo!');
});

// Rotta di logout
app.post('/logout', (req, res) => {
  currentUser = null;
  res.send('Logout effettuato con successo!');
});

// Rotte per i prodotti (solo tu puoi aggiungere prodotti)
app.post('/add-product', verifyLogin, (req, res) => {
  const { name, description, price, image } = req.body;
  const newProduct = { id: products.length + 1, name, description, price, image };
  products.push(newProduct);
  res.status(201).send('Prodotto aggiunto con successo!');
});

app.get('/products', (req, res) => {
  res.json(products);
});

// Servire il frontend
app.use(express.static(path.join(__dirname, 'public')));

// Index HTML per il frontend
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GA E-commerce</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { display: flex; flex-wrap: wrap; gap: 20px; }
          .product { background: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px; width: 200px; }
          img { width: 100%; height: auto; border-radius: 5px; }
          .button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
          .button:hover { background-color: #0056b3; }
        </style>
      </head>
      <body>
        <h1>Benvenuto su GA E-commerce</h1>
        <div class="container">
          ${products.map(p => `
            <div class="product">
              <img src="${p.image}" alt="${p.name}">
              <h2>${p.name}</h2>
              <p>${p.description}</p>
              <p>Prezzo: €${p.price}</p>
            </div>
          `).join('')}
        </div>

        <h2>Aggiungi un nuovo prodotto (solo per admin)</h2>
        <form action="/add-product" method="POST">
          <input type="text" name="name" placeholder="Nome prodotto" required><br><br>
          <input type="text" name="description" placeholder="Descrizione prodotto" required><br><br>
          <input type="number" name="price" placeholder="Prezzo prodotto" required><br><br>
          <input type="text" name="image" placeholder="URL immagine prodotto" required><br><br>
          <button type="submit" class="button">Aggiungi prodotto</button>
        </form>

        <h2>Effettua il login per aggiungere prodotti</h2>
        <form action="/login" method="POST">
          <input type="email" name="email" placeholder="Email" required><br><br>
          <input type="password" name="password" placeholder="Password" required><br><br>
          <button type="submit" class="button">Login</button>
        </form>

        <h2>Logout</h2>
        <form action="/logout" method="POST">
          <button type="submit" class="button">Logout</button>
        </form>
      </body>
    </html>
  `);
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server in esecuzione su http://localhost:${port}`);
});
