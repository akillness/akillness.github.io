---
title: Setting Jupyter Kernel according to venv of python
description: Python, venv, jupyter
categories:
- Development & Tools
tags:
- venv
- jupyter
- development-tools
- tools
date: 2024-06-29 00:10:00 +0800
mermaid: true
---
## Setting Jupyter Kernel with Python Virtual Environment

*Curiosity:* How can we use different Python virtual environments in Jupyter Notebook? What's the best way to manage multiple kernels?

**This guide** explains how to add a Python virtual environment as a Jupyter kernel, allowing you to use different Python environments in your notebooks.

### Step 1: Activate Virtual Environment

*Retrieve:* First, activate your Python virtual environment.

**Windows**:
```sh
activate.bat
```

**Linux/Mac**:
```sh
source activate
# or
source venv/bin/activate
```

### Step 2: Install Jupyter Notebook

*Retrieve:* Install Jupyter in your virtual environment.

```sh
pip install jupyter jupyter notebook
```

### Step 3: Install ipykernel

*Innovate:* Install ipykernel to enable kernel registration.

```sh
pip install ipykernel
```

**Purpose**: `ipykernel` allows you to register Python environments as Jupyter kernels.

### Step 4: Add Jupyter Kernel

*Retrieve:* Register your virtual environment as a Jupyter kernel.

```sh
python -m ipykernel install --user --name "virtual env name" --display-name "shown name of display"
```

**Parameters**:
- `--name`: Internal kernel name (used by Jupyter)
- `--display-name`: Name shown in Jupyter UI
- `--user`: Install for current user only

**Example**:
```sh
python -m ipykernel install --user --name "myenv" --display-name "Python (myenv)"
```

### Step 5: Uninstall Jupyter Kernel (Optional)

*Retrieve:* Remove a kernel if needed.

```sh
jupyter kernelspec uninstall .venv
```

**Note**: Replace `.venv` with your kernel name.

### Workflow Summary

*Innovate:* Complete workflow for managing Jupyter kernels.

```mermaid
graph LR
    A[Create venv] --> B[Activate venv]
    B --> C[Install Jupyter]
    C --> D[Install ipykernel]
    D --> E[Register Kernel]
    E --> F[Use in Jupyter]
    
    style A fill:#e1f5ff
    style E fill:#fff3cd
    style F fill:#d4edda
```

### Benefits

*Retrieve:* Why use virtual environments with Jupyter.

| Benefit | Description | Impact |
|:--------|:------------|:-------|
| **Isolation** | Separate dependencies | ⬆️ Clean environments |
| **Flexibility** | Multiple Python versions | ⬆️ Project-specific |
| **Reproducibility** | Consistent environments | ⬆️ Reliable results |
| **Organization** | Easy to manage | ⬆️ Better workflow |

### Key Takeaways

*Retrieve:* Setting up Jupyter kernels with virtual environments involves activating the venv, installing Jupyter and ipykernel, then registering the kernel with a display name.

*Innovate:* By using virtual environments as Jupyter kernels, you can maintain isolated Python environments for different projects, ensuring clean dependencies and reproducible results.

*Curiosity → Retrieve → Innovation:* Start with curiosity about managing Python environments, retrieve insights from this setup process, and innovate by organizing your Jupyter workflows with multiple kernels for different projects.

**Next Steps**:
- Set up your virtual environment
- Install required packages
- Register as Jupyter kernel
- Start using in notebooks
<!-- 
![ Tools for building LLM Application ](/assets/img/llm/LLM_tools_for_building.jpeg){: .light .shadow .rounded-10 w='1212' h='668' } -->


> Reference
- ipkernel : <https://hellodata.tistory.com/38>
- Google Colab : <https://creatorjo.tistory.com/entry/%EA%B5%AC%EA%B8%80-%EC%BD%94%EB%9E%A9colab-%EA%B8%B0%EC%B4%88-%EC%82%AC%EC%9A%A9%EB%B2%95>
{: .prompt-info}


