```shell
kubectl create namespace frappe


helm repo add frappe https://helm.erpnext.com/
helm repo update


helm search repo frappe/erpnext


helm show values frappe/erpnext > values.yaml


helm upgrade --install frappe-bench \
--namespace frappe \
-f values.yaml \
frappe/erpnext


helm uninstall frappe-bench -n frappe

```
