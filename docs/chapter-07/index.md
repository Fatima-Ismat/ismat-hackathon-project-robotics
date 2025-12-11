---
id: chapter-07-conversational-robotics
title: "Chapter 7: Conversational Robotics"
sidebar_label: "7. Conversational Robotics"
sidebar_position: 8
---

# Chapter 7: Conversational Robotics

## Overview

Conversational AI enables robots to understand natural language, engage in dialogue, and respond intelligently. This chapter covers speech recognition, language understanding, and dialogue management for robotics.

**Learning Objectives:**
- Implement speech recognition and synthesis
- Integrate large language models (LLMs)
- Build dialogue systems for robots
- Handle multimodal interactions

---

## Speech-to-Text

### Using Whisper

```python
import whisper

model = whisper.load_model("base")

def transcribe_audio(audio_file):
    result = model.transcribe(audio_file)
    return result["text"]

# Real-time streaming
import pyaudio
import numpy as np

def listen_continuous():
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=16000,
                    input=True,
                    frames_per_buffer=1024)

    while True:
        audio_chunk = stream.read(1024)
        audio_np = np.frombuffer(audio_chunk, dtype=np.int16)

        # Transcribe chunk
        text = model.transcribe(audio_np)

        if text:
            yield text
```

---

## Text-to-Speech

### Using Coqui TTS

```python
from TTS.api import TTS

tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

def speak(text):
    tts.tts_to_file(text=text, file_path="output.wav")
    play_audio("output.wav")

# Real-time synthesis
def speak_stream(text_generator):
    for sentence in text_generator:
        speak(sentence)
```

---

## Large Language Models for Robotics

### Integrating LLMs

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

class RobotLLM:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("gpt2")
        self.model = AutoModelForCausalLM.from_pretrained("gpt2")

    def generate_response(self, user_input, context=""):
        prompt = f"{context}\nHuman: {user_input}\nRobot:"

        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(
            inputs.input_ids,
            max_length=150,
            temperature=0.7,
            top_p=0.9,
        )

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response.split("Robot:")[-1].strip()
```

### Task Planning from Language

```python
class LanguageToAction:
    def __init__(self, llm):
        self.llm = llm

    def parse_instruction(self, instruction):
        prompt = f"""
Convert the following instruction into a sequence of robot actions.
Available actions: move_to(location), pick(object), place(object, location), open(container), close(container)

Instruction: {instruction}

Action sequence (JSON):
"""

        response = self.llm.generate(prompt)
        actions = json.loads(response)
        return actions

# Example
instruction = "Get me a coffee from the kitchen"
actions = parser.parse_instruction(instruction)
# [
#   {"action": "move_to", "args": ["kitchen"]},
#   {"action": "pick", "args": ["coffee_mug"]},
#   {"action": "move_to", "args": ["coffee_machine"]},
#   ...
# ]
```

---

## Dialogue Management

### Finite State Machine

```python
class DialogueManager:
    def __init__(self):
        self.state = "idle"
        self.context = {}

    def process_input(self, user_input):
        if self.state == "idle":
            if "hello" in user_input.lower():
                self.state = "greeting"
                return "Hello! How can I help you?"

        elif self.state == "greeting":
            if "bring" in user_input.lower():
                self.state = "fetch_task"
                self.context['object'] = self.extract_object(user_input)
                return f"I'll bring you the {self.context['object']}"

        elif self.state == "fetch_task":
            # Execute task
            success = self.execute_fetch(self.context['object'])
            if success:
                self.state = "idle"
                return "Here you go!"
            else:
                return "Sorry, I couldn't find it"

        return "I don't understand"
```

### Intent Recognition

```python
from transformers import pipeline

class IntentClassifier:
    def __init__(self):
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )

        self.intents = [
            "bring_object",
            "answer_question",
            "navigate_to",
            "greeting",
            "farewell"
        ]

    def classify(self, utterance):
        result = self.classifier(utterance, self.intents)
        return result['labels'][0], result['scores'][0]

# Example
intent, confidence = classifier.classify("Can you bring me water?")
# ("bring_object", 0.95)
```

---

## Multimodal Understanding

### Vision + Language

```python
class MultimodalRobot:
    def __init__(self, vision_model, llm):
        self.vision = vision_model
        self.llm = llm

    def process_instruction(self, image, text):
        # Describe what robot sees
        image_caption = self.vision.caption(image)

        # Objects in scene
        objects = self.vision.detect_objects(image)
        objects_list = ", ".join([obj.label for obj in objects])

        # Build context
        context = f"""
You are a robot assistant. You can see: {image_caption}
Objects visible: {objects_list}
"""

        # Generate response
        response = self.llm.generate_response(text, context=context)

        return response

# Example
image = camera.capture()
instruction = "Pick up the red block"

response = robot.process_instruction(image, instruction)
# "I see a red block on the table. I'll pick it up now."
```

---

## Emotion and Personality

### Sentiment Analysis

```python
from transformers import pipeline

sentiment_analyzer = pipeline("sentiment-analysis")

def adjust_response_tone(text, user_sentiment):
    if user_sentiment == "NEGATIVE":
        return f"I'm sorry. {text}"
    elif user_sentiment == "POSITIVE":
        return f"Great! {text}"
    else:
        return text

user_input = "This is frustrating!"
sentiment = sentiment_analyzer(user_input)[0]
# {"label": "NEGATIVE", "score": 0.98}

response = "I'll try to help"
adjusted = adjust_response_tone(response, sentiment['label'])
# "I'm sorry. I'll try to help"
```

---

## Safety and Ethics

### Content Filtering

```python
class SafetyFilter:
    def __init__(self):
        self.unsafe_patterns = [
            "hurt", "harm", "attack", "weapon"
        ]

    def is_safe(self, text):
        text_lower = text.lower()
        for pattern in self.unsafe_patterns:
            if pattern in text_lower:
                return False
        return True

    def filter_response(self, response):
        if not self.is_safe(response):
            return "I can't help with that request"
        return response
```

---

## ROS 2 Integration

### Speech Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SpeechNode(Node):
    def __init__(self):
        super().__init__('speech_node')

        # Publishers
        self.transcript_pub = self.create_publisher(String, 'speech/transcript', 10)

        # Subscribers
        self.tts_sub = self.create_subscription(
            String,
            'speech/synthesize',
            self.speak_callback,
            10
        )

        # Speech recognizer
        self.recognizer = whisper.load_model("base")

    def listen(self):
        audio = self.capture_audio()
        text = self.recognizer.transcribe(audio)["text"]

        msg = String()
        msg.data = text
        self.transcript_pub.publish(msg)

    def speak_callback(self, msg):
        speak(msg.data)
```

---

## Summary

Conversational robotics enables:
- **Natural interaction** via speech
- **Task understanding** with LLMs
- **Context-aware responses** through dialogue management
- **Multimodal integration** of vision and language

**Next Chapter:** [Capstone Project →](../chapter-08/index.md)

---

## Exercises

1. Implement a voice-controlled robot interface
2. Create an intent classifier for robot commands
3. Build a dialogue system with state management
4. Integrate vision with language understanding

## Further Reading

- Whisper Paper: arXiv:2212.04356
- LLMs for Robotics: SayCan, Code as Policies
- Dialogue Systems: Rasa Framework
