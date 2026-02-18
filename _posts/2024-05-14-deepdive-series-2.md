---
title: "Deep Dive into Sora’s Diffusion Transformer (DiT) by Hand"
description: "Deep Dive into Sora’s Diffusion Transformer (DiT) by Hand ✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science."
categories: [Multimodal/Computer Vision]
tags: [Multimodal, Vision, Generative Model]
date: 2024-05-14 13:11:00 +0800
---
### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-soras-diffusion-transformer-dit-by-hand-%EF%B8%8E-1e4d84ec865d>

* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/659978>
> Below Summary Note

Deep Dive into Sora’s Diffusion Transformer (DiT) by Hand ✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science

#### 1. Deep Dive into Sora's Diffusion Transformer (DiT) by Hand
   - According to an article by Srijanie Dey, PhD, in Towards Data Science, April 2024
   - An in-depth study on **`Sora's Diffusion Transformer (DiT)`** is underway.
   - The article covers a hands-on exploration of DiT, introducing fascinating insights.
   - The article is available on the 'Towards Data Science' app, offering an opportunity to gain new insights into DiT.

#### 2. In-Depth Analysis of Sora's Diffusion Transformer (DiT)
   - Exploring the secrets behind Sora's cutting-edge videos.
   - Sora's legend is depicted as originating from the ancient land of DiTharos, embodying boundless potential.
   - Discusses the immense magical power and abilities of Sora, harnessing elements of light scattered among the clouds.
   - When you see the red streaks in the sky, you realize they are part of the legend soaring through the heavens.

#### 3. Sora: The Birth and Global Popularity of OpenAI's Text-to-Video Model
   - Sora is a Diffusion Transformer (DiT) developed by [William Peebles](https://www.linkedin.com/in/william-peebles-a980a212a/) and [Saining Xie](https://www.linkedin.com/in/sainxie/) in 2023.
   - It uses diffusion ideas to predict videos and leverages the strengths of transformers for scaling.
   - We examine what Sora does when it receives a text prompt and how it combines diffusion-transformer ideas.
   - Among Sora's videos, the favorite shows a cute Dalmatian on an Italian street, with remarkably natural movements.

#### 4. How Sora Works
   - Sora's goal is to generate videos based on text prompts.
   - Through **`Diffusion step *t* = 3`**, noise is added within the model to alter fine details of the image, generating a more refined image.
   - Sora uses dimensionality reduction techniques and encoders to split the video into smaller elements and convert them into spatiotemporal patches.
   - Through the *dimensionality reduction* process, pixel dimensions are converted to a lower-dimensional latent space, reducing the model size.
   - Next, the model diffuses noise to generate images, which are then used together with text prompts to produce videos.

#### 5. Conditional Adaptive Normalization Layers and Model Conditional Encoding
   - Conditional adaptive normalization aims to influence the model's behavior using additional information.
   - Through prompts like ‘Sora is sky’, the model is guided to focus on elements such as **sky or clouds**.
   - Conditional adaptive normalization layers serve to **dynamically scale and shift data within the network**.
   - The ‘adaptive’ layer normalization applied to the model captures precise data essentials by multiplying and adding weights and biases. For this, the model uses **learnable parameters** — weights and biases.

#### 6. Generating Videos from Frame Sequences
   - Scale and shift are estimated and stored in 'X' and '+' respectively.
   - When applying scale/shift, the combined noise is used to obtain 'Conditioned' noise.
   - Noise is predicted using a transformer, trained with MSE loss, and new videos are generated.
   - Key components include: visual encoder for reducing video to patches, diffusion and decoding techniques, transformer architecture, and denoising and decoding processes.
   - The decoder rearranges the resulting pixels to generate the desired video. Congratulations, 'Sora Video'! 🌟

#### 7. Comparing the Sora Stories
   - After finishing the article, read the opening story again. You will discover similarities between the Sora of DiTharos and the Sora of our world.

#### 8. The Diffusion-Transformer (DiT) Combo
   - Considering the videos produced by Sora, the Diffusion-Transformer duo can be called a killer combination.
   - Together with the visual patch idea, this opens the door to adjusting various image resolutions, aspect ratios, and durations, enabling extreme experimentation.
   - In summary, this idea is significant and will undoubtedly continue to evolve.
   - According to a New York Times article, Sora was inspired by the Japanese word for sky, symbolizing ideas that go beyond limited possibilities.
   - After experiencing its early promise, Sora has indeed opened new horizons in the field of artificial intelligence. What remains is how well it withstands the tests of stability and time. According to the legend of 'DiTharos' — 'Sora continues to enhance its abilities and grow stronger, preparing to take flight at the golden moment!'
