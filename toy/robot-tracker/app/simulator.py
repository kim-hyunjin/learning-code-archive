"""Dummy robot position generator.

Simulates a small fleet of robots wandering inside a rectangular field so the
websocket layer has something to broadcast without needing real hardware.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

FIELD_WIDTH = 100.0
FIELD_HEIGHT = 60.0
TURN_RATE = math.radians(25)  # max heading change per tick, in radians
SPEED_RANGE = (2.0, 6.0)  # units per second


@dataclass
class Robot:
    id: str
    x: float
    y: float
    heading: float  # radians
    speed: float
    battery: float = 100.0

    def step(self, dt: float) -> None:
        self.heading += random.uniform(-TURN_RATE, TURN_RATE) * dt
        dx = math.cos(self.heading) * self.speed * dt
        dy = math.sin(self.heading) * self.speed * dt
        new_x = self.x + dx
        new_y = self.y + dy

        # Bounce off the field walls instead of leaving the visible area.
        if new_x < 0 or new_x > FIELD_WIDTH:
            self.heading = math.pi - self.heading
            new_x = min(max(new_x, 0), FIELD_WIDTH)
        if new_y < 0 or new_y > FIELD_HEIGHT:
            self.heading = -self.heading
            new_y = min(max(new_y, 0), FIELD_HEIGHT)

        self.x, self.y = new_x, new_y
        self.battery = max(0.0, self.battery - dt * 0.05)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "heading": round(self.heading, 3),
            "battery": round(self.battery, 1),
        }


@dataclass
class RobotFleetSimulator:
    robots: list[Robot] = field(default_factory=list)

    @classmethod
    def create(cls, count: int = 3) -> "RobotFleetSimulator":
        robots = [
            Robot(
                id=f"robot-{i + 1}",
                x=random.uniform(0, FIELD_WIDTH),
                y=random.uniform(0, FIELD_HEIGHT),
                heading=random.uniform(0, 2 * math.pi),
                speed=random.uniform(*SPEED_RANGE),
            )
            for i in range(count)
        ]
        return cls(robots=robots)

    def step(self, dt: float) -> None:
        for robot in self.robots:
            robot.step(dt)

    def snapshot(self) -> dict:
        return {
            "field": {"width": FIELD_WIDTH, "height": FIELD_HEIGHT},
            "robots": [robot.to_dict() for robot in self.robots],
        }
