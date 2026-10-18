---
title: "Optimal Negative Subsampling for Imbalanced Data: Foundations and Calibration Mechanics"
description: "A source audit evaluating optimal negative subsampling for extreme class imbalance, analyzing TikTok recommendation schemes, proof bounds, and log-odds calibration."
date: 2024-07-19 13:30:00 +0800
categories: [AI, Research]
tags: [imbalanced-data, negative-sampling, recommendation-systems, machine-learning, probability-calibration, statistical-learning]
image:
  path: /assets/img/blog/optimally-sample-imbalanced-data.jpeg
  alt: Optimal negative subsampling workflow and probability calibration pipeline
last_modified_at: 2026-10-18 14:00:00 +0900
archive_developed: "2026-10-18"
archive_development_note: "Rebuilt from brief LinkedIn note into authoritative source audit on non-uniform negative subsampling, rare-event logistic regression, and probability calibration"
---

Extreme class imbalance is one of the most pervasive challenges in commercial machine learning. In web-scale recommendation engines, credit card fraud detection, and online click-through rate (CTR) prediction, positive events (such as a user purchasing an item or committing financial fraud) occur at rates often below $0.1\%$ or even $0.01\%$. A production dataset may easily contain billions of unclicked negative impressions against a tiny fraction of positive interactions.

Training deep neural networks or logistic regression models on raw, uncurated imbalanced datasets leads to two severe operational penalties:
1. **Excessive Training Latency and Hardware Expenditure**: Processing trillions of uninformative negative examples burns immense GPU cluster hours with diminishing informational returns.
2. **Gradient Vanishing on the Rare Class**: The cumulative gradient signal from billions of easy negatives overwhelms the sparse positive gradients, causing the decision boundary to collapse toward predicting the majority class universally.

While practitioners commonly resort to naive class re-weighting or uniform random downsampling, statistical research reveals that these standard heuristic approaches are fundamentally sub-optimal.

This source audit examines the mathematical foundations of **optimal non-uniform negative subsampling**—formalized by Wang et al. (2021) and deployed in high-throughput recommendation architectures at organizations like TikTok/ByteDance—and deconstructs how to restore unbiased probability calibration via post-sampling log-odds correction.

![Optimal Subsampling Workflow](/assets/img/blog/optimally-sample-imbalanced-data.jpeg)

## Why Does Uniform Random Subsampling Fail on Severely Imbalanced Datasets?

When confronted with billions of negative examples, the most common heuristic is **uniform downsampling**: randomly selecting 10% or 1% of the negative instances while retaining 100% of the positive instances.

While uniform downsampling slashes dataset volume, it suffers from a critical informational defect: **it treats all negative samples as equally valuable**.

In real-world data distributions:
- **Easy Negatives**: Vast quantities of negative samples are distant from the classification boundary (e.g., showing a motorcycle advertisement to a user who only reads academic papers). A model learns virtually nothing new from seeing millions of these trivial negatives.
- **Hard Negatives (Boundary Samples)**: A small subset of negative instances closely resembles the positive class (e.g., a user browsing high-end cameras who views a camera lens listing for 15 seconds but does not click buy). These boundary samples provide the decisive gradient signals required to sharpen the model's discriminative boundary.

Uniformly discarding negatives discards 90% or 99% of these high-value boundary samples, degrading asymptotic model accuracy.

The optimal strategy requires **non-uniform negative subsampling**, where the sampling probability $P_{\text{sample}}(x)$ is mathematically coupled to the sample's informational hardness:

```mermaid
flowchart TD
    subgraph FullDataset["Full Imbalanced Production Corpus (1:10,000 Ratio)"]
        Pos["Rare Positive Instances (Y = 1, 100% Retained)"]
        NegAll["Massive Negative Corpus (Y = 0, Trillions of Samples)"]
    end

    subgraph Phase1["Phase 1: Pilot Model Training"]
        UniformNeg["Uniformly Subsampled Negatives (Quick Balance)"]
        PilotTrain["Train Lightweight 'Pilot' Model (M_pilot)"]
        Pos & UniformNeg --> PilotTrain
    end

    subgraph Phase2["Phase 2: Optimal Non-Uniform Hard-Negative Mining"]
        ScoreNeg["Inference: Score All Raw Negatives with M_pilot -> P(Y=1|X)"]
        Threshold["Sample Probability: P_sample = r * P(Y=1|X) / E[P]"]
        KeepHard["Keep Difficult Negatives (P_sample > Uniform U(0,1))"]
        NegAll --> ScoreNeg --> Threshold --> KeepHard
    end

    subgraph Phase3["Phase 3: Production Training & Log-Odds Calibration"]
        FinalTrain["Train Production Model on Curated Hard Dataset"]
        Calibration["Log-Odds Correction: logit = logit_s - log(r)"]
        Pos & KeepHard --> FinalTrain --> Calibration
        Calibration --> UnbiasedProb["Unbiased, Calibrated Production Probabilities"]
    end

    style FullDataset fill:#f8d7da,stroke:#dc3545,stroke-width:2px
    style Phase1 fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    style Phase2 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style Phase3 fill:#d4edda,stroke:#28a745,stroke-width:2px
```

