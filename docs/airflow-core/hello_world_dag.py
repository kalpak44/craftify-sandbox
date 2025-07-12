from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.empty import EmptyOperator
import requests
import time
from airflow.operators.python import get_current_context

def fetch_initial():
    response = requests.get("https://kalpak44.free.beeceptor.com")
    print(f"Status Code: {response.status_code}")
    print(f"Response Body:\n{response.text}")

    # Push body to XCom
    context = get_current_context()
    context['ti'].xcom_push(key='response_body', value=response.text)

def wait_and_branch():
    print("Waiting 60 seconds...")
    time.sleep(60)

    now = datetime.now()
    minute = now.minute
    print(f"Current minute: {minute}")

    if minute % 2 == 1:
        print("Minute is odd → will print word.")
        return 'print_word_only'
    else:
        print("Minute is even → will request with word.")
        return 'send_query_with_first_word'

def print_word():
    context = get_current_context()
    body = context['ti'].xcom_pull(key='response_body', task_ids='fetch_initial')
    if not body:
        print("No response body.")
        return
    first_word = body.strip().split()[0]
    print(f"First word (odd minute path): {first_word}")

def send_query():
    context = get_current_context()
    body = context['ti'].xcom_pull(key='response_body', task_ids='fetch_initial')
    if not body:
        print("No response body.")
        return
    first_word = body.strip().split()[0]
    print(f"Using word for query: {first_word}")
    url = f"https://kalpak44.free.beeceptor.com?word={first_word}"
    response = requests.get(url)
    print(f"Second request response:\n{response.text}")

with DAG(
    dag_id="conditional_api_chain_dag",
    description="DAG that conditionally branches after waiting 1 min",
    start_date=datetime(2025, 1, 1),
    schedule_interval="@daily",
    catchup=False,
    tags=["api", "conditional", "branching"],
) as dag:

    fetch_task = PythonOperator(
        task_id="fetch_initial",
        python_callable=fetch_initial,
    )

    wait_branch_task = BranchPythonOperator(
        task_id="wait_and_check_minute",
        python_callable=wait_and_branch,
    )

    print_task = PythonOperator(
        task_id="print_word_only",
        python_callable=print_word,
    )

    request_task = PythonOperator(
        task_id="send_query_with_first_word",
        python_callable=send_query,
    )

    end = EmptyOperator(task_id="end")

    # DAG structure
    fetch_task >> wait_branch_task
    wait_branch_task >> [print_task, request_task]
    [print_task, request_task] >> end
