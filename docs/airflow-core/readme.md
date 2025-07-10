# Airflow + Auth0 + Admin via Helm

### 1. This configures Auth0 OAuth and assigns an Admin role to email:
> Note: Credentials are for educational purposes only.
> 
[webserver_config.py](webserver_config.py)
```python
from flask_appbuilder.security.manager import AUTH_OAUTH
from airflow.www.security import AirflowSecurityManager

AUTH_TYPE = AUTH_OAUTH
AUTH_ROLE_ADMIN = 'Admin'
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Viewer"

OAUTH_PROVIDERS = [
    {
        'name': 'auth0',
        'token_key': 'access_token',
        'icon': 'fa-circle',
        'remote_app': {
            'client_id': 'wUzgSsPGxVXW2g9rDKG9UUmYRRh7Oo6P',
            'client_secret': 'KR0PC4KVrDjFMxf9gX9PePJ6nbWTvmB79bsC3esCoS8rwZHntMTYqPlvzPV4NICO',
            'client_kwargs': {'scope': 'openid profile email'},
            'server_metadata_url': 'https://dev-f5ge1-8v.us.auth0.com/.well-known/openid-configuration',
        }
    }
]

class CustomSecurityManager(AirflowSecurityManager):
    def auth_user_oauth(self, userinfo):
        import logging
        logging.warning(f"[Auth0] userinfo: {userinfo}")

        email = userinfo.get("email")
        if not email:
            logging.error("Missing 'email' in Auth0 response")
            return None

        username = userinfo.get("username")
        role_name = "Admin" if email == "kalpak44@ya.ru" else AUTH_USER_REGISTRATION_ROLE

        # Check if user already exists
        user = self.find_user(username=username)
        if user:
            logging.warning(f"[Auth0] Found existing user: {user}")
            return user

        first_name = userinfo.get("first_name")
        last_name = userinfo.get("last_name")
        
        # Otherwise create the user
        logging.warning(f"[Auth0] Creating new user with role: {role_name}")
        role = self.find_role(role_name)
        user = self.add_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
        )
        return user

SECURITY_MANAGER_CLASS = CustomSecurityManager

```
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

````yaml
webserver:
  enabled: true

  defaultUser:
    enabled: false  # Disable basic login, use Auth0

  extraVolumeMounts:
    - name: webserver-config
      mountPath: /opt/airflow/webserver_config.py
      subPath: webserver_config.py

  extraVolumes:
    - name: webserver-config
      configMap:
        name: airflow-webserver-config

executor: CeleryExecutor

config:
  webserver:
    security_manager_class: webserver_config.CustomSecurityManager

  api:
    auth_backends: "airflow.api.auth.backend.basic_auth,airflow.api.auth.backend.default"

  core:
    executor: CeleryExecutor

  smtp:
    smtp_host: ""
    smtp_starttls: "True"
    smtp_ssl: "False"
    smtp_user: ""
    smtp_port: 25
    smtp_password: ""
    smtp_mail_from: "airflow@example.com"

dags:
  gitSync:
    enabled: false

ingress:
  enabled: false  # Using kubectl port-forward

redis:
  enabled: true

postgresql:
  enabled: true

flower:
  enabled: false

statsd:
  enabled: true

triggerer:
  enabled: true

scheduler:
  enabled: true

createUserJob:
  useHelmHooks: true
  applyCustomEnv: false

migrateDatabaseJob:
  enabled: true
  useHelmHooks: true

airflowVersion: "2.9.1"

images:
  airflow:
    repository: apache/airflow
    tag: 2.9.1
    pullPolicy: IfNotPresent
````


### Other:

Upgrade if already installed:

```shell
helm upgrade airflow apache-airflow/airflow -n airflow -f values.yaml
```
Destroy:

```shell
helm uninstall airflow apache-airflow/airflow -n airflow
```


Access Airflow UI:

```shell
kubectl port-forward svc/airflow-webserver 8080:8080 -n airflow
```

Open your browser:

👉 http://localhost:8080





