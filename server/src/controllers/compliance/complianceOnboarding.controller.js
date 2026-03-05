import mongoose from "mongoose";
import { CompanyComplianceProfile } from "../../models/compliance/companyComplianceProfileModel.js";
import { Organization } from "../../models/organizationModel.js";
import { asynchandler } from "../../utils/asynchandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

// Constants for company types
const COMPANY_TYPES = {
  PRIVATE: "private_limited",
  PUBLIC: "public_limited",
  LLP: "llp",
};

// Helper: fetch company profile by organization_id
const fetchProfile = async (organization_id) => {
  return CompanyComplianceProfile.findOne({ organization_id });
};

// Helper: determine missing required fields
const getMissingFields = (profile) => {
  const requiredFields = [];

  if ([COMPANY_TYPES.PRIVATE, COMPANY_TYPES.PUBLIC].includes(profile.company_type) && !profile.cin) {
    requiredFields.push("CIN");
  }
  if (profile.company_type === COMPANY_TYPES.LLP && !profile.llpin) {
    requiredFields.push("LLPIN");
  }

  ["pan", "gstin", "date_of_incorporation", "registered_office_address"].forEach((field) => {
    if (!profile[field]) requiredFields.push(field.toUpperCase());
  });

  return requiredFields;
};

// Create company compliance profile
export const createCompanyProfile = asynchandler(async (req, res) => {
  const { organization_id } = req.body;

  if (!organization_id) {
    throw new ApiError(400, "organization_id is required");
  }

  const org = await Organization.findOne({
    _id: organization_id,
    owner: req.user._id
  });

  if (!org) {
    throw new ApiError(404, "Organization not found or access denied");
  }

  const existingProfile = await CompanyComplianceProfile.findOne({ 
    organization_id 
  });

  if (existingProfile) {
    throw new ApiError(400, "Profile already exists");
  }

  const profile = await CompanyComplianceProfile.create({
    organization_id,
    ...req.body,
    financial_year_end: req.body.financial_year_end || 3,
    authorized_capital: req.body.authorized_capital || 0,
    paid_up_capital: req.body.paid_up_capital || 0,
    mca_status: "active",
    is_audit_applicable: false,
  });

  res.status(201).json(new ApiResponse(201, profile, "Company compliance profile created successfully"));
});

// Get company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const { organization_id } = req.query;

    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: "organization_id is required"
      });
    }

    const profile = await CompanyComplianceProfile.findOne({
      organization_id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update company profile
export const updateCompanyProfile = asynchandler(async (req, res) => {
  try {
    console.log('📥 Updating profile with ID:', req.params.id);
    console.log('📦 Update data:', req.body);

    // ✅ FIXED: Use findByIdAndUpdate with req.params.id
    const profile = await CompanyComplianceProfile.findByIdAndUpdate(
      req.params.id,  // This is the MongoDB _id from the URL
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      console.log('❌ Profile not found with ID:', req.params.id);
      throw new ApiError(404, "Compliance profile not found");
    }
    
    console.log('✅ Profile updated successfully:', profile._id);
    res.json(new ApiResponse(200, profile, "Profile updated successfully"));
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
});

// Onboarding status
export const getOnboardingStatus = asynchandler(async (req, res) => {
  const profile = await fetchProfile(req.params.organization_id);

  if (!profile) {
    return res.json(new ApiResponse(200, { 
      is_onboarded: false, 
      has_profile: false 
    }, "Onboarding status fetched"));
  }

  const missingFields = getMissingFields(profile);

  res.json(new ApiResponse(200, {
    organization_id: req.params.organization_id,
    has_profile: true,
    company_type: profile.company_type,
    profile_completed: missingFields.length === 0,
    missing_required_fields: missingFields,
    is_onboarded: missingFields.length === 0,
  }, "Onboarding status fetched"));
});