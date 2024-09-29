// In a separate file, e.g., types.ts
export const VerificationStatus = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    IN_REVIEW: 'IN_REVIEW',
    EXPIRED: 'EXPIRED',
    ABANDONED: 'ABANDONED',
    KYC_EXPIRED: 'KYC_EXPIRED',
  } as const;
  
  export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];