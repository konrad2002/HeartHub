# Backend Plan

## Scope
Backend supports projects (shared spaces) with members, and per-project content: notes, message-of-the-day (MOTD), trainings, and locations (visited and wishlist). Auth is handled by Keycloak (OIDC). Backend stores users and project membership.

## Capabilities
### Auth and User Sync
- Validate Keycloak access tokens for every request.
- Create or update local user record on first login.
- Map Keycloak subject to internal user id.

### Projects
- Create project (owner becomes admin).
- Update project name and description.
- Archive project (soft delete).
- List projects for current user.
- Get project details.

### Project Membership
- Invite user by email to project.
- Accept or decline invite.
- Remove member (admin only).
- Change role (admin only).

### MOTD (per project, per member)
- Set MOTD message for another member.
- Update and clear MOTD.
- Read MOTD for current user in project context.

### Notes
- Create, list, update, delete notes.
- Optional pinned flag.

### Trainings
- Create, list, update, delete training entries.
- Fields: date, duration, type, intensity, notes, tags.

### Locations
- Two lists: visited and wishlist.
- Create, list, update, delete locations.
- Fields: name, date (visited only), priority (wishlist only), notes, tags.

## Access Rules
- All project-scoped resources require membership.
- Only admins can manage project settings and membership.
- All items are scoped to a project and author.

## API Endpoints (Draft)
### Auth
- `GET /me` current user profile

### Projects
- `GET /projects`
- `POST /projects`
- `GET /projects/{projectId}`
- `PATCH /projects/{projectId}`
- `POST /projects/{projectId}/archive`

### Membership
- `GET /projects/{projectId}/members`
- `POST /projects/{projectId}/invites`
- `POST /projects/{projectId}/invites/{inviteId}/accept`
- `POST /projects/{projectId}/invites/{inviteId}/decline`
- `DELETE /projects/{projectId}/members/{memberId}`
- `PATCH /projects/{projectId}/members/{memberId}`

### MOTD
- `GET /projects/{projectId}/motd`
- `POST /projects/{projectId}/motd`
- `PATCH /projects/{projectId}/motd/{motdId}`
- `DELETE /projects/{projectId}/motd/{motdId}`

### Notes
- `GET /projects/{projectId}/notes`
- `POST /projects/{projectId}/notes`
- `GET /projects/{projectId}/notes/{noteId}`
- `PATCH /projects/{projectId}/notes/{noteId}`
- `DELETE /projects/{projectId}/notes/{noteId}`

### Trainings
- `GET /projects/{projectId}/trainings`
- `POST /projects/{projectId}/trainings`
- `GET /projects/{projectId}/trainings/{trainingId}`
- `PATCH /projects/{projectId}/trainings/{trainingId}`
- `DELETE /projects/{projectId}/trainings/{trainingId}`

### Locations (Visited)
- `GET /projects/{projectId}/locations/visited`
- `POST /projects/{projectId}/locations/visited`
- `GET /projects/{projectId}/locations/visited/{locationId}`
- `PATCH /projects/{projectId}/locations/visited/{locationId}`
- `DELETE /projects/{projectId}/locations/visited/{locationId}`

### Locations (Wishlist)
- `GET /projects/{projectId}/locations/wishlist`
- `POST /projects/{projectId}/locations/wishlist`
- `GET /projects/{projectId}/locations/wishlist/{locationId}`
- `PATCH /projects/{projectId}/locations/wishlist/{locationId}`
- `DELETE /projects/{projectId}/locations/wishlist/{locationId}`

## Persistence Plan (Prisma)
- User: id, keycloakSubject, email, name
- Project: id, name, description, archivedAt
- ProjectMember: id, projectId, userId, role
- ProjectInvite: id, projectId, email, token, status
- Motd: id, projectId, fromUserId, toUserId, message
- Note: id, projectId, authorId, title, body, pinned
- Training: id, projectId, authorId, date, duration, type, intensity, notes, tags
- LocationVisited: id, projectId, authorId, name, date, notes, tags
- LocationWishlist: id, projectId, authorId, name, priority, notes, tags

## Non-Goals (Now)
- Social feed or public sharing.
- Payments.
- File uploads.
