import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
	res.status(200).json({ status: "UP" });
});

router.post("/login", (req, res) => {
	res.status(401).send("Unauthorized");
});

router.post("/api/messages", (req, res) => {
	const { message } = req.body;
	if (message.includes("<script>")) {
		return res.status(400).send("Bad Request");
	}
	res.status(200).send("Comment received");
});

export default router;
