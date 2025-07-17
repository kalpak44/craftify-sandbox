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

## 2. Install Kafka (Non‑HA)

```shell
helm install kafka bitnami/kafka \
 --set controller.replicaCount=1 \
 --set externalAccess.enabled=true \
 --set externalAccess.controller.service.type=NodePort \
 --set externalAccess.controller.service.ports.external=9094 \
 --set externalAccess.autoDiscovery.enabled=true \
 --set serviceAccount.create=true \
 --set rbac.create=true \
 --set listeners.client.protocol=PLAINTEXT \
 --set listeners.controller.protocol=PLAINTEXT \
 --set controller.automountServiceAccountToken=true \
 --set broker.automountServiceAccountToken=true \
 --set topic.autoCreate=true \
 --version 27.1.2 -n kafka --create-namespace
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