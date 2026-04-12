$ErrorActionPreference = "Stop"

$k8sDir = ".\k8s"
if (!(Test-Path $k8sDir)) {
    New-Item -ItemType Directory -Path $k8sDir | Out-Null
}

$jwtSecret = "my_super_secret_key"

$services = @(
    @{
        Key = "auth"
        Name = "auth-service"
        Port = 5001
        Image = "myheart-auth-service:latest"
        ConfigName = "auth-config"
        SecretName = "auth-secret"
        ProbeType = "http"
        ProbePath = "/auth/test"
        Config = @{
            PORT = "5001"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_auth"
        }
    },
    @{
        Key = "patient"
        Name = "patient-service"
        Port = 5002
        Image = "myheart-patient-service:latest"
        ConfigName = "patient-config"
        SecretName = "patient-secret"
        ProbeType = "http"
        ProbePath = "/patients/test"
        Config = @{
            PORT = "5002"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_patient"
        }
    },
    @{
        Key = "doctor"
        Name = "doctor-service"
        Port = 5003
        Image = "myheart-doctor-service:latest"
        ConfigName = "doctor-config"
        SecretName = "doctor-secret"
        ProbeType = "http"
        ProbePath = "/doctors"
        Config = @{
            PORT = "5003"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_doctor"
        }
    },
    @{
        Key = "appointment"
        Name = "appointment-service"
        Port = 5004
        Image = "myheart-appointment-service:latest"
        ConfigName = "appointment-config"
        SecretName = "appointment-secret"
        ProbeType = "tcp"
        ProbePath = ""
        Config = @{
            PORT = "5004"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_appointment"
            PATIENT_SERVICE_URL = "http://patient-service:5002"
            DOCTOR_SERVICE_URL = "http://doctor-service:5003"
            CONSULTATION_SERVICE_URL = "http://consultation-records-service:5005"
            BILLING_SERVICE_URL = "http://billing-service:5007"
            CATALOG_SERVICE_URL = "http://catalog-service:5008"
        }
    },
    @{
        Key = "consultation"
        Name = "consultation-records-service"
        Port = 5005
        Image = "myheart-consultation-records-service:latest"
        ConfigName = "consultation-config"
        SecretName = "consultation-secret"
        ProbeType = "tcp"
        ProbePath = ""
        Config = @{
            PORT = "5005"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_medical"
        }
    },
    @{
        Key = "lab"
        Name = "lab-service"
        Port = 5006
        Image = "myheart-lab-service:latest"
        ConfigName = "lab-config"
        SecretName = "lab-secret"
        ProbeType = "tcp"
        ProbePath = ""
        Config = @{
            PORT = "5006"
            MONGO_URI = "mongodb://host.docker.internal:27017/myheart_lab"
            CATALOG_SERVICE_URL = "http://catalog-service:5008"
        }
    },
    @{
        Key = "billing"
        Name = "billing-service"
        Port = 5007
        Image = "myheart-billing-service:latest"
        ConfigName = "billing-config"
        SecretName = "billing-secret"
        ProbeType = "tcp"
        ProbePath = ""
        Config = @{
            PORT = "5007"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_billing"
            CATALOG_SERVICE_URL = "http://catalog-service:5008"
        }
    },
    @{
        Key = "catalog"
        Name = "catalog-service"
        Port = 5008
        Image = "myheart-catalog-service:latest"
        ConfigName = "catalog-config"
        SecretName = "catalog-secret"
        ProbeType = "http"
        ProbePath = "/services/health/check"
        Config = @{
            PORT = "5008"
            DATABASE_URL = "mysql://root:Red24Red@host.docker.internal:3306/myheart_catalog"
        }
    },
    @{
        Key = "gateway"
        Name = "api-gateway"
        Port = 5000
        Image = "myheart-api-gateway:latest"
        ConfigName = "gateway-config"
        SecretName = $null
        ProbeType = "http"
        ProbePath = "/"
        Config = @{
            PORT = "5000"
            AUTH_SERVICE_URL = "http://auth-service:5001"
            PATIENT_SERVICE_URL = "http://patient-service:5002"
            DOCTOR_SERVICE_URL = "http://doctor-service:5003"
            APPOINTMENT_SERVICE_URL = "http://appointment-service:5004"
            CONSULTATION_SERVICE_URL = "http://consultation-records-service:5005"
            BILLING_SERVICE_URL = "http://billing-service:5007"
            LAB_SERVICE_URL = "http://lab-service:5006"
            CATALOG_SERVICE_URL = "http://catalog-service:5008"
        }
    }
)

