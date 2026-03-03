import express from "express";

import { getAllTemplates } from "../scripts/seedComplianceTemplates.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { 
  createCompanyProfile, 
  getCompanyProfile, 
  updateCompanyProfile, 
  getOnboardingStatus 
} from "../controllers/compliance/complianceOnboarding.controller.js";

import { 
  generateFY, 
  getCalendarObligations, 
  updateObligationStatus,
  deleteFYObligations,
  getDashboardSummary 
} from "../controllers/compliance/complianceCalendar.controller.js";

const complianceRoutes = express.Router();

complianceRoutes.get("/", getAllTemplates);

//complianceRoutes.post("/generate-fy", generateFY);
//complianceRoutes.get("/calendar", getCalendarObligations);
//complianceRoutes.get("/dashboard-summary", getDashboardSummary);
//complianceRoutes.post("/complete", markCompleted);
//complianceRoutes.post("/ignore", ignoreObligation);

complianceRoutes.post("/organization/:organization_id/generate-fy", generateFY);
complianceRoutes.get("/organization/:organization_id/calendar", getCalendarObligations);
complianceRoutes.get("/organization/:organization_id/dashboard-summary", getDashboardSummary);
complianceRoutes.delete("/organization/:organization_id/fy/:financialYear", deleteFYObligations);
complianceRoutes.patch("/obligation/:obligation_id", updateObligationStatus);

// Apply protectRoute to ensure req.user exists
complianceRoutes.post("/organization/:organization_id/profile", protectRoute, createCompanyProfile); // create
complianceRoutes.get("/organization/:organization_id/profile", protectRoute, getCompanyProfile); // read
complianceRoutes.put("/organization/:organization_id/profile", protectRoute, updateCompanyProfile); // update
complianceRoutes.get("/organization/:organization_id/onboarding-status", protectRoute, getOnboardingStatus); // onboarding status

export default complianceRoutes;