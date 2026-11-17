# DAINTY Security Rules Specification

## Data Invariants
1. **Owner-Only PII Isolation (`/users/{userId}`)**: A customer profile contains PII (`email`, `phone`, `address`). Only the authenticated owner (`request.auth.uid == userId`) can `get`, `create`, `update`, or `delete` their document. Collection-wide `list` queries are strictly disabled (`allow list: if false`) to prevent PII enumeration.
2. **Identity Integrity**: On `create`, `uid` must equal `userId` and `request.auth.uid`. On `update`, `uid` and `createdAt` are immutable.
3. **Volumetric & Schema Strictness**: Every string field has strict `.size()` bounds matching `firebase-blueprint.json` (`uid <= 128`, `name 1..100`, `email 3..160`, `phone <= 32`, `address <= 300`, `provider in ['google', 'password']`). Shadow/ghost fields are blocked via `hasAll` + `hasOnly` and `affectedKeys().hasOnly(...)`.
4. **Temporal Integrity**: `createdAt == request.time` on create; `updatedAt == request.time` on create and update.

## Dirty Dozen Adversarial Payloads (Must All Yield PERMISSION_DENIED)
1. **Unauthenticated Read**: `GET /users/uid_alice` with `auth: null` -> DENIED.
2. **Cross-User PII Read**: `GET /users/uid_alice` as `uid_bob` -> DENIED.
3. **Collection Enumeration**: `LIST /users` as `uid_alice` -> DENIED.
4. **Shadow/Privilege Field Create**: `CREATE /users/uid_alice` with `{ ..., isAdmin: true, role: "admin" }` -> DENIED by `hasOnly`.
5. **Identity Spoof Create**: `CREATE /users/uid_alice` as `uid_bob` -> DENIED by `isOwner(userId)` & `uid == request.auth.uid`.
6. **Path Variable Poisoning**: `CREATE /users/../../../bad$id` with invalid chars or length > 128 -> DENIED by `isValidId(userId)`.
7. **Client-Forged Timestamp**: `CREATE /users/uid_alice` with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time` -> DENIED.
8. **Oversized Name DoS**: `CREATE /users/uid_alice` with `name` of 500 chars -> DENIED by `size() <= 100`.
9. **Invalid Provider Enum**: `CREATE /users/uid_alice` with `provider: "anonymous"` -> DENIED by `provider in ['google', 'password']`.
10. **Immutable UID Mutation**: `UPDATE /users/uid_alice` changing `uid` to `"uid_bob"` -> DENIED.
11. **Immutable CreatedAt Mutation**: `UPDATE /users/uid_alice` changing `createdAt` -> DENIED.
12. **Shadow Key Update**: `UPDATE /users/uid_alice` adding `creditLimit: 999999` -> DENIED by `affectedKeys().hasOnly(...)`.
