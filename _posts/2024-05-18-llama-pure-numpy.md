---
title: "Llama 3 implemented in pure NumPy"
description: "Curiosity: How can we understand LLM architectures at the most fundamental level?"
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-05-18 15:20:00 +0800
mermaid: true
---
## 🦙 Llama 3 Implemented in Pure NumPy: Understanding LLMs from First Principles

*Curiosity:* How can we understand LLM architectures at the most fundamental level? What insights can we retrieve by implementing complex models using only basic NumPy operations?

**Implementing Llama 3 in pure NumPy** offers a unique opportunity to understand transformer architectures from first principles. This educational implementation, inspired by Andrej Karpathy's work, provides clarity and interpretability that high-level frameworks often obscure.

### Why Pure NumPy Implementation?

```mermaid
graph LR
    A[Understanding LLMs] --> B[High-Level Frameworks]
    A --> C[Pure NumPy]
    
    B --> B1[Fast Development]
    B --> B2[Abstraction Layers]
    B --> B3[Less Visibility]
    
    C --> C1[Full Control]
    C --> C2[Clear Operations]
    C --> C3[Educational Value]
    
    style A fill:#e1f5ff
    style C fill:#fff3cd
    style B3 fill:#f8d7da
    style C3 fill:#d4edda
```

### Llama 3 Training Scale

*Retrieve:* The scale of Llama 3 training reveals the computational resources required for state-of-the-art models.

| Resource | Quantity | Impact |
|:---------|:---------|:-------|
| **GPUs** | 24,000 | Massive parallel processing |
| **Training Data** | 15T tokens | Comprehensive knowledge base |
| **Instruction Data** | 10M samples | Fine-tuning for alignment |
| **GPU Hours** | 1.3M hours | Extensive compute investment |

### Architecture Overview

**Key Insight**: Despite transitioning to GQA (Grouped Query Attention), the model structure remains unchanged from Llama 2, making it a familiar yet powerful framework.

```python
import numpy as np

class Llama3Attention:
    """Simplified Llama 3 attention mechanism in NumPy"""
    
    def __init__(self, dim, num_heads, head_dim):
        self.dim = dim
        self.num_heads = num_heads
        self.head_dim = head_dim
        
        # Weight matrices
        self.q_proj = np.random.randn(dim, num_heads * head_dim) * 0.02
        self.k_proj = np.random.randn(dim, num_heads * head_dim) * 0.02
        self.v_proj = np.random.randn(dim, num_heads * head_dim) * 0.02
        self.o_proj = np.random.randn(num_heads * head_dim, dim) * 0.02
    
    def forward(self, x, mask=None):
        """Forward pass of attention"""
        batch_size, seq_len, _ = x.shape
        
        # Project to Q, K, V
        Q = x @ self.q_proj  # [batch, seq, num_heads * head_dim]
        K = x @ self.k_proj
        V = x @ v_proj
        
        # Reshape for multi-head attention
        Q = Q.reshape(batch_size, seq_len, self.num_heads, self.head_dim)
        K = K.reshape(batch_size, seq_len, self.num_heads, self.head_dim)
        V = V.reshape(batch_size, seq_len, self.num_heads, self.head_dim)
        
        # Scaled dot-product attention
        scores = np.einsum('bshd,bthd->bsht', Q, K) / np.sqrt(self.head_dim)
        
        if mask is not None:
            scores = np.where(mask, scores, -np.inf)
        
        attn_weights = self.softmax(scores)
        output = np.einsum('bsht,bthd->bshd', attn_weights, V)
        
        # Reshape and project output
        output = output.reshape(batch_size, seq_len, -1)
        return output @ self.o_proj
    
    def softmax(self, x):
        """Numerically stable softmax"""
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)
```

### GQA (Grouped Query Attention) Implementation

**Note**: While GQA is incorporated into the code structure, it's not applied to model behavior in this educational implementation, ensuring enhanced interpretability.

