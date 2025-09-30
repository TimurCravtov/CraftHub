"""
populate_db.py

Simple script to populate the application's database by calling the
REST API endpoints exposed by the server.

Behaviour:
- Reads `BASE_URL` (default: http://localhost:8080) from environment
- Creates sample users via `/api/auth/signup`
- Signs in users via `/api/auth/signin` to obtain JWT pair
- Calls `/api/users/findall` and `/api/users/me` to verify

Requirements: `requests` (install with `pip install requests`)

Usage example:
    set BASE_URL=http://localhost:8080
    python populate_db.py
"""
from __future__ import annotations

import os
import sys
import time
from typing import Dict, Any, Optional

import requests


BASE_URL = os.environ.get("BASE_URL", "http://localhost:8080")


def signup(user: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{BASE_URL}/api/auth/signup"
    r = requests.post(url, json=user)
    r.raise_for_status()
    return r.json()


def signin(creds: Dict[str, str]) -> Dict[str, str]:
    url = f"{BASE_URL}/api/auth/signin"
    r = requests.post(url, json=creds)
    r.raise_for_status()
    return r.json()


def get_me(access_token: str) -> Dict[str, Any]:
    url = f"{BASE_URL}/api/users/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json()


def get_all_users(access_token: Optional[str] = None) -> Any:
    url = f"{BASE_URL}/api/users/findall"
    headers = {}
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json()


def main():
    print(f"Using BASE_URL={BASE_URL}")

    # Sample users to create. AccountType must match server enum: BUYER or SELLER
    users = [
        {"name": "Alice Buyer", "email": "alice@example.com", "password": "Passw0rd!", "accountType": "BUYER"},
        {"name": "Bob Seller", "email": "bob@example.com", "password": "Passw0rd!", "accountType": "SELLER"},
    ]

    tokens: Dict[str, Dict[str, str]] = {}

    for u in users:
        print(f"Signing up {u['email']}")
        try:
            resp = signup(u)
        except requests.HTTPError as e:
            print(f"  Signup failed: {e} - {getattr(e.response, 'text', '')}")
            # If user already exists, try to sign in anyway
        else:
            print(f"  Signup response keys: {list(resp.keys())}")

        creds = {"email": u["email"], "password": u["password"]}
        print(f"Signing in {u['email']}")
        try:
            tokens[u["email"]] = signin(creds)
        except requests.HTTPError as e:
            print(f"  Signin failed: {e} - {getattr(e.response, 'text', '')}")
            continue

        # Short wait to allow server to persist
        time.sleep(0.2)

        access = tokens[u["email"]]["accessToken"]
        me = get_me(access)
        print(f"  /me -> id={me.get('id')} name={me.get('name')}")

    print("Fetching all users (using Authorization header if available)")
    try:
        first_token = None
        if tokens:
            # pick the first available access token
            first_email = next(iter(tokens))
            first_token = tokens[first_email]["accessToken"]

        all_users = get_all_users(first_token)
        print(f"  Found {len(all_users)} users")
    except Exception as e:
        print(f"  Error fetching users: {e}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
