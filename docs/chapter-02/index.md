---
id: chapter-02-ros-2-fundamentals
title: "Chapter 2: ROS 2 Fundamentals"
sidebar_label: "2. ROS 2 Fundamentals"
sidebar_position: 3
---

# Chapter 2: ROS 2 Fundamentals

## Overview

The Robot Operating System 2 (ROS 2) is the de facto standard framework for building robotic systems. This chapter introduces ROS 2's core concepts, architecture, and practical usage for Physical AI development.

**Learning Objectives:**
- Understand ROS 2 architecture and design principles
- Learn nodes, topics, services, and actions
- Master ROS 2 command-line tools
- Build your first ROS 2 application

---

## What is ROS 2?

ROS 2 is a middleware framework providing:
- **Communication infrastructure**: Publish-subscribe messaging, services, actions
- **Tools**: Debugging, visualization, simulation integration
- **Libraries**: Common robotics algorithms (SLAM, navigation, perception)
- **Ecosystem**: Thousands of open-source packages

### ROS 1 vs. ROS 2

| Feature | ROS 1 | ROS 2 |
|---------|-------|-------|
| **Middleware** | Custom TCP/UDP | DDS (Data Distribution Service) |
| **Real-time** | Limited | Full support |
- **Security** | Basic | Encrypted communication |
| **Multi-robot** | Difficult | Native support |
| **Platforms** | Linux only | Linux, Windows, macOS |

---

## Core Concepts

### Nodes

A **node** is a single-purpose process:

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_node')
        self.get_logger().info('Node initialized!')

def main():
    rclpy.init()
    node = MinimalNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

### Topics

**Topics** enable publish-subscribe communication:

```python
from std_msgs.msg import String

class Publisher(Node):
    def __init__(self):
        super().__init__('publisher')
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello ROS 2!'
        self.publisher_.publish(msg)
```

### Services

**Services** provide request-response patterns:

```python
from example_interfaces.srv import AddTwoInts

class ServiceNode(Node):
    def __init__(self):
        super().__init__('service_node')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        return response
```

---

## DDS: The Middleware

ROS 2 uses **DDS** (Data Distribution Service) for communication:

- **Discovery**: Automatic peer finding (no roscore!)
- **Quality of Service (QoS)**: Reliability, durability, history policies
- **Security**: DDS-Security for encrypted communication

### QoS Profiles

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy

qos_profile = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,  # vs. RELIABLE
    depth=10  # Message queue size
)

self.publisher_ = self.create_publisher(
    LaserScan,
    'scan',
    qos_profile
)
```

---

## Workspace and Packages

### Creating a Workspace

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src

# Create a package
ros2 pkg create my_robot_pkg --build-type ament_python --dependencies rclpy

cd ~/ros2_ws
colcon build
source install/setup.bash
```

### Package Structure

```
my_robot_pkg/
├── package.xml          # Metadata and dependencies
├── setup.py             # Python package configuration
├── my_robot_pkg/
│   ├── __init__.py
│   └── my_node.py      # Your node implementation
└── resource/
    └── my_robot_pkg    # Marker file
```

---

## Launch Files

**Launch files** start multiple nodes:

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot_pkg',
            executable='talker',
            name='talker_node'
        ),
        Node(
            package='my_robot_pkg',
            executable='listener',
            name='listener_node'
        ),
    ])
```

Run with:
```bash
ros2 launch my_robot_pkg my_launch.py
```

---

## Command-Line Tools

Essential ROS 2 CLI commands:

```bash
# List nodes
ros2 node list

# View node info
ros2 node info /my_node

# List topics
ros2 topic list

# Echo topic messages
ros2 topic echo /chatter

# Publish to topic
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.5}}"

# Call a service
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 2, b: 3}"

# View message definition
ros2 interface show sensor_msgs/msg/LaserScan
```

---

## Parameters

**Parameters** configure nodes at runtime:

```python
class ParamNode(Node):
    def __init__(self):
        super().__init__('param_node')
        self.declare_parameter('my_parameter', 'default_value')

        # Get parameter
        param_value = self.get_parameter('my_parameter').get_parameter_value().string_value
        self.get_logger().info(f'Parameter: {param_value}')
```

Set parameters:
```bash
ros2 run my_pkg param_node --ros-args -p my_parameter:=new_value
```

---

## Practical Example: Turtlesim

Turtlesim is the "Hello World" of ROS 2:

```bash
# Terminal 1: Start turtlesim
ros2 run turtlesim turtlesim_node

# Terminal 2: Control with keyboard
ros2 run turtlesim turtle_teleop_key

# Terminal 3: Monitor velocity commands
ros2 topic echo /turtle1/cmd_vel

# Terminal 4: Draw a square
ros2 service call /turtle1/teleport_absolute turtlesim/srv/TeleportAbsolute "{x: 5.0, y: 5.0, theta: 0.0}"
```

---

## Summary

ROS 2 provides:
- **Modular architecture** via nodes and packages
- **Flexible communication** with topics, services, actions
- **Powerful tooling** for development and debugging
- **Industry-grade middleware** (DDS) for reliability

**Next Chapter:** [Digital Twin Simulation →](../chapter-03/index.md)

---

## Exercises

1. Create a ROS 2 node that publishes sensor data
2. Implement a service that processes robot commands
3. Build a launch file for multi-node system
4. Experiment with different QoS policies

## Further Reading

- ROS 2 Documentation: https://docs.ros.org/
- DDS Specification: https://www.omg.org/spec/DDS/
- ROS 2 Design: https://design.ros2.org/
