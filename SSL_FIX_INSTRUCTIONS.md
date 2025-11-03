# SSL Certificate Fix for Login Issue

## The Problem

Your frontend (`https://localhost:5173`) uses trusted mkcert certificates, but your backend (`https://localhost:8443`) uses a self-signed certificate that browsers don't trust. This causes "Failed to fetch" errors.

## Quick Fix (Temporary - per browser session)

1. **Open a new browser tab** and navigate to: `https://localhost:8443`
2. You'll see a security warning (NET::ERR_CERT_AUTHORITY_INVALID or similar)
3. Click **"Advanced"** and then **"Proceed to localhost:8443 (unsafe)"**
4. You should see a Whitelabel Error page or JSON response - that's fine!
5. **Now go back to your login page** at `https://localhost:5173/signup` and try logging in again
6. ✅ Login should now work!

**Note:** You need to do this once per browser session (or when certificates change).

---

## Permanent Fix (Recommended)

### Option 1: Use mkcert for Backend (Easiest)

Since your frontend already uses mkcert certificates, make the backend use them too:

1. **Copy the mkcert certificates to server resources:**

   ```powershell
   cd "c:\Users\Admin\Desktop\Autumn Internship Year 3\handmadeshopapp"
   Copy-Item client\localhost+2.pem server\src\main\resources\localhost+2.pem
   Copy-Item client\localhost+2-key.pem server\src\main\resources\localhost+2-key.pem
   ```

2. **Install OpenSSL** (if not already installed):

   - Download from: https://slproweb.com/products/Win32OpenSSL.html
   - Or use Git Bash which includes OpenSSL

3. **Convert PEM to PKCS12 format:**

   ```bash
   cd "c:/Users/Admin/Desktop/Autumn Internship Year 3/handmadeshopapp/server/src/main/resources"
   openssl pkcs12 -export -in localhost+2.pem -inkey localhost+2-key.pem -out keystore-mkcert.p12 -name localhost -passout pass:changeit
   ```

4. **Update `server/src/main/resources/application.properties`:**

   ```properties
   server.ssl.key-store=classpath:keystore-mkcert.p12
   server.ssl.key-store-password=changeit
   server.ssl.key-alias=localhost
   ```

5. **Restart your Spring Boot backend**

### Option 2: Disable SSL for Development (Not Recommended for Production)

If you just want to get it working quickly for development:

1. **Update backend to use HTTP (port 8080):**
   In `server/src/main/resources/application.properties`:

   ```properties
   server.port=8080
   server.ssl.enabled=false
   # Comment out all SSL configuration
   ```

2. **Update frontend API URL:**
   In `client/.env`:

   ```properties
   REACT_APP_API_URL=http://localhost:8080
   ```

3. **Update `client/src/context/apiAuthContext.jsx`:**

   ```javascript
   baseURL: "http://localhost:8080/",
   ```

4. **Restart both frontend and backend**

---

## Why This Happens

- **mkcert** creates locally-trusted certificates that browsers automatically trust
- **Self-signed certificates** (like your current `keystore.p12`) are not trusted by browsers by default
- When making HTTPS requests from the browser, it requires a trusted certificate chain
- Postman works because it has an option to "disable SSL certificate verification"

---

## Testing After Fix

After applying any fix:

1. Clear browser cache and cookies for `localhost`
2. Restart both frontend and backend servers
3. Try logging in at `https://localhost:5173/signup`
4. Check browser console (F12) for any errors
5. Login should work! ✅

---

## Additional Notes

- The mkcert certificates (`localhost+2.pem` and `localhost+2-key.pem`) in your client folder are already trusted by your system
- Using the same certificates for both frontend and backend ensures consistency
- For production, you'll want to use proper SSL certificates from a Certificate Authority (CA)
