# Aviz Academy – To-Do List App
### *Learn by Doing, Not Just Watching*

A simple, modern To-Do List web application deployed automatically to AWS EC2 using **GitHub → AWS CodePipeline → AWS CodeDeploy → Nginx**.

---

## Project Overview

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Web Server | Nginx (on Amazon Linux 2023) |
| CI/CD Source | GitHub (main branch) |
| Pipeline | AWS CodePipeline |
| Deployment | AWS CodeDeploy (in-place) |
| Compute | AWS EC2 (Amazon Linux 2023) |

---

## Folder Structure

```
aws-cicd-to-ec2/
├── index.html                  # Main app page
├── style.css                   # Styles
├── app.js                      # App logic (vanilla JS)
├── appspec.yml                 # CodeDeploy deployment spec
└── scripts/
    ├── install_dependencies.sh # BeforeInstall  – install/enable Nginx
    ├── stop_server.sh          # ApplicationStop – graceful Nginx stop
    └── start_server.sh         # ApplicationStart – permissions + start Nginx
```

---

## Step-by-Step AWS Setup

### Step 1 – Launch and Configure the EC2 Instance

1. Go to **EC2 → Launch Instance**.
2. Choose **Amazon Linux 2023 AMI** (64-bit x86).
3. Select an instance type (e.g., `t2.micro` for free tier).
4. Under **Key pair**, create or select an existing key pair.
5. Under **Network settings → Security Group**, add an inbound rule:
   - **Type:** HTTP | **Port:** 80 | **Source:** 0.0.0.0/0
6. Under **Advanced details → IAM instance profile**, attach an IAM role that has the following policies:
   - `AmazonEC2RoleforAWSCodeDeploy` (allows CodeDeploy agent to communicate)
   - `AmazonSSMManagedInstanceCore` (allows SSM Session Manager access)

   > **Create the IAM Role first** (if it doesn't exist):
   > - IAM → Roles → Create role → EC2 → attach both policies above → name it e.g. `EC2-CodeDeploy-SSM-Role`.

7. Launch the instance.

#### Install the CodeDeploy Agent (via SSM or SSH)

Connect to the instance and run:

```bash
sudo dnf install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo systemctl start codedeploy-agent
sudo systemctl enable codedeploy-agent
sudo systemctl status codedeploy-agent
```

> Replace `us-east-1` with your AWS region if different.

---

### Step 2 – Create the GitHub Repository

1. Create a new **public** GitHub repository (e.g., `aws-cicd-to-ec2`).
2. Clone it locally and copy all project files into it:

```
aws-cicd-to-ec2/
├── index.html
├── style.css
├── app.js
├── appspec.yml
└── scripts/
    ├── install_dependencies.sh
    ├── stop_server.sh
    └── start_server.sh
```

3. Commit and push to the `main` branch:

```bash
git add .
git commit -m "Initial commit: To-Do App v1.0"
git push origin main
```

---

### Step 3 – Create a CodeDeploy Application and Deployment Group

#### 3a. Create CodeDeploy Application

1. Go to **CodeDeploy → Applications → Create application**.
2. **Application name:** `todo-app`
3. **Compute platform:** `EC2/On-premises`
4. Click **Create application**.

#### 3b. Create Deployment Group

1. Inside the `todo-app` application, click **Create deployment group**.
2. Fill in:
   - **Deployment group name:** `todo-app-dg`
   - **Service role:** Create (or select) a role with the `AWSCodeDeployRole` policy attached.
     - IAM → Roles → Create role → **CodeDeploy** (use case) → attach `AWSCodeDeployRole` → name it e.g. `CodeDeploy-ServiceRole`.
   - **Deployment type:** `In-place`
   - **Environment configuration:** `Amazon EC2 instances`
     - **Tag Key:** `Name` | **Tag Value:** *(the Name tag of your EC2 instance)*
   - **Deployment settings:** `CodeDeployDefault.AllAtOnce`
   - **Load balancer:** Uncheck (disable) for simple single-instance setup
3. Click **Create deployment group**.

---

### Step 4 – Create the CodePipeline

1. Go to **CodePipeline → Pipelines → Create pipeline**.
2. **Pipeline name:** `todo-app-pipeline`
3. **Service role:** Let AWS create a new role, or use an existing one.
4. Click **Next**.

#### Source Stage

- **Source provider:** GitHub (Version 2)
- Click **Connect to GitHub** and authorize AWS.
- **Repository:** select your GitHub repo
- **Branch:** `main`
- **Output artifact format:** `CodePipeline default`
- Click **Next**.

#### Build Stage

- Click **Skip build stage** (no build step needed for a static app).

#### Deploy Stage

- **Deploy provider:** `AWS CodeDeploy`
- **Region:** *(your region)*
- **Application name:** `todo-app`
- **Deployment group:** `todo-app-dg`
- Click **Next → Create pipeline**.

The pipeline will immediately run its first deployment.

---

## How to Trigger a Deployment

Simply push any change to the `main` branch:

```bash
git add .
git commit -m "Update: describe your change"
git push origin main
```

CodePipeline detects the push within ~1 minute and automatically:
1. Pulls the source from GitHub
2. Passes the artifact to CodeDeploy
3. CodeDeploy runs the lifecycle hooks on the EC2 instance
4. Nginx serves the updated app

---

## How to Verify the Deployment

1. Go to **EC2 → Instances** and copy the **Public IPv4 address** of your instance.
2. Open a browser and navigate to:

```
http://<EC2-PUBLIC-IP>
```

You should see the **Aviz Academy To-Do List** app.

> If the page does not load, check:
> - Security Group inbound rule for port 80
> - CodeDeploy deployment logs: `/var/log/aws/codedeploy-agent/`
> - Nginx status: `sudo systemctl status nginx`

---

## How to Simulate a v1 → v2 Update

1. Open `index.html` and change the footer version from `v1.0` to `v2.0`:

```html
<!-- Before -->
<span class="version">v1.0</span>

<!-- After -->
<span class="version">v2.0</span>
```

2. Optionally change something visible (e.g., the card title or a color in `style.css`).

3. Commit and push:

```bash
git add index.html
git commit -m "Release v2.0: update version and UI"
git push origin main
```

4. Watch the pipeline run in **CodePipeline → Pipelines → todo-app-pipeline**.
5. Refresh `http://<EC2-PUBLIC-IP>` – the footer now shows **v2.0**.

---

## EC2 Pre-requisites Summary

| Requirement | Details |
|---|---|
| AMI | Amazon Linux 2023 |
| SSM Agent | Must be installed and running (`amazon-ssm-agent`) |
| IAM Role | `AmazonEC2RoleforAWSCodeDeploy` + `AmazonSSMManagedInstanceCore` |
| Security Group | Inbound TCP port **80** open (0.0.0.0/0) |
| CodeDeploy Agent | Installed and running on the instance |

---

## Deployment Lifecycle Hooks

| Hook | Script | Purpose |
|---|---|---|
| `BeforeInstall` | `install_dependencies.sh` | Install & enable Nginx |
| `ApplicationStop` | `stop_server.sh` | Gracefully stop Nginx |
| `ApplicationStart` | `start_server.sh` | Set permissions, start/reload Nginx |

---

*Built with ❤️ by Aviz Academy – Learn by Doing, Not Just Watching*
