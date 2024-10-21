import subprocess
import time

def run_git_pull():
    while True:
        try:
            # Run the git pull command
            result = subprocess.run(['git', 'pull'], capture_output=True, text=True)
            
            # Print the output of the command
            print(result.stdout)
            if result.stderr:
                print("Error:", result.stderr)
            
            # Wait for 30 seconds before running the command again
            time.sleep(30)
        
        except KeyboardInterrupt:
            print("Script interrupted by user.")
            break

if __name__ == "__main__":
    run_git_pull()