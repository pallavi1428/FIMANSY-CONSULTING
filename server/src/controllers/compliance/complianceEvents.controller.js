import { ComplianceEvent } from "../../models/compliance/complianceEventModel.js";

export const getEvents = async (req, res) => {
  try {
    const { organization_id } = req.query;

    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: "organization_id is required"
      });
    }

    // ✅ FIXED: Use ComplianceEvent instead of Event
    const events = await ComplianceEvent.find({ organization_id })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { organization_id, ...data } = req.body;

    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: "organization_id is required"
      });
    }

    // ✅ FIXED: Use ComplianceEvent instead of Event
    const event = await ComplianceEvent.create({ organization_id, ...data });

    res.status(201).json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ✅ FIXED: Use ComplianceEvent instead of Event
    const event = await ComplianceEvent.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acknowledgeEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ FIXED: Use ComplianceEvent instead of Event
    const event = await ComplianceEvent.findByIdAndUpdate(
      id,
      { is_acknowledged: true, acknowledged_at: new Date() },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      data: event,
      message: "Event acknowledged"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ FIXED: Use ComplianceEvent instead of Event
    await ComplianceEvent.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Event deleted"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};