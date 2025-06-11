import { Request, Response, Router } from "express";

const StarterRouter = Router();

StarterRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hey I'm starter router 👋" });
});

export { StarterRouter };
