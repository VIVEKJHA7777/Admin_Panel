
# Project Management System

## Project Description

This project is a **Project Management System** built using **Node.js**, **Express**, and **Sequelize** with **PostgreSQL** as the database. The system allows **Admins** to create and manage projects and assign them to **Managers**. It also provides features for soft deleting, restoring, and permanently deleting projects. Users can be managed by **Admins**, who can assign or revoke roles and perform CRUD operations on users. The system includes an **audit logging** feature to track changes and actions.

## Features
- Admin and Manager roles with appropriate access controls
- Create, update, soft delete, restore, and permanently delete projects
- Manage users (registration, soft delete, restore, permanent deletion)
- Assign and revoke roles for users
- Audit logging of actions

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VIVEKJHA7777/Admin_Panel
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in the `.env` file:
   ```
   DB_HOST=<your_db_host>
   DB_USER=<your_db_username>
   DB_PASS=<your_db_password>
   DB_NAME=<your_db_name>
   JWT_SECRET=<your_jwt_secret>
   ```

4. Start the server:
   ```bash
   npm start
   ```
### Hosted Website Link
[Admin Panel](https://admin-panel-7hqs.onrender.com)

https://admin-panel-7hqs.onrender.com


## Project Routes

### Authentication Routes
1. **Admin Signup**
   - **POST** `/api/auth/signup`
   - **Input**: `{ username, password, email }`
   - **Output**: `{"message": "Admin registered successfully"}`
   
2. **Admin Login**
   - **POST** `/api/auth/login`
   - **Input**: `{ username, password }`
   - **Output**: `{"token": "<jwt_token>"}`
   
3. **Admin Logout**
   - **POST** `/api/auth/logout`
   - **Output**: `{"message": "Logged out successfully"}`

### Project Routes
1. **Create Project** (Admin only)
   - **POST** `/projects/create`
   - **Input**: `{ name, description, managerId }`
   - **Output**: `{"message": "Project created successfully", project: { details }}`

2. **Get All Projects** (Admin only)
   - **GET** `/projects/getAllproject`
   - **Output**: `{ projects: [ { id, name, description, manager } ] }`
   
3. **Get Project by ID** (Admin only)
   - **GET** `/projects/getproject/:id`
   - **Output**: `{ project: { id, name, description, manager } }`
   
4. **Update Project** (Admin only)
   - **PUT** `/projects/updateProject/:id`
   - **Input**: `{ name, description, managerId }`
   - **Output**: `{"message": "Project updated successfully", project: { details }}`

5. **Soft Delete Project** (Admin only)
   - **DELETE** `/projects/softdelete/:id`
   - **Output**: `{"message": "Project soft deleted successfully"}`

6. **Restore Project** (Admin only)
   - **PATCH** `/projects/restore/:id`
   - **Output**: `{"message": "Project restored successfully"}`

7. **Permanent Delete Project** (Admin only)
   - **DELETE** `/projects/permanent/:id`
   - **Output**: `{"message": "Project permanently deleted successfully"}`

### User Management Routes
1. **Register User** (Admin only)
   - **POST** `/api/auth/user/register`
   - **Input**: `{ username, password, email }`
   - **Output**: `{"message": "User registered successfully"}`

2. **Login User**
   - **POST** `/api/auth/user/login`
   - **Input**: `{ username, password }`
   - **Output**: `{"token": "<jwt_token>"}`
   
3. **Get All Users** (Admin and Manager)
   - **GET** `/api/auth/user/getAllUsers`
   - **Output**: `{ users: [ { id, username, email } ] }`

4. **Get User by ID** 
   - **GET** `/api/auth/user/getUser/:id`
   - **Output**: `{ user: { id, username, email } }`

5. **Update User** (Admin only)
   - **PUT** `/api/auth/user/updateUser/:id`
   - **Input**: `{ username, email, role }`
   - **Output**: `{"message": "User updated successfully", user: { details }}`

6. **Soft Delete User** (Admin only)
   - **DELETE** `/api/auth/user/soft/:id`
   - **Output**: `{"message": "User soft deleted successfully"}`

7. **Restore User** (Admin only)
   - **PATCH** `/api/auth/user/restore/:id`
   - **Output**: `{"message": "User restored successfully"}`

8. **Permanent Delete User** (Admin only)
   - **DELETE** `/api/auth/user/permanent/:id`
   - **Output**: `{"message": "User permanently deleted successfully"}`

9. **Assign Role to User** (Admin only)
   - **POST** `/api/auth/user/:id/assign-role`
   - **Input**: `{ role }`
   - **Output**: `{"message": "Role assigned successfully"}`

10. **Revoke Role from User** (Admin only)
    - **POST** `/api/auth/user/:id/revoke-role`
    - **Output**: `{"message": "Role revoked successfully"}`

### Audit Log Routes
1. **Get All Audit Logs** (Admin only)
   - **GET** `/audit-logs`
   - **Output**: `{ auditLogs: [ { action, performedBy, targetResource } ] }`

## Audit Log
This project includes a logging mechanism to track user actions, including project and user management actions.

---

**Note**: Ensure that you have appropriate access control using the provided `isAdmin` and `isManager` middleware functions for protected routes.


