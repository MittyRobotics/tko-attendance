import express from "express";

const PORT = process.env.PORT || 4000;
const app = express();

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(require("./endpoints"));

app.listen(PORT, function () {
  console.log(`Server listening at http://localhost:${PORT} 🚀`);
});