Add and update the KEDA Helm repo
```shell
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
```

Install KEDA

```shell
helm install keda kedacore/keda \
  --namespace keda --create-namespace
```

Uninstall

If you want to remove KEDA from a cluster, you first need to remove any ScaledObjects and ScaledJobs that you have created. Once that is done, the Helm chart can be uninstalled:

```shell
kubectl delete $(kubectl get scaledobjects.keda.sh,scaledjobs.keda.sh -A \
  -o jsonpath='{"-n "}{.items[*].metadata.namespace}{" "}{.items[*].kind}{"/"}{.items[*].metadata.name}{"\n"}')
helm uninstall keda -n keda
```


### Hello world example:
```shell
kubectl apply -f kafka-producer-pod.yaml
```

in pod shell:

```shell
echo '{"type":"EVENT_A","payload":{"message":"Hello from kcat"}}' | \
kcat -P -b kafka.kafka.svc:9092 -t event-topic
```

or
```shell
echo '{"type":"EVENT_B","payload":{"action":"test B"}}' | \
kcat -P -b kafka.kafka.svc:9092 -t event-topic

```
