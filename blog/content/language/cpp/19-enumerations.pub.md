---
title: "[C++ 학습 노트 19] 열거형"
description: "전통적인 enum이 이름 충돌과 암묵적 정수 변환에 취약한 이유와, enum class가 스코프와 타입 안전성으로 이를 해결하는 법을 정리합니다."
date: 2026-09-09
category: "Language"
categories:
  - Language
  - C++
tags:
  - C++
  - Enums
summary: "C 스타일 enum이 이름을 전역 스코프에 그대로 노출하고 암묵적으로 정수와 비교되는 문제를, enum class가 스코프와 타입 검사로 어떻게 막는지 정리합니다."
---

숫자 대신 의미 있는 이름을 쓰고 싶을 때 열거형을 사용합니다. 이 글에서는 전통적인 C 스타일 `enum`이 가진 이름 충돌과 암묵적 정수 변환 문제를 먼저 보고, C++11부터 도입된 `enum class`가 이를 어떻게 해결하는지 살펴봅니다.

## enum: 이름 붙은 정수 상수

숫자 대신 의미 있는 이름을 쓰고 싶을 때 열거형을 사용합니다.

```cpp
enum Color { Red, Green, Blue };

Color c = Green;
std::cout << c << "\n"; // 1 (기본적으로 0부터 시작하는 정수값)
```

값을 명시적으로 지정할 수도 있습니다.

```cpp
enum HttpStatus {
    Ok = 200,
    NotFound = 404,
    ServerError = 500
};

HttpStatus status = NotFound;
std::cout << status << "\n"; // 404
```

## 전통적인 enum의 문제점

C 스타일 `enum`은 이름이 감싸는 스코프(namespace) 없이 밖으로 그대로 노출되고, 암묵적으로 정수로 변환됩니다. 이 때문에 서로 다른 열거형끼리 이름이 겹치거나, 의도치 않은 비교가 허용됩니다.

```cpp
enum TrafficLight { Red, Yellow, Green };
// enum Color { Red, Green, Blue }; // 컴파일 에러: Red가 이미 전역 스코프에 있음 (이름 충돌)

enum Fruit { Apple, Banana };
Fruit f = Apple;
if (f == 0) { // Fruit와 int를 그냥 비교할 수 있음 — 실수해도 컴파일러가 못 잡아줌
    std::cout << "사과\n";
}
```

## enum class (scoped enum): 더 안전한 대안

C++11부터 도입된 `enum class`는 이름이 열거형 이름 안에 스코프로 갇히고, 다른 타입으로 암묵적 변환되지 않습니다.

```cpp
enum class TrafficLight { Red, Yellow, Green };
enum class Fruit { Apple, Banana };
// 이제 TrafficLight::Red와 Fruit::Apple처럼 이름이 겹쳐도 충돌하지 않음

TrafficLight light = TrafficLight::Red; // 항상 열거형 이름을 접두어로 붙여야 함

// if (light == 0) {} // 컴파일 에러: enum class는 int와 암묵적으로 비교되지 않음
if (light == TrafficLight::Red) { // 반드시 같은 enum class 값끼리만 비교 가능
    std::cout << "정지\n";
}
```

명시적으로 정수로 바꾸고 싶다면 `static_cast`를 씁니다.

```cpp
int value = static_cast<int>(TrafficLight::Yellow); // 1
TrafficLight fromInt = static_cast<TrafficLight>(2); // TrafficLight::Green
```

## switch와 함께 쓰기 (04장 복습)

```cpp
enum class Direction { North, South, East, West };

std::string describe(Direction dir) {
    switch (dir) {
        case Direction::North: return "북쪽";
        case Direction::South: return "남쪽";
        case Direction::East:  return "동쪽";
        case Direction::West:  return "서쪽";
    }
    return "알 수 없음";
}
```

`enum class` 값을 `switch`에 쓸 때도 각 `case`에 열거형 이름을 접두어로 붙여야 합니다(`case North:`가 아니라 `case Direction::North:`).

## 언제 무엇을 쓸까

새 코드를 작성할 때는 특별한 이유가 없다면 **`enum class`를 기본으로 선택**하는 것이 좋습니다. 이름 충돌을 막아주고, 의도치 않은 정수 비교를 컴파일 타임에 잡아주기 때문입니다. 전통적인 `enum`은 오래된 C 라이브러리와의 호환이나, 정수로의 암묵적 변환이 정말 필요한 드문 경우에만 고려합니다.

## 흔한 실수

- `enum class` 값을 곧바로 `std::cout`으로 출력하려고 하면 컴파일 에러가 납니다(`int`로 암묵적 변환이 안 되므로). `static_cast<int>`로 변환하거나, 위 `describe()`처럼 문자열로 바꿔주는 함수를 따로 만들어야 합니다.
- 값을 명시적으로 지정하지 않은 `enum`/`enum class`는 0부터 순서대로 자동 배정됩니다. 나중에 중간에 새 값을 끼워 넣으면 그 뒤의 모든 값이 밀리므로, 저장된 값(파일, 데이터베이스 등)과 연동되는 열거형이라면 값을 명시적으로 고정해두는 것이 안전합니다.

이전 글: [18. 반복자와 알고리즘](./18-iterators-and-algorithms.pub.md)

다음 글: [20. 람다와 함수 객체](./20-lambdas-and-function-objects.pub.md)
