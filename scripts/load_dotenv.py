import os
import sys

def load_env(env_path=None):
    """
    Loads environment variables from a .env file into os.environ.
    If env_path is not provided, defaults to '../.env' relative to this script.
    """
    if env_path is None:
        # Default to ../.env relative to this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(script_dir, '..', '.env')

    # Normalize path
    env_path = os.path.abspath(env_path)

    if not os.path.exists(env_path):
        print(f"Warning: .env file not found at {env_path}", file=sys.stderr)
        return

    print(f"Loading environment variables from {env_path}", file=sys.stderr)

    count = 0
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                # Skip comments and empty lines
                if not line or line.startswith('#'):
                    continue

                if '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()

                    # Remove surrounding quotes if they exist
                    if len(value) >= 2 and (
                        (value.startswith('"') and value.endswith('"')) or 
                        (value.startswith("'") and value.endswith("'"))
                    ):
                        value = value[1:-1]

                    os.environ[key] = value
                    count += 1
        
        print(f"success: added {count} of keys", file=sys.stderr)
    except Exception as e:
        print(f"Error loading .env file: {e}", file=sys.stderr)

if __name__ == "__main__":
    # Take path from CLI arguments if provided, else default
    path = sys.argv[1] if len(sys.argv) > 1 else None
    load_env(path)