function New-ConfigMapYaml {
    param($svc)

    $lines = @(
        "apiVersion: v1"
        "kind: ConfigMap"
        "metadata:"
        "  name: $($svc.ConfigName)"
        "data:"
    )

    foreach ($key in $svc.Config.Keys) {
        $lines += "  ${key}: `"$($svc.Config[$key])`""
    }

    return ($lines -join "`n") + "`n"
}

function New-SecretYaml {
    param($svc)

    if (-not $svc.SecretName) { return $null }

    $lines = @(
        "apiVersion: v1"
        "kind: Secret"
        "metadata:"
        "  name: $($svc.SecretName)"
        "type: Opaque"
        "stringData:"
        "  JWT_SECRET: `"$jwtSecret`""
    )

    return ($lines -join "`n") + "`n"
}

function New-DeploymentYaml {
    param($svc)

    $lines = @(
        "apiVersion: apps/v1"
        "kind: Deployment"
        "metadata:"
        "  name: $($svc.Name)"
        "spec:"
        "  replicas: 1"
        "  selector:"
        "    matchLabels:"
        "      app: $($svc.Name)"
        "  template:"
        "    metadata:"
        "      labels:"
        "        app: $($svc.Name)"
        "    spec:"
        "      containers:"
        "        - name: $($svc.Name)"
        "          image: $($svc.Image)"
        "          imagePullPolicy: Never"
        "          ports:"
        "            - containerPort: $($svc.Port)"
        "          envFrom:"
        "            - configMapRef:"
        "                name: $($svc.ConfigName)"
    )

    if ($svc.SecretName) {
        $lines += "          env:"
        $lines += "            - name: JWT_SECRET"
        $lines += "              valueFrom:"
        $lines += "                secretKeyRef:"
        $lines += "                  name: $($svc.SecretName)"
        $lines += "                  key: JWT_SECRET"
    }

    if ($svc.ProbeType -eq "http") {
        $lines += "          readinessProbe:"
        $lines += "            httpGet:"
        $lines += "              path: $($svc.ProbePath)"
        $lines += "              port: $($svc.Port)"
        $lines += "            initialDelaySeconds: 10"
        $lines += "            periodSeconds: 5"
        $lines += "          livenessProbe:"
        $lines += "            httpGet:"
        $lines += "              path: $($svc.ProbePath)"
        $lines += "              port: $($svc.Port)"
        $lines += "            initialDelaySeconds: 15"
        $lines += "            periodSeconds: 10"
    } else {
        $lines += "          readinessProbe:"
        $lines += "            tcpSocket:"
        $lines += "              port: $($svc.Port)"
        $lines += "            initialDelaySeconds: 10"
        $lines += "            periodSeconds: 5"
        $lines += "          livenessProbe:"
        $lines += "            tcpSocket:"
        $lines += "              port: $($svc.Port)"
        $lines += "            initialDelaySeconds: 15"
        $lines += "            periodSeconds: 10"
    }

    return ($lines -join "`n") + "`n"
}

function New-ServiceYaml {
    param($svc)

    $lines = @(
        "apiVersion: v1"
        "kind: Service"
        "metadata:"
        "  name: $($svc.Name)"
        "spec:"
        "  selector:"
        "    app: $($svc.Name)"
        "  ports:"
        "    - protocol: TCP"
        "      port: $($svc.Port)"
        "      targetPort: $($svc.Port)"
        "  type: NodePort"
    )

    return ($lines -join "`n") + "`n"
}

foreach ($svc in $services) {
    $key = $svc.Key

    Set-Content -Path (Join-Path $k8sDir "$key-configmap.yaml") -Value (New-ConfigMapYaml $svc) -Encoding UTF8
    Set-Content -Path (Join-Path $k8sDir "$key-deployment.yaml") -Value (New-DeploymentYaml $svc) -Encoding UTF8
    Set-Content -Path (Join-Path $k8sDir "$key-service.yaml") -Value (New-ServiceYaml $svc) -Encoding UTF8

    $secretYaml = New-SecretYaml $svc
    if ($secretYaml) {
        Set-Content -Path (Join-Path $k8sDir "$key-secret.yaml") -Value $secretYaml -Encoding UTF8
    }
}

Write-Host "Kubernetes YAML files generated in $k8sDir"