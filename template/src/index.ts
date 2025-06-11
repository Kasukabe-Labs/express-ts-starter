import express, { Request, Response } from "express";
import cors from "cors";
import { StarterRouter } from "./routes/starterRoute";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Server running successfully!");
});

app.use("/starter", StarterRouter);

app.listen(PORT, () => {
  console.log(`Server litsening on PORT: ${PORT}`);
});
