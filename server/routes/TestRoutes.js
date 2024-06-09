import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
	res.status(200).json({ status: "UP" });
});

router.post("/login", (req, res) => {
	res.status(401).send("Unauthorized");
});

// change this to something besides comment
router.post("/comment", (req, res) => {
	const { comment } = req.body;
	if (comment.includes("<script>")) {
		return res.status(400).send("Bad Request");
	}
	res.status(200).send("Comment received");
});

export default router;
