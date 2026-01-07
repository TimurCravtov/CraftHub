import subprocess

def main():

    # run the load_dotenv.py script to load environment variables
    subprocess.run(["python", "scripts/load_dotenv.py"], check=True)
    # then run both backend and frontend

if __name__ == "__main__":
    main()