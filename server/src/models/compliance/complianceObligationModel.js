import mongoose from "mongoose";

const complianceObligationSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    // ✅ Add these fields to match what the engine generates
    category_tag: {
      type: String,
      enum: ['gst', 'tds', 'income_tax', 'payroll', 'mca'],
      required: true,
    },
    subtag: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Keep your existing fields but make them optional
    compliance_type: {
      type: String,
      enum: [
        'mca_annual',
        'mca_event',
        'income_tax',
        'advance_tax',
        'gst',
        'tds',
      ],
      // Remove required: true
    },
    form_name: {
      type: String,
      trim: true,
      // Remove required: true
    },
    form_description: {
      type: String,
      trim: true,
    },
    due_date: {
      type: Date,
      required: true,
      index: true,
    },
    filing_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        'not_started',
        'in_progress',
        'filed',
        'overdue',
        'not_applicable',
      ],
      default: 'not_started',
      index: true,
    },
    financial_year: {
      type: String,
      trim: true,
    },
    // Engine fields
    is_recurring: {
      type: Boolean,
      default: false,
    },
    recurrence_type: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'one_time'],
    },
    recurrence_config: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Keep your other fields...
    assessment_year: String,
    trigger_event: String,
    trigger_date: Date,
    filing_fee: { type: Number, default: 0 },
    late_fee: { type: Number, default: 0 },
    srn_number: String,
    acknowledgement_number: String,
    notes: String,
    documents: [String],
    priority: { type: Number, min: 1, max: 5, default: 5 },
    parent_obligation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceObligation",
    },
    reminder_sent_at: [Date],
    completed_at: Date,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Compound indexes
complianceObligationSchema.index({ organization_id: 1, status: 1 });
complianceObligationSchema.index({ organization_id: 1, due_date: 1 });
complianceObligationSchema.index({ organization_id: 1, compliance_type: 1 });
complianceObligationSchema.index({ organization_id: 1, category_tag: 1 }); // Add this

export const ComplianceObligation = mongoose.model(
  "ComplianceObligation",
  complianceObligationSchema
);