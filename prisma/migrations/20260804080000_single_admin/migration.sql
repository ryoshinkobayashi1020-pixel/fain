-- PostgreSQL partial unique index: only one ADMIN user can exist.
CREATE UNIQUE INDEX "User_single_admin_key"
ON "User" ("role")
WHERE "role" = 'ADMIN';
