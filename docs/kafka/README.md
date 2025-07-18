# Apache Kafka Local Development Setup (Helm + Kubernetes)

> **Note:** This guide is **only** for spinning up a Kafka cluster locally for development and testing.  
> **For production**, use a managed Kafka service (e.g. Confluent Cloud, AWS MSK, or Azure Event Hubs).

---

## 1. Add Helm Repositories

```shell
# Bitnami Kafka chart
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

## 2. Install Kafka

```shell
kubectl create namespace kafka
helm install kafka bitnami/kafka --namespace kafka -f values.yaml
``` 


Uninstall

```shell
helm uninstall kafka -n kafka
```

## kafdrop UI

Deploy kafdrop with :
```shell
kubectl apply -f kafdrop.yaml -n kafka
```

Destroy:
```shell
kubectl delete -f kafdrop.yaml -n kafka
```

````shell
kubectl port-forward svc/kafdrop -n kafka 8081:9000
````