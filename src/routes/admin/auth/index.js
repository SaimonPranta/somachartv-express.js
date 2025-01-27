const router = require("express").Router();
const AdminCollection = require("../../../DB/Modals/admin");
const jwt = require("jsonwebtoken");
const EmployCollection = require("../../../DB/Modals/employ");

router.get("/check-token", async (req, res) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ");
    }
    if (!token || !token[1]) {
      return res.json({ message: "Unauthorize attempt" });
    }
    token = token[1];

    const { mail } = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (mail) {
      const admin = await EmployCollection.findOne({
        email: mail,
        panelAccess: true,
      }).select("email");
      if (admin) {
        return res.json({ verified: true, admin });
      }
    }

    res.json({ message: "Unauthorized attempt" });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { mail, password } = req.body;
    const data = await EmployCollection.findOne({
      email: mail,
      password,
      //  panelAccess: true
    });
    // const data = await EmployCollection.create({
    //      email: mail, password
    // })
    const token = await jwt.sign(
      {
        mail,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3d" }
    );
    res.json({ data, token });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
});

module.exports = router;
