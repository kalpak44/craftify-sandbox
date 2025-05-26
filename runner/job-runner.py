import os
import time

code = os.getenv("TASK_CODE", "print('Hello from job')")
print("👷 Начинаю выполнение задачи...\n")
time.sleep(1)

try:
    exec(code)
    print("\n✅ Выполнено успешно.")
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
