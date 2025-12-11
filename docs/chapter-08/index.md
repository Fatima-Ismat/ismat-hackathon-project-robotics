---
id: chapter-08-capstone-project
title: "Chapter 8: Capstone Project"
sidebar_label: "8. Capstone Project"
sidebar_position: 9
---

# Chapter 8: Capstone Project

## Overview

In this final chapter, you'll integrate everything learned to build a complete Physical AI system: a conversational humanoid robot that performs household tasks using vision-language-action models.

**Project Goals:**
- Build end-to-end Physical AI system
- Integrate ROS 2, simulation, and AI models
- Deploy to real or simulated humanoid robot
- Demonstrate learned concepts

---

## Project Specification

### System Requirements

**Capabilities:**
1. **Visual perception**: Detect and recognize objects
2. **Natural language understanding**: Parse verbal commands
3. **Task planning**: Decompose high-level goals
4. **Manipulation**: Pick and place objects
5. **Navigation**: Move between locations
6. **Dialogue**: Confirm actions and report status

**Example Interaction:**
```
Human: "Can you bring me the red mug from the kitchen?"
Robot: [Visual scan] "I see a red mug on the kitchen counter. I'll bring it to you."
Robot: [Navigates to kitchen, grasps mug, returns]
Robot: "Here's your red mug."
```

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────┐
│              User Interface                  │
│         (Speech + Text Commands)             │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Dialogue Manager                    │
│    (Intent Recognition + State Tracking)     │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Task Planner (LLM)                  │
│    (Natural Language → Action Sequence)      │
└────────────────┬────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
┌────────▼─────┐  ┌──────▼────────┐
│   Perception  │  │  Navigation   │
│  (VLA Model)  │  │  (ROS 2 Nav)  │
└────────┬──────┘  └──────┬────────┘
         │                │
         └────────┬───────┘
                  │
         ┌────────▼─────────┐
         │  Motion Control   │
         │  (Whole-Body IK)  │
         └────────┬──────────┘
                  │
         ┌────────▼─────────┐
         │  Robot Hardware   │
         │  (Isaac Sim/Real) │
         └───────────────────┘
```

---

## Implementation Steps

### Step 1: Setup Simulation Environment

```bash
# Create workspace
mkdir -p ~/capstone_ws/src
cd ~/capstone_ws/src

# Clone robot description
git clone https://github.com/YOUR_USERNAME/household_robot_description

# Build
cd ~/capstone_ws
colcon build
source install/setup.bash

# Launch Isaac Sim
./isaac-sim.sh
```

### Step 2: Create Robot Package

```python
# ~/capstone_ws/src/household_robot/robot_controller.py

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped
from sensor_msgs.msg import Image, JointState
from std_msgs.msg import String

class HouseholdRobotController(Node):
    def __init__(self):
        super().__init__('household_robot_controller')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.arm_cmd_pub = self.create_publisher(JointState, 'arm/command', 10)

        # Subscribers
        self.camera_sub = self.create_subscription(
            Image, 'camera/image_raw', self.camera_callback, 10
        )
        self.voice_sub = self.create_subscription(
            String, 'speech/transcript', self.voice_callback, 10
        )

        # Initialize components
        self.perception = VLAPerception()
        self.planner = TaskPlanner()
        self.dialogue = DialogueManager()

    def voice_callback(self, msg):
        user_input = msg.data
        self.get_logger().info(f'Heard: {user_input}')

        # Process command
        self.process_command(user_input)
```

### Step 3: Integrate VLA Model

```python
from openvla import OpenVLA

class VLAPerception:
    def __init__(self):
        self.model = OpenVLA.from_pretrained("openvla-7b")

    def detect_objects(self, image):
        # Use VLA for object detection
        result = self.model.detect(
            image=image,
            prompt="Detect all objects in the scene"
        )
        return result.objects

    def grasp_object(self, image, object_name):
        # Generate grasp action
        action = self.model.predict(
            image=image,
            instruction=f"Pick up the {object_name}"
        )
        return action
```

### Step 4: Implement Task Planning

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

class TaskPlanner:
    def __init__(self):
        self.llm = AutoModelForCausalLM.from_pretrained("gpt2")
        self.tokenizer = AutoTokenizer.from_pretrained("gpt2")

    def plan_task(self, instruction, scene_description):
        prompt = f"""
You are a household robot assistant. Given the instruction and scene, create a step-by-step plan.

Scene: {scene_description}
Instruction: {instruction}

Plan (JSON format with steps):
"""

        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.llm.generate(inputs.input_ids, max_length=200)
        plan = self.tokenizer.decode(outputs[0])

        return self.parse_plan(plan)

    def parse_plan(self, plan_text):
        # Parse LLM output into actionable steps
        steps = []
        for line in plan_text.split('\n'):
            if line.strip().startswith('-'):
                steps.append(self.parse_step(line))
        return steps
```