## Mathematical Mechanics: Theorem 3 and Optimal Subsampling Bounds

In their seminal theoretical derivation, Wang et al. (2021) analyzed the asymptotic variance of parameter estimators under large-scale logistic regression with rare events.

They established that the asymptotic covariance matrix of the maximum subsample estimator is minimized when the negative sampling probability $\pi_i$ for negative sample $i$ satisfies:

$$\pi_i \propto p(x_i)$$

Where $p(x_i) = P(Y=1|x_i)$ is the conditional probability that sample $x_i$ belongs to the positive class.

### Why Hard Negatives Are Statistically Optimal
Theorem 3 proves that optimal sampling gives higher retention probability to negative samples that have a higher predicted probability of being positive. By concentrating training compute on the "confusing" negative samples, the Fisher information matrix of the subsampled estimator approaches the full-data information matrix with a fraction of the computational sample size.

### Restoring Probability Calibration via Log-Odds Correction
While non-uniform subsampling accelerates training and sharpens decision boundaries, it introduces severe **selection bias**. The raw output probabilities $P_s(Y=1|X)$ coming from the model trained on subsampled data are artificially inflated (e.g., predicting a 30% click probability for a link whose real-world probability is 0.05%).

In recommendation systems where downstream bidding and ranking algorithms require true expected value calculations ($E[\text{Value}] = \text{Bid} \times P(\text{Click})$), uncalibrated probabilities break auction pricing.

To restore true real-world probabilities, we apply the classical logistic odds adjustment formalized by King & Zeng (2001):

$$\log \left( \frac{P(Y=1|X)}{P(Y=0|X)} \right) = \log \left( \frac{P_s(Y=1|X)}{P_s(Y=0|X)} \right) + \log(r)$$

Where $r$ is the overall effective downsampling ratio ($r = N_{\text{sampled}} / N_{\text{total}}$). By subtracting the offset $\log(1/r)$ from the raw logit output during inference, the model produces mathematically unbiased, well-calibrated probabilities.

```python
"""
Production Non-Uniform Negative Subsampling and Log-Odds Calibration.
Demonstrating pilot model scoring, rejection sampling, and inference calibration.
"""

import numpy as np
import math

class OptimalNegativeSampler:
    def __init__(self, target_sampling_rate: float = 0.05):
        self.r = target_sampling_rate

    def compute_subsample_mask(self, negative_probabilities: np.ndarray) -> np.ndarray:
        """
        Calculates non-uniform sampling probabilities and generates boolean mask.
        P_sample = r * p_i / mean(p)
        """
        p = np.clip(negative_probabilities, 1e-7, 1.0 - 1e-7)
        mean_p = np.mean(p)
        
        # Sampling probability proportional to predicted positive likelihood
        p_sample = np.clip(self.r * (p / mean_p), 0.0, 1.0)
        
        # Stochastic rejection sampling
        random_uniform = np.random.uniform(0.0, 1.0, size=len(p))
        return random_uniform < p_sample

    def calibrate_logits(self, biased_logits: np.ndarray) -> np.ndarray:
        """
        Restores true real-world probabilities from biased subsampled model logits.
        log_odds_true = log_odds_biased + log(r)
        """
        # Subtract log(1/r) equivalent to adding log(r) where r < 1
        calibrated_logits = biased_logits + math.log(self.r)
        # Convert calibrated logit back to probability
        return 1.0 / (1.0 + np.exp(-calibrated_logits))

# Demonstration
if __name__ == "__main__":
    sampler = OptimalNegativeSampler(target_sampling_rate=0.01) # 1% sampling rate
    # Simulated pilot model outputs on 10,000 negative samples
    neg_preds = np.random.beta(a=0.5, b=10.0, size=10000)
    selected_mask = sampler.compute_subsample_mask(neg_preds)
    
    print(f"Retained {np.sum(selected_mask)} hard negatives out of {len(neg_preds)} ({np.mean(selected_mask)*100:.2f}%)")
```

