---
id: chapter-03-digital-twin-simulation
title: "Chapter 3: Digital Twin Simulation"
sidebar_label: "3. Digital Twin Simulation"
sidebar_position: 4
---

# Chapter 3: Digital Twin Simulation

## Overview

Digital twins are virtual replicas of physical systems that enable safe, scalable robot development. This chapter explores simulation platforms, physics engines, and sim-to-real transfer techniques.

**Learning Objectives:**
- Understand digital twin concepts
- Master Gazebo simulator for ROS 2
- Learn URDF robot modeling
- Bridge the sim-to-real gap

---

## What is a Digital Twin?

A **digital twin** is a virtual model that:
- Mirrors physical system behavior
- Enables testing without hardware risk
- Accelerates development through parallelization
- Facilitates data collection for machine learning

### Benefits for Robotics

1. **Safety**: Test dangerous scenarios (collisions, falls)
2. **Speed**: Run 100x faster than real-time
3. **Scalability**: Train multiple robots in parallel
4. **Cost**: No hardware wear-and-tear

---

## Gazebo: The ROS 2 Simulator

**Gazebo** integrates with ROS 2 for realistic simulation:

```bash
# Install Gazebo Fortress
sudo apt install ros-humble-gazebo-ros-pkgs

# Launch example world
ros2 launch gazebo_ros gazebo.launch.py
```

### Key Features

- **Physics engines**: ODE, Bullet, Simbody
- **Sensor simulation**: Cameras, LIDAR, IMU
- **Plugin system**: Custom robot behaviors
- **ROS 2 integration**: Topics, services, TF

---

## URDF: Robot Description

**URDF** (Unified Robot Description Format) defines robot geometry:

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.3 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.4" ixy="0" ixz="0" iyy="0.4" iyz="0" izz="0.2"/>
    </inertial>
  </link>

  <!-- Wheel joint -->
  <joint name="wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_link"/>
    <origin xyz="0 0 -0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>

  <link name="wheel_link">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </visual>
  </link>
</robot>
```

---

## Spawning Robots in Gazebo

```python
import os
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    urdf_path = os.path.join(
        get_package_share_directory('my_robot_description'),
        'urdf',
        'robot.urdf'
    )

    return LaunchDescription([
        # Start Gazebo
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource([
                get_package_share_directory('gazebo_ros'),
                '/launch/gazebo.launch.py'
            ])
        ),

        # Spawn robot
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=['-entity', 'my_robot', '-file', urdf_path],
            output='screen'
        ),
    ])
```

---

## Sensor Simulation

### LIDAR

```xml
<gazebo reference="lidar_link">
  <sensor name="lidar_sensor" type="gpu_lidar">
    <update_rate>10</update_rate>
    <lidar>
      <scan>
        <horizontal>
          <samples>360</samples>
          <resolution>1</resolution>
          <min_angle>-3.14</min_angle>
          <max_angle>3.14</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>10.0</max>
      </range>
    </lidar>
    <plugin name="lidar_plugin" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/my_robot</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
    </plugin>
  </sensor>
</gazebo>
```

### Camera

```xml
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <update_rate>30</update_rate>
    <camera>
      <horizontal_fov>1.57</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
      </image>
    </camera>
    <plugin name="camera_plugin" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/my_robot</namespace>
        <remapping>image_raw:=camera/image</remapping>
      </ros>
    </plugin>
  </sensor>
</gazebo>
```

---

## Control in Simulation

### Differential Drive

```xml
<gazebo>
  <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
    <ros>
      <namespace>/my_robot</namespace>
    </ros>
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
    <wheel_separation>0.3</wheel_separation>
    <wheel_diameter>0.2</wheel_diameter>
    <max_wheel_torque>20</max_wheel_torque>
    <command_topic>cmd_vel</command_topic>
    <odometry_topic>odom</odometry_topic>
    <publish_odom_tf>true</publish_odom_tf>
  </plugin>
</gazebo>
```

---

## Sim-to-Real Transfer

### Domain Randomization

Vary simulation parameters to generalize:

```python
# Randomize physics properties
mass = random.uniform(5.0, 15.0)
friction = random.uniform(0.5, 1.5)
damping = random.uniform(0.1, 0.5)

# Randomize lighting
light_intensity = random.uniform(0.5, 1.5)
ambient_color = random_rgb()

# Randomize textures
floor_texture = random.choice(textures)
```

### System Identification

Measure real-world parameters:

```python
# Calibrate inertial parameters
def estimate_inertia(joint_torques, accelerations):
    # Least squares fit: τ = I * α
    I = np.linalg.lstsq(accelerations, joint_torques)[0]
    return I

# Update URDF
update_urdf_inertia(robot_urdf, estimated_inertia)
```

---

## Summary

Digital twins enable:
- **Safe experimentation** without hardware
- **Parallel training** for machine learning
- **Sensor simulation** for perception algorithms
- **Physics-based testing** before deployment

**Next Chapter:** [NVIDIA Isaac AI Platform →](../chapter-04/index.md)

---

## Exercises

1. Create a URDF model of a simple robot
2. Add sensors (camera, LIDAR) to your robot
3. Implement a Gazebo plugin for custom behavior
4. Compare simulated vs. real sensor data

## Further Reading

- Gazebo Documentation: https://gazebosim.org/
- URDF Tutorial: http://wiki.ros.org/urdf/Tutorials
- Sim-to-Real Research: Domain Randomization papers
