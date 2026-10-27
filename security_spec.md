# Security Specification - Aspire Academy Online

## 1. Data Invariants
1. **User Identity & Role Elevation Guard**: Normal students cannot elevate their own role to `admin` during user registration or update. Roles must default to `student`. The user `deepka2772@gmail.com` is bootstrapped as the platform administrator.
2. **PII Isolation**: User email, phone, and profile info are accessible only by the account owner (`request.auth.uid == userId`) or an admin.
3. **Course Publishing**: Only published courses (`isPublished == true`) are readable by public visitors. Unpublished drafts are strictly admin-only.
4. **Lesson Protection**: Free preview lessons (`isFreePreview == true`) can be read publicly. Paid lessons can only be read by administrators or users who have an active enrollment for the associated `courseId`.
5. **Enrollment Ownership & Immutability**: Students can only create an enrollment for themselves (`userId == request.auth.uid`). Once enrolled, a student cannot tamper with or delete other students' enrollments.
6. **Order & Payment Verification Invariant**: Students cannot write arbitrary `paid` status without verified server-side checks or admin intervention. Students can only read their own orders.
7. **Quiz Integrity**: Students can read published quizzes for courses they are enrolled in, but answer keys remain private. Students can only submit their own quiz attempts with `userId == request.auth.uid`.
8. **Admin-Only Content**: Creating, modifying, or deleting courses, lessons, categories, faculty, batches, and site settings is strictly restricted to platform administrators.

## 2. The "Dirty Dozen" Payloads (Attacks That Must Be Blocked)
1. **Privilege Escalation on Signup**: An unprivileged user submits `{ userId: 'student_123', email: 'attacker@evil.com', role: 'admin' }` to `/users/student_123` -> REJECTED.
2. **Profile Role Overwrite**: A signed-in student attempts `update` on `/users/{uid}` changing `role` from `"student"` to `"admin"` -> REJECTED.
3. **Ghost Document Poisoning**: Attacker injects a 50KB payload into `/courses/exploit` with unknown shadow keys -> REJECTED.
4. **ID Poisoning Attack**: An attacker sends requests with non-alphanumeric or >128-char IDs like `../../hack/admin` -> REJECTED.
5. **Unauthorized Course Creation**: Non-admin user tries to write a new course document into `/courses` -> REJECTED.
6. **Publishing Status Tamper**: A student attempts to publish an unapproved course draft -> REJECTED.
7. **Free Access to Paid Content**: A student with no enrollment attempts to read a non-preview lesson -> REJECTED.
8. **Forged Enrollment**: Student creates an enrollment document for another student `userId: 'victim_456'` -> REJECTED.
9. **Fake Payment Order Status**: Student creates an order with `status: 'paid'` without server-side signature -> REJECTED.
10. **Tampered Quiz Score**: Student updates `/quizAttempts/attempt_1` to change score from `20` to `100` -> REJECTED.
11. **Snooping Other Students' Orders**: Student queries `/orders` without filtering `userId == request.auth.uid` -> REJECTED.
12. **Settings Alteration**: Student attempts to edit site announcement or contact email in `/settings/site_settings` -> REJECTED.
