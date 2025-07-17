# Airflow + Auth0 + Admin via Helm

### 1. This configures Auth0 OAuth and assigns an Admin role to email:
> Note: Credentials are for educational purposes only.
> 
[webserver_config.py](webserver_config.py)

### 2. Create the ConfigMap

```shell
kubectl create namespace airflow
kubectl create configmap airflow-webserver-config --from-file=webserver_config.py -n airflow
```

### 3. This is the full Helm values file to use:

Install for the first time:

```shell
helm repo add apache-airflow https://airflow.apache.org
helm repo update
helm install airflow apache-airflow/airflow -n airflow --create-namespace -f values.yaml
```

[values.yaml](values.yaml):

### Other:

Upgrade if already installed:

```shell
helm upgrade airflow apache-airflow/airflow -n airflow -f values.yaml
```
Destroy:

```shell
helm uninstall airflow apache-airflow/airflow -n airflow
```

Hello world DAG:
```shell
kubectl cp hello_world_dag.py $(kubectl get pod -n airflow -l component=webserver -o jsonpath="{.items[0].metadata.name}"):/opt/airflow/dags/ -n airflow
kubectl cp hello_world_dag.py $(kubectl get pod -n airflow -l component=worker -o jsonpath="{.items[0].metadata.name}"):/opt/airflow/dags/ -n airflow
kubectl cp hello_world_dag.py $(kubectl get pod -n airflow -l component=scheduler -o jsonpath="{.items[0].metadata.name}"):/opt/airflow/dags/ -n airflow
```

Access Airflow UI:

```shell
kubectl port-forward svc/airflow-webserver 8080:8080 -n airflow
```

Open your browser:

👉 http://localhost:8080





