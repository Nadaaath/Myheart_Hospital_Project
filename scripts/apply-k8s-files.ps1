$ErrorActionPreference = "Stop"

function Apply-IfExists {
    param([string]$Path)

    if (Test-Path $Path) {
        Write-Host "Applying $Path"
        kubectl apply -f $Path
    } else {
        Write-Host "Skipping missing file: $Path"
    }
}

$baseOrder = @(
    "auth",
    "patient",
    "doctor",
    "catalog",
    "billing",
    "consultation",
    "lab",
    "appointment",
    "gateway"
)

foreach ($name in $baseOrder) {
    Apply-IfExists ".\k8s\$name-configmap.yaml"
    Apply-IfExists ".\k8s\$name-secret.yaml"
    Apply-IfExists ".\k8s\$name-deployment.yaml"
    Apply-IfExists ".\k8s\$name-service.yaml"
}

Write-Host ""
Write-Host "Current cluster state:"
kubectl get pods
kubectl get services