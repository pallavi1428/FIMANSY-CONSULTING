import { Director } from "../../models/compliance/directorModel.js";
export const getDirectors = async (req, res) => {
  try {
    const { organization_id } = req.query;

    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: "organization_id is required"
      });
    }

    const directors = await Director.find({ organization_id }).lean();

    res.json({
      success: true,
      data: directors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDirector = async (req, res) => {
  try {
    const { organization_id, ...data } = req.body;

    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: "organization_id is required"
      });
    }

    const director = await Director.create({ organization_id, ...data });

    res.status(201).json({
      success: true,
      data: director
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const director = await Director.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!director) {
      return res.status(404).json({
        success: false,
        message: "Director not found"
      });
    }

    res.json({
      success: true,
      data: director
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDirector = async (req, res) => {
  try {
    const { id } = req.params;

    await Director.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Director deleted"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};