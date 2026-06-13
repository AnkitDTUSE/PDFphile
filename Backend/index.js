import { app } from "./app.js";
import connectDb from "./database/index.db.js";

const PORT = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB connection failed :( ", err);
  });