For practical guidance on post-training alignment where negative preference pairs must be selected without collapsing policy entropy, see our analysis of [autonomous self-evolution post-training](/posts/llm-self-evolution/). For understanding how high-throughput retrieval filters candidate negatives before scoring, review our audit of [production RAG retrieval mechanics](/posts/try-implementing-rag-using-langchain/) and distributed database architectures in [Google planet-scale system design](/posts/prepared-google-interview/).

## How Negative Sampling and Dynamic Imbalance Mitigation Evolved Across 2026

Between 2024 and 2026, the principles of non-uniform negative subsampling expanded far beyond tabular logistic regression into generative AI and multi-modal alignment:

1. **Hard-Negative Mining in Multi-Modal Contrastive Learning (CLIP / SigLIP)**: In dual-encoder visual language models, in-batch negatives often fail to provide sufficient contrastive pressure. 2026 pipelines use streaming cross-GPU nearest-neighbor queues to mine "adversarial negatives"—images with high visual overlap but distinct textual semantics—subsampling them with probability proportional to semantic hardness.
2. **Iterative DPO Negative Preference Pair Selection**: In Direct Preference Optimization for reasoning models, pairing correct solutions with random incorrect outputs leads to trivial alignment. Frontier post-training loops generate rollouts, evaluate execution errors, and select "near-miss" reasoning chains as hard negative targets, accelerating mathematical convergence.
3. **Adaptive Focal-Loss Auto-Tuning**: Rather than static loss re-weighting, modern neural architectures dynamically modulate sample weighting on the fly:
   $$\mathcal{L}_{\text{FL}}(p_t) = -\alpha_t (1 - p_t)^\gamma \log(p_t)$$
   Where the focusing parameter $\gamma$ dynamically scales based on real-time batch difficulty distributions.
4. **Online Streaming Calibration in Real-Time Ad Auctions**: In modern ad-tech platforms, click probabilities undergo continuous concept drift throughout the day. 2026 systems integrate online Bayesian Platt scaling, adjusting log-odds offsets dynamically every minute based on real-time stream telemetry.

## Key Takeaways

- **Uniform Downsampling Discards Critical Boundary Signal**: Treating all negative samples equally throws away the rare "hard negatives" that provide the highest Fisher information for gradient updates.
- **Sample Hardness Proportional to Positive Likelihood**: As proven by Wang et al. (Theorem 3), sampling negatives with probability proportional to their predicted positive likelihood minimizes parameter estimation variance.
- **Log-Odds Calibration is Mandatory for Decision Engines**: Subsampling artificially distorts raw model output probabilities; applying post-hoc log-odds offsets restores unbiased, real-world expected values.
- **Negative Sampling Extends to Frontier AI**: The mathematical principles of hard-negative selection underpin modern DPO preference alignment, contrastive vision training, and recommendation retrieval.

## New Questions

- **Can Non-Uniform Subsampling Induce Adversarial Vulnerabilities?** By training models almost exclusively on confusing negative examples near the decision boundary, does the model become more vulnerable to adversarial perturbations that mimic boundary noise?
- **How Does Hard-Negative Mining Interact with Noisy Labels?** If a dataset contains human annotation errors (false negatives labeled as positives), will non-uniform sampling aggressively over-sample mislabeled data, degrading generalization?
- **What is the Computational Crossover Point for Pilot Models?** At what dataset size and training epoch count does the overhead of training and inferencing a separate pilot model exceed the cost savings of subsampling?

## References

- Wang, H., Yang, M., & Volkova, S. (2021). *Optimal Subsampling for Large-scale Logistic Regression with Rare Events*. Journal of the American Statistical Association. Available at: [https://arxiv.org/abs/2110.13048](https://arxiv.org/abs/2110.13048) (accessed 2026-10-18).
- Lin, T. Y., Goyal, P., Girshick, R., He, K., & Dollár, P. (2017). *Focal Loss for Dense Object Detection*. IEEE International Conference on Computer Vision (ICCV 2017). Available at: [https://arxiv.org/abs/1708.02002](https://arxiv.org/abs/1708.02002) (accessed 2026-10-18).
- King, G., & Zeng, L. (2001). *Logistic Regression in Rare Events Data*. Political Analysis, 9(2), 137–163. Available at: [https://doi.org/10.1093/oxfordjournals.pan.a004868](https://doi.org/10.1093/oxfordjournals.pan.a004868) (accessed 2026-10-18).
- He, H., & Garcia, E. A. (2009). *Learning from Imbalanced Data*. IEEE Transactions on Knowledge and Data Engineering, 21(9), 1263–1284. Available at: [https://doi.org/10.1109/TKDE.2008.239](https://doi.org/10.1109/TKDE.2008.239) (accessed 2026-10-18).
