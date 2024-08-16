### Prerequisites

1. **Virtual Machine Setup**: Ensure your VM is running a supported Linux distribution (e.g., Ubuntu 20.04).
2. **K3s Installation**: Install K3s on the VM.
3. **Ingress Controller**: Set up an ingress controller to manage incoming HTTP/HTTPS requests.
4. **Cert-Manager**: Install Cert-Manager to automate the management of SSL certificates.
5. **DNS Configuration**: Ensure your domain (e.g., `craftyfy.pro`) is properly configured to point to the IP address of your VM.
6. **Kubernetes Manifests**: Create Kubernetes manifests (YAML files) to deploy your backend and frontend applications.
7. **Redirects and SSL**: Configure HTTP to HTTPS redirects and root path (`/`) redirection.

### Detailed Steps

#### 1. Install K3s

Install K3s by running the following commands on your VM:

```bash
curl -sfL https://get.k3s.io | sh -
```

This command installs K3s and sets it up to run as a service.

#### 2. Set Up Ingress Controller

K3s comes with Traefik as a default ingress controller, which can handle HTTP/HTTPS traffic. 
Let's install another ingress controller - NGINX. To do that run this command:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

#### 3. Install Cert-Manager

Cert-Manager will automatically manage SSL certificates for your domains.

Install Cert-Manager with the following command:

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.11.0/cert-manager.yaml
```

Then, create a ClusterIssuer to use Let's Encrypt:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com # Replace with your email
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
    - http01:
        ingress:
          class: nginx

```

Apply this with:

```bash
kubectl apply -f cluster-issuer.yaml
```

#### 4. Connect from the remote clients
The kubeconfig file contains the configuration needed to connect to your Kubernetes cluster. 
You need to transfer this file to the machine from which you want to connect to the cluster

- Copy the kubeconfig file from the K3s server to your local machine:

On the K3s server, the kubeconfig file is typically located at `/etc/rancher/k3s/k3s.yaml`. You can copy it to your local machine using scp:

```bash
scp user@your-k3s-server:/etc/rancher/k3s/k3s.yaml ~/.kube/config
```

- Update the kubeconfig file to point to the external IP of your K3s server:
- Open the `~/.kube/config` file in your text editor and modify the server field to use the external IP:


```yaml
clusters:
- cluster:
  server: https://<your_external_ip>:6443
```

### 5. Apply Deployment Manifests

Apply each of the manifests:

```bash
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
```

### 6. Configure DNS

Ensure `api.craftyfy.pro` and `app.craftyfy.pro` point to your VM's IP in your domain registrar's DNS settings.

### 7. Verify and Test

- **DNS Propagation**: Verify the DNS settings have propagated by pinging `api.craftyfy.pro` and `app.craftyfy.pro`.
- **SSL**: Access your domains over HTTPS (`https://api.craftyfy.pro` and `https://app.craftyfy.pro`) and verify that the SSL certificates are active.
- **Redirects**: Check that navigating to `http://api.craftyfy.pro` or `http://app.craftyfy.pro` redirects to HTTPS, and that navigating to `http://craftyfy.pro` redirects to `https://app.craftyfy.pro`.
