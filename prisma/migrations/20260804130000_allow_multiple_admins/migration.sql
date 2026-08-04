DROP INDEX IF EXISTS "User_single_admin_key";

INSERT INTO "User" (
  "id", "role", "name", "email", "passwordHash", "mustChangeCredentials", "createdAt"
)
VALUES (
  'admin_secondary_1021',
  'ADMIN',
  '運営管理者',
  '1021',
  '$2b$12$Y2ehYe/pJWa/V9CJN.KM0.xuKYzNtCZzN1Khrh4ndeYgah4bWNiuS',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;
