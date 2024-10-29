import subprocess
import time
import logging
import sys

def run_git_pull(interval=300):
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    while True:
        try:
            # Run the git pull command
            result = subprocess.run(['git', 'pull'], capture_output=True, text=True, check=True)
            
            # Log the output of the command
            if result.stdout.strip():
                logging.info(f"Git pull result: {result.stdout.strip()}")
            
            # Wait for the specified interval before running the command again
            time.sleep(interval)
        
        except subprocess.CalledProcessError as e:
            logging.error(f"Git pull failed: {e.stderr.strip()}")
        except KeyboardInterrupt:
            logging.info("Script interrupted by user.")
            break
        except Exception as e:
            logging.error(f"An unexpected error occurred: {str(e)}")
            time.sleep(60)  # Wait a bit before retrying in case of unexpected errors

if __name__ == "__main__":
    interval = 300  # 5 minutes, adjust as needed
    run_git_pull(interval)
