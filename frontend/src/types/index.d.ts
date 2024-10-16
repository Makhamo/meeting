declare type Gender = "Male" | "Female" | "Other";
declare type Status = "pending" | "scheduled" | "cancelled";
declare type UserRole = "Admin" | "Doctor" | "Patient";
declare type Speciality = "Genaral" | "Orthopedic";
declare type PaymentStatus = "Pending" | "Paid" | "NotPaid";
declare type PaymentMethod = "Online" | "Cash";



declare type users = { 
    userId: string;
    firstName: string;
    lastName: string;
    role: UserRole; 
    phoneNumber: number;
    email: string;
    password: string;
    gender: Gender; 
    marketingConsent?: boolean;
    createdAt: string;
    createdBy: string;
    updatedDate?: string | null; 
    updatedBy?: string | null; 
    deletedDate?: string | null; 
    deletedBy?: string | null; 
    resetPasswordToken: string;
    resetPasswordExpiresAt: string; 
    verificationToken: string;
    verificationTokenExpiresAt: string; 
    isActive: boolean; 
};

declare type Hospital = {
    hospitalId: string;
    doctorId: string;
    hospitalName: string;
    address: string;
    phoneNumber: number;
    email: string;
    operatingHours: string;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    deletedBy: string;
    deletedDate: string;
    isActive: boolean;
};

declare type doctors = {
    doctorId: string;
    userId: string;
    availability: string;
    speciality: Speciality;
    practiceNumber: number;
    isActive: boolean;
    createdDate: string;
    createdBy: string;
    updatedDate?: string | null;
    updatedBy?: string | null;
    deletedDate?: string | null;
    deletedBy?: string | null;
    regFee: number;
    consultFee: number;
};

declare type patientFile = {
    patientFileId: string;
    patientId: string;
    doctorId: string;
    appointmentId: string;
    clinicalInformation: string;
    diagnosis: string;
    dnr: boolean;
    prescription: string;
    createdBy: string;
    createdDate: string;
    updatedBy?: string | null;
    updatedDate: string | null;
    deletedBy: string;
    deletedDate: string;
    isActive: boolean;
};

declare type reviews = {
    patientId: string;
    doctorId: string;
    review: string;
    rating: number;
    isActive: boolean;
    createdBy: string;
    createdDate: string;
    updatedBy?: string | null;
    updatedDate?: string | null;
    deletedBy?: string | null;
    deletedDate?: string | null;
};

declare type appointments = {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    schedule: string;
    status: Status;
    reason: string;
    createdDate: string;
    createdBy: string;
    updatedDate?: string | null;
    updatedBy?: string | null;
    deletedDate?: string | null;
    deletedBy?: string | null;
    isActive: boolean;
};

declare type medicalaid = {
    medicalAidId: string;
    patientId: string;
    medicalAidNumber: string;
    medicalAidOption: string;
    medicalProvider: string;
    isActive: boolean;
    createdBy: string;
    createdDate?: string | null;
    updatedBy?: string | null;
    updatedDate?: string | null;
    deletedDate?: string | null;
};

declare type patient = {
    patientId: string;
    userId: string;
    medicalAidId?: string | null;
    medicalHistory?: string | null;
    familyMedicalHistory?: string | null;
    identification: number;
    identificationUrl: ArrayBuffer;
    address: string;
    emergencyContactName: string;
    emergencyContact: number;
    allergies?: string | null;
    occupation?: string | null;
    medication?: string | null;
    chronicDiseases?: boolean;
    medicalConsent: boolean;
    isActive: boolean;
    createdDate: string;
    createdBy: string;
    updatedDate?: string | null;
    updatedBy?: string | null;
    deletedDate?: string | null;
    deletedBy?: string | null;
};


declare type payments = {
    paymentId: string;
    appointmentId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentDate: string;
    amount: number;
    createdBy: string;
    createdDate: string;
    updatedBy?: string | null;
    updatedDate?: string | null;
    deletedBy: string;
    deletedDate: string;
    isActive: boolean; 
};
