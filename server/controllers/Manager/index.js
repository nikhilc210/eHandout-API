import Manager from "../../models/Manager/index.js";
export const verifyActivationCode = async (req, res) => {
  const { code } = req.body;
  try {
    if (!code)
      return res.status(400).json({
        success: false,
        message: "Please provide valid activation code.",
      });
    const manager = await Manager.findOne({ code });
    if (!manager)
      return res.status(400).json({
        success: false,
        message: "Please provide valid activation code.",
      });
    let expiryDate = manager.expiry;
    console.log(expiryDate);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};
