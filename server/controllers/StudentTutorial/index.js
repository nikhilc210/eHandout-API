import StudentTutorial from "../../models/StudentTutorial/index.js";

// GET /api/user/tutorials
export const getStudentTutorials = async (req, res) => {
  try {
    // optional query: active=true/false
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) {
      filter.isActive = String(active).toLowerCase() === "true";
    }

    const tutorials = await StudentTutorial.find(filter).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      message: "Student tutorials retrieved successfully.",
      count: tutorials.length,
      data: tutorials,
    });
  } catch (error) {
    console.error("Error fetching student tutorials:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error: " + error.message,
      });
  }
};

// GET /api/user/tutorials/:id
export const getStudentTutorialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Missing tutorial id" });

    const tutorial = await StudentTutorial.findById(id);
    if (!tutorial)
      return res
        .status(404)
        .json({ success: false, message: "Tutorial not found" });

    return res.status(200).json({ success: true, data: tutorial });
  } catch (error) {
    console.error("Error fetching student tutorial by id:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error: " + error.message,
      });
  }
};
