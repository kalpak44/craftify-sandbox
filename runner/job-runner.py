import os
import time

code = os.getenv("TASK_CODE", "print('Hello from job')")
time.sleep(1)

try:
    exec(code)
    print("\n✅ Executed successfully.")
except Exception as e:
    print(f"\n❌ Error: {e}")
