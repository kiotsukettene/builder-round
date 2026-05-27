# TellMD

> TellMD — Tell us your symptoms. We connect you to the right doctor.

## Overview

TellMD is a modern telehealth web application that enables patients to connect with doctors online through virtual consultations, appointment scheduling, AI-assisted doctor recommendations, and digital medical records management.

The platform is designed to improve accessibility to healthcare services while providing a seamless experience for both patients and doctors.

This project is developed as a Minimum Viable Product (MVP) using the PERN stack with TypeScript.

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI
- React Query
- Zustand
- React Hook Form
- Zod
- Tanstack

## Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL (Neon)
- Prisma ORM
- JWT Authentication
- Socket.IO

## External Services
- Gemini API (AI doctor recommendation)
- ZegoCloud (Video consultation)
- Cloudinary (Image uploads)

---

# Core Features

# Patient Module

## Patient Account Creation (Authentication)
### Description
- Allows patients to securely register and create their own telehealth account. This module serves as the entry point to the platform.
- Allow patients to add personal information to their profile
### Details
- Register using email and password
- Input details such as Name, Birthday, Weight, Height, Profile Picture, Contact Details, Basic Medical History

## Patient Profile
- Update personal information
- Upload profile picture
- Add medical history
- Manage contact details

## Doctor Discovery
### Description 
- Enables patients to browse available doctors and review their schedules before booking consultations.
### Details
- Browse doctors and view their availability
- Explore doctors based on medical needs/symptoms
- Filter/search doctors by specialization

## AI Recommendation
### Description
- Allows patients to describe their symptoms or healthcare concerns and receive suggested doctors based on specialization or expertise.
### Details
- AI recommends doctor based on patient needs

## Appointment Booking
### Description
- Allows patients to schedule online consultations with doctors based on available schedules.
- Real time push notifications
### Details
- Book consultation schedules
- Cancel appointments
- Reschedule appointments
- Receive real-time notifications


## Consultation Session
### Description
- Provides patients access to a virtual consultation experience where they can join their scheduled appointment online. Note: The consultation session does not require a fully custom-built video conferencing solution.
### Details
- Join online consultation
- Access video consultation room

## Medical Records
### Description
- Allows patients to review their previous consultations and view records provided by doctors after each session.
### Details
- View appointment history
- View consultation notes
- View prescriptions

---

# Doctor Module

## Doctor Profile Management (Authentication)
### Description
- Allows doctors to securely register and create their own account.
### Details
- Register account
- Login account

## Doctor Profile
### Description
- Allows doctors to manage their account
### Details
- Manage profile
- Add specialization
- Add biography
- Manage consultation fee

## Medical Records Access
### Description
- Allows doctors to manage their consultation availability and ensure schedules are properly organized.
### Details
- View appointment history and medical records/prescriptions

## Consultation Schedule Management
### Description
- Allows doctors to manage their consultation availability and ensure schedules are properly organized.
### Details
- Manage consultation schedules
- Set availability
- Restrict unavailable time slots
- Manage consultation schedules
- Real time push notifications for booked, upcoming appointments, and schedule updates

## Consultation Notes & Prescriptions
### Description 
- Allows doctors to document findings, recommendations, prescriptions, and consultation summaries after each appointment.
### Details
- Add prescriptions and/or medical consultation notes



## Consultation Session
### Description
- Enables doctors to join and conduct virtual consultations with patients.
### Details
- Join virtual consultations
- Conduct patient consultations

---

# Bonus Features

## AI Symptom-to-Specialist Recommendation
Patients can describe their symptoms and receive intelligent doctor recommendations based on medical specialization.

## Real-Time Notifications
Patients and doctors receive updates for:
- Booked appointments
- Upcoming schedules
- Schedule changes
- Consultation reminders
