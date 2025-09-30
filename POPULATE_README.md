**Populate Script**

**Purpose:** Populate the server's database by calling REST endpoints (`/api/auth/signup`, `/api/auth/signin`, `/api/users/me`, `/api/users/findall`).

**Location:** `populate_db.py` at repository root.

**Requirements:** Python 3.8+, `requests` library (`pip install requests`).

**Environment:** Set `BASE_URL` if server is not at `http://localhost:8080`.

**Run:**

```powershell
set BASE_URL=http://localhost:8080
python populate_db.py
```

The script will try to sign up two sample users, sign them in, call `/me` for each, and list all users.
