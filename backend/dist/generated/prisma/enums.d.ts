export declare const Role: {
    readonly PATIENT: "PATIENT";
    readonly DOCTOR: "DOCTOR";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const AppointmentStatus: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly CANCELLED: "CANCELLED";
    readonly COMPLETED: "COMPLETED";
};
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
export declare const NotificationType: {
    readonly APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED";
    readonly APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED";
    readonly APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER";
    readonly SCHEDULE_UPDATED: "SCHEDULE_UPDATED";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
//# sourceMappingURL=enums.d.ts.map