---
id: chapter-05-vision-language-action
title: "Chapter 5: Vision-Language-Action (VLA) Models"
sidebar_label: "5. Vision-Language-Action"
sidebar_position: 6
---

# Chapter 5: Vision-Language-Action (VLA) Models

## Overview

Vision-Language-Action (VLA) models represent the convergence of computer vision, natural language processing, and robot control. These foundation models enable robots to understand multimodal instructions and execute complex tasks.

**Learning Objectives:**
- Understand VLA model architecture
- Learn about RT-1, RT-2, and similar models
- Implement vision-language grounding
- Fine-tune VLAs for specific tasks

---

## What are VLA Models?

**VLA models** map visual observations and language instructions directly to robot actions:

```
Input: Image + "Pick up the red cube"
Output: [gripper_x, gripper_y, gripper_z, gripper_open]
```

### Key Capabilities

1. **Generalization**: Zero-shot transfer to new objects
2. **Language grounding**: Understand spatial relationships
3. **Common sense reasoning**: Leverage pre-trained knowledge
4. **Multi-task learning**: Single model for diverse tasks

---

## RT-1: Robotics Transformer

### Architecture

```python
# Simplified RT-1 architecture
class RT1(nn.Module):
    def __init__(self):
        super().__init__()
        # Vision encoder (EfficientNet-B3)
        self.vision_encoder = EfficientNet.from_pretrained('b3')

        # Language encoder (Universal Sentence Encoder)
        self.language_encoder = hub.load("USE")

        # Transformer policy
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=512, nhead=8),
            num_layers=8
        )

        # Action head
        self.action_head = nn.Linear(512, 7)  # 6 DOF + gripper

    def forward(self, image, text):
        # Encode vision
        vision_features = self.vision_encoder(image)  # [B, 512, H, W]
        vision_tokens = vision_features.flatten(2).permute(0, 2, 1)  # [B, HW, 512]

        # Encode language
        text_features = self.language_encoder(text)  # [B, 512]
        text_token = text_features.unsqueeze(1)  # [B, 1, 512]

        # Concatenate
        tokens = torch.cat([text_token, vision_tokens], dim=1)  # [B, 1+HW, 512]

        # Transform
        policy_features = self.transformer(tokens)

        # Predict action
        action = self.action_head(policy_features[:, 0, :])  # Use CLS token
        return action
```

### Training Data

RT-1 was trained on **130k robot demonstrations**:
- 700+ tasks
- 17 physical robots
- Real-world kitchen environments

---

## RT-2: Vision-Language-Action via VLM

### Leveraging VLMs

RT-2 builds on **Vision-Language Models** (PaLM-E, Flamingo):

```python
class RT2(nn.Module):
    def __init__(self, vlm_model):
        super().__init__()
        # Pre-trained VLM (e.g., PaLM-E)
        self.vlm = vlm_model
        self.vlm.freeze_vision_encoder()  # Keep vision frozen

        # Fine-tune language model for action prediction
        self.action_tokenizer = ActionTokenizer(bins=256)

    def forward(self, image, instruction):
        # VLM processes both modalities
        output_tokens = self.vlm.generate(
            image=image,
            prompt=f"Robot action for: {instruction}"
        )

        # Decode action from tokens
        action = self.action_tokenizer.decode(output_tokens)
        return action
```

### Key Insight

VLMs provide:
- **World knowledge** from internet-scale pre-training
- **Semantic understanding** of objects and scenes
- **Reasoning capabilities** for novel situations

---

## Language Grounding for Robotics

### Spatial Relationships

```python
class SpatialGrounding:
    def __init__(self, vision_model, nlp_model):
        self.vision = vision_model
        self.nlp = nlp_model

    def ground_instruction(self, image, instruction):
        # Parse instruction
        parsed = self.nlp.parse(instruction)
        # "put the red block on the blue plate"
        # → {action: "put", object: "red block", location: "blue plate"}

        # Detect objects
        detections = self.vision.detect(image)

        # Find target object
        target = self.find_object(detections, "red block")

        # Find location
        location = self.find_object(detections, "blue plate")

        # Compute action
        return {
            'pick_pose': target.pose,
            'place_pose': location.pose + [0, 0, 0.1]  # Above plate
        }
```

---

## Open-Source VLA Models

### OpenVLA

```bash
# Install OpenVLA
pip install openvla

# Load pre-trained model
from openvla import OpenVLA

model = OpenVLA.from_pretrained("openvla-7b")

# Inference
action = model.predict(
    image=camera.capture(),
    instruction="Pick up the apple"
)

robot.execute(action)
```

### CLIP for Vision-Language

```python
import clip

model, preprocess = clip.load("ViT-B/32")

# Encode image
image_input = preprocess(image).unsqueeze(0)
image_features = model.encode_image(image_input)

# Encode text options
text_inputs = clip.tokenize([
    "a photo of a red cube",
    "a photo of a blue ball",
    "a photo of a green cylinder"
])
text_features = model.encode_text(text_inputs)

# Compute similarity
similarity = (image_features @ text_features.T).softmax(dim=-1)
most_similar = similarity.argmax()
```

---

## Fine-Tuning for Your Robot

### Data Collection

```python
class DemonstrationCollector:
    def __init__(self, robot, camera):
        self.robot = robot
        self.camera = camera
        self.demonstrations = []

    def collect(self, instruction):
        print(f"Demonstrate: {instruction}")
        trajectory = []

        while not done:
            # Record state
            state = {
                'image': self.camera.capture(),
                'instruction': instruction,
                'action': self.robot.get_current_action(),
                'gripper_open': self.robot.gripper.is_open()
            }
            trajectory.append(state)

            time.sleep(0.1)

        self.demonstrations.append(trajectory)
```

### Fine-Tuning

```python
from transformers import Trainer, TrainingArguments

# Prepare dataset
dataset = VLADataset(demonstrations)

# Training config
training_args = TrainingArguments(
    output_dir="./vla-finetuned",
    num_train_epochs=10,
    per_device_train_batch_size=8,
    learning_rate=1e-5,
    warmup_steps=500,
)

# Fine-tune
trainer = Trainer(
    model=vla_model,
    args=training_args,
    train_dataset=dataset,
)

trainer.train()
```

---

## Challenges and Solutions

### Distribution Shift

**Problem**: Pre-trained on internet images, deployed on robot cameras

**Solutions**:
- Domain adaptation techniques
- Fine-tune vision encoder on robot data
- Synthetic data augmentation

### Action Space Mismatch

**Problem**: Different robots have different DOF

**Solution**: Action tokenization
```python
# Universal action representation
action_tokens = [
    "move_left", "move_right", "move_up", "move_down",
    "rotate_cw", "rotate_ccw", "gripper_open", "gripper_close"
]

# Map to robot-specific actions
robot_action = action_mapper[action_token](robot_state)
```

---

## Summary

VLA models enable:
- **Natural language control** of robots
- **Zero-shot generalization** to new tasks
- **Leveraging foundation models** for common sense
- **Unified architecture** across diverse robots

**Next Chapter:** [Humanoid Robot Development →](../chapter-06/index.md)

---

## Exercises

1. Implement CLIP for object detection
2. Collect and label robot demonstrations
3. Fine-tune a VLA model on custom task
4. Compare RT-1 vs. RT-2 architectures

## Further Reading

- RT-1 Paper: arXiv:2212.06817
- RT-2 Paper: arXiv:2307.15818
- OpenVLA: https://openvla.github.io/
- CLIP: https://github.com/openai/CLIP