```mermaid
graph TB
    A[Input Tokens] --> B[Embedding Layer]
    B --> C[Transformer Blocks]
    C --> D[Attention Layer]
    D --> E[GQA Mechanism]
    E --> F[Feed Forward]
    F --> G[Output]
    
    H[Positional Encoding] --> C
    I[Layer Norm] --> D
    I --> F
    
    style A fill:#e1f5ff
    style D fill:#fff3cd
    style E fill:#d4edda
    style G fill:#f8d7da
```

### Implementation Benefits

| Aspect | Benefit | Impact |
|:-------|:--------|:-------|
| **Educational** | Clear understanding of operations | ⬆️ Learning |
| **Interpretability** | See every computation step | ⬆️ Debugging |
| **Portability** | No framework dependencies | ⬆️ Accessibility |
| **Clarity** | Intuitive model structure | ⬆️ Understanding |

### Key Implementation Details

**1. Model Conversion**
- Leveraging stories15M model trained by Andrej Karpathy
- Converting to NumPy compressed format
- Maintaining clarity and precision

**2. Architecture Preservation**
- Llama 2 structure compatibility
- GQA integration (structural, not behavioral)
- Transformer block implementation

**3. Educational Focus**
- Step-by-step operations
- Clear mathematical formulations
- Practical examples

### Comparison: Framework vs. Pure NumPy

| Feature | PyTorch/TensorFlow | Pure NumPy |
|:--------|:-------------------|:-----------|
| **Speed** | ⚡⚡⚡ Very Fast | ⚡ Slower |
| **GPU Support** | ✅ Native | ❌ CPU only |
| **Abstraction** | High | Low |
| **Understanding** | ⚠️ Limited | ✅ Complete |
| **Educational Value** | ⚠️ Medium | ✅ High |

### Use Cases

*Retrieve:* Pure NumPy implementations are valuable for:
- Educational purposes
- Understanding model internals
- Debugging and verification
- Research and experimentation

*Innovate:* By understanding the fundamentals, you can:
- Optimize implementations
- Create custom architectures
- Debug complex issues
- Build domain-specific models

### Resources

**🧑‍💻 Code Repository**: <https://github.com/likejazz/llama3.np>

**Key Features**:
- Pure NumPy implementation
- Educational focus
- Clear documentation
- Karpathy-inspired approach

### Key Takeaways

*Retrieve:* Implementing Llama 3 in pure NumPy provides deep insights into transformer architectures, revealing the mathematical operations that power modern LLMs.

*Innovate:* By understanding these fundamentals, you can innovate on architectures, optimize implementations, and build custom solutions tailored to specific needs.

*Curiosity → Retrieve → Innovation:* Start with curiosity about how LLMs work, retrieve knowledge through hands-on implementation, and innovate by applying these insights to new problems.

**Next Steps**:
- Explore the GitHub repository
- Run the implementation
- Modify and experiment
- Build your own variations 


<object data="/assets/img/llm/Llama3_implemeted_in_pure_Numpy.pdf" width="100%" height="450" type='application/pdf'></object>


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

🦙 Llama 3 Implemented in Pure NumPy 👩🔬

🚀 Exciting discovery! Inspired by @Andrej Karpathy, I found an interesting article about the Llama 3 model implemented in NumPy. The Llama 3 model from AI at Meta is making waves with its impressive scale and performance. 🌟

🧑 Code : <https://github.com/likejazz/llama3.np>

🔍 Using 24K GPUs, 15T training data, 10M instruction data, and 1.3M GPU hours, the numbers are truly overwhelming. Despite switching to use GQA, the model structure is unchanged from Llama 2, making it a familiar yet powerful framework.

🧠 To aid understanding, the author focuses on accurate implementation using NumPy. Utilizing the stories15M model trained by Andrej Karpathy, they are converting to NumPy compressed format for a more intuitive model structure. Stay tuned as they convert Karpathy's trained Llama 2 model into working code while maintaining the clarity and precision of the approach.

📊 While integrating GQA into the code, the author does not apply GQA to the model behavior, allowing a smooth NumPy implementation to enhance interpretability. Stay tuned for more insights on this innovative approach! 

</details>