### Step 5: Navigation Integration

```python
from nav2_simple_commander.robot_navigator import BasicNavigator

class NavigationController:
    def __init__(self):
        self.navigator = BasicNavigator()

        # Define known locations
        self.locations = {
            'kitchen': PoseStamped(...),
            'living_room': PoseStamped(...),
            'bedroom': PoseStamped(...),
        }

    def navigate_to(self, location_name):
        if location_name in self.locations:
            goal_pose = self.locations[location_name]
            self.navigator.goToPose(goal_pose)

            while not self.navigator.isTaskComplete():
                feedback = self.navigator.getFeedback()
                # Monitor progress

            return self.navigator.getResult()
```

### Step 6: Complete Integration

```python
class HouseholdRobotSystem:
    def __init__(self):
        self.perception = VLAPerception()
        self.planner = TaskPlanner()
        self.navigator = NavigationController()
        self.dialogue = DialogueManager()
        self.speech = SpeechInterface()

    def execute_command(self, user_input):
        # 1. Parse intent
        intent = self.dialogue.classify_intent(user_input)

        # 2. Get current scene
        image = self.get_camera_image()
        objects = self.perception.detect_objects(image)
        scene_desc = self.describe_scene(objects)

        # 3. Plan task
        plan = self.planner.plan_task(user_input, scene_desc)

        # 4. Confirm with user
        confirmation = self.dialogue.confirm_plan(plan)
        self.speech.speak(confirmation)

        # 5. Execute plan
        for step in plan:
            if step['type'] == 'navigate':
                self.navigator.navigate_to(step['location'])
            elif step['type'] == 'grasp':
                action = self.perception.grasp_object(image, step['object'])
                self.execute_action(action)
            elif step['type'] == 'place':
                self.place_object(step['location'])

        # 6. Report completion
        self.speech.speak("Task completed!")
```

---

## Testing and Validation

### Test Scenarios

1. **Object Fetch**
   ```
   Command: "Bring me the blue book"
   Expected: Robot navigates, grasps book, returns
   ```

2. **Multi-Step Task**
   ```
   Command: "Clear the table and put items in the drawer"
   Expected: Pick each item, navigate to drawer, place
   ```

3. **Clarification**
   ```
   Command: "Get the cup"
   Robot: "I see two cups. Which one - the red cup or white cup?"
   ```

---

## Deployment Options

### Option 1: Isaac Sim (Recommended)

- Fastest iteration
- GPU-accelerated physics
- Photorealistic rendering
- No hardware required

### Option 2: Gazebo + Real Robot

- Lower fidelity simulation
- Transfer to real hardware
- Standard ROS 2 pipeline

### Option 3: Real Humanoid Robot

- Ultimate validation
- Requires access to hardware (Unitree, Agility Robotics)
- Sim-to-real fine-tuning needed

---

## Extensions and Challenges

### Advanced Features

1. **Multi-Robot Collaboration**: Coordinate 2+ robots
2. **Long-Horizon Planning**: Multi-day task scheduling
3. **Learning from Mistakes**: RL for failure recovery
4. **Human Preference Alignment**: RLHF for behavior
5. **Privacy-Preserving Vision**: On-device processing

### Performance Metrics

- **Task Success Rate**: % of completed requests
- **Execution Time**: Seconds per task
- **Safety**: Collisions, unsafe actions
- **User Satisfaction**: Survey responses

---

## Summary

This capstone project demonstrates:
- **End-to-end system integration**
- **Real-world applicability**
- **Modern AI techniques** (VLAs, LLMs)
- **Robotics fundamentals** (ROS 2, kinematics)

You've now built a complete Physical AI system - congratulations!

---

## Final Deliverables

1. **System demonstration video** (3-5 minutes)
2. **Code repository** with README
3. **Technical report** documenting design choices
4. **Performance evaluation** with metrics

## Next Steps

- Deploy to real hardware
- Publish research paper
- Open-source contributions
- Join robotics community

**Congratulations on completing the book!** 🎉

---

## Further Resources

- Open Robotics: https://www.openrobotics.org/
- arXiv Robotics: https://arxiv.org/list/cs.RO/recent
- Physical AI Community: Discord/Slack channels
