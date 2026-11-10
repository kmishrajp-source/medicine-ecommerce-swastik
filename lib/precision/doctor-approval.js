/**
 * Swastik Precision Health AI — Doctor Approval Engine
 * Cryptographic sign-off with SHA-256 signature
 */

import { createHash } from 'crypto';

// ─── Create Doctor Approval ───────────────────────────────────────────────────
export function createDoctorApproval({ doctorId, doctorName, qualification, registrationNumber, clinicalRecordId, patientId, decision, notes, modifications }) {
  const timestamp = new Date().toISOString();

  // Build canonical payload for signing
  const payload = JSON.stringify({
    doctorId,
    clinicalRecordId,
    patientId,
    decision,
    timestamp,
  });

  // SHA-256 signature (non-cryptographic demo — real implementation uses RSA/ECDSA)
  const signature = createHash('sha256').update(payload).digest('hex');

  return {
    id: `DR-${Date.now()}`,
    doctorId,
    doctorName,
    qualification,
    registrationNumber,
    clinicalRecordId,
    patientId,
    decision, // 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'
    notes: notes || '',
    modifications: modifications || [],
    signature,
    signatureAlgorithm: 'SHA-256-DEMO',
    reviewedAt: timestamp,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    status: decision === 'APPROVED' ? 'active' : 'inactive',
    disclaimer: 'Digital signature for audit trail only. This is a demo SHA-256 hash. Production should use RSA/ECDSA with PKI.',
  };
}

// ─── Verify Approval ──────────────────────────────────────────────────────────
export function verifyApproval(approval) {
  const { doctorId, clinicalRecordId, patientId, decision, reviewedAt, signature } = approval;
  const payload = JSON.stringify({ doctorId, clinicalRecordId, patientId, decision, timestamp: reviewedAt });
  const expected = createHash('sha256').update(payload).digest('hex');
  return {
    valid: expected === signature,
    checkedAt: new Date().toISOString(),
  };
}

// ─── Approval Status Check ───────────────────────────────────────────────────
export function getApprovalStatus(approval) {
  if (!approval) return 'not_reviewed';
  if (approval.decision === 'APPROVED' && new Date(approval.validUntil) > new Date()) return 'approved';
  if (approval.decision === 'REJECTED') return 'rejected';
  if (approval.decision === 'NEEDS_REVISION') return 'needs_revision';
  if (new Date(approval.validUntil) <= new Date()) return 'expired';
  return 'pending';
}

