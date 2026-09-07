# Script to configure k3s on Rancher Desktop to allow insecure local registry
# This script updates the k3s registries.yaml configuration to allow HTTP access
# to the local Docker registry running on the host

# Step 1: Access the Rancher Desktop / WSL2 environment
# Run this in PowerShell on Windows:
# wsl -d rancher-desktop

# Step 2: Once in the WSL2 environment, run:
# sudo mkdir -p /etc/rancher/k3s

# Step 3: Create the registries.yaml file with insecure registry configuration
# sudo bash -c 'cat > /etc/rancher/k3s/registries.yaml <<EOF
# mirrors:
#   "172.17.0.1:5000":
#     endpoint:
#       - "http://172.17.0.1:5000"
# 
# configs:
#   "172.17.0.1:5000":
#     tls:
#       insecure_skip_verify: true
# EOF
#'

# Step 4: Restart k3s to apply the configuration
# You may need to restart Rancher Desktop or the k3s service

# Alternative approach: Use local image loading
# Instead of using a registry, export images and load them into k3s

echo "To enable the local registry for k3s on Rancher Desktop:"
echo ""
echo "1. Run: wsl -d rancher-desktop"
echo "2. Run: sudo mkdir -p /etc/rancher/k3s"
echo "3. Create /etc/rancher/k3s/registries.yaml with insecure registry config"
echo "4. Restart k3s or Rancher Desktop"
echo ""
echo "See the full configuration in this script."
