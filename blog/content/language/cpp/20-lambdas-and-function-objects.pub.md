---
title: "[C++ 학습 노트 20] 람다와 함수 객체"
description: "operator()를 오버로딩한 함수 객체와 람다 표현식의 관계, 값 캡처와 참조 캡처의 차이, STL 알고리즘과 람다를 함께 쓰는 패턴을 정리합니다."
date: 2026-09-09
category: "Language"
categories:
  - Language
  - C++
tags:
  - C++
  - Lambdas
  - Functors
summary: "함수 객체를 간단히 만드는 문법이 람다라는 관점에서, 값 캡처와 참조 캡처의 차이와 람다를 함수 밖으로 반환할 때 참조 캡처가 댕글링이 되는 이유를 정리합니다."
---

18장에서 본 `<algorithm>` 함수들은 조건을 판단하는 함수를 인자로 받는 경우가 많은데, 이럴 때 람다가 특히 유용합니다. 이 글에서는 `operator()`를 오버로딩한 함수 객체(functor)에서 시작해, 람다가 왜 "함수 객체를 간단히 만드는 문법"인지, 그리고 캡처 방식에 따라 동작이 어떻게 달라지는지를 살펴봅니다.

## 함수 객체(Functor)

함수처럼 `()`로 호출할 수 있는 객체입니다. `operator()`를 오버로딩한 클래스로 만들며, 일반 함수와 달리 **상태(멤버 변수)를 가질 수 있다**는 점이 특징입니다.

```cpp
class Multiplier {
private:
    int factor;

public:
    Multiplier(int f) : factor(f) {}

    int operator()(int value) const { // operator()를 오버로딩하면 객체를 함수처럼 호출 가능
        return value * factor;
    }
};

int main() {
    Multiplier triple(3);
    std::cout << triple(10) << "\n"; // 30, triple.operator()(10)과 동일

    return 0;
}
```

## 람다: 함수 객체를 간단히 만드는 문법

매번 클래스를 정의하는 대신, 람다 표현식으로 그 자리에서 바로 함수 객체를 만들 수 있습니다.

```cpp
auto add = [](int a, int b) {
    return a + b;
};

std::cout << add(3, 4) << "\n"; // 7
```

람다의 기본 형태는 `[캡처](매개변수) -> 반환타입 { 본문 }`입니다. 반환 타입은 대부분 컴파일러가 추론할 수 있어 생략 가능합니다.

## 스테이트리스 람다 (캡처 없음)

`[]`처럼 캡처 목록이 비어있으면, 바깥의 변수를 전혀 사용하지 않는 람다입니다. 이런 람다는 일반 함수 포인터로도 변환될 수 있습니다.

```cpp
auto square = [](int x) { return x * x; };
std::cout << square(5) << "\n"; // 25
```

## 스테이트풀 람다 (캡처 있음)

`[]` 안에 바깥 변수를 넣으면, 그 변수를 람다 내부에서 사용할 수 있습니다.

```cpp
int threshold = 10;

auto isAboveThreshold = [threshold](int value) { // threshold를 값으로 캡처(복사)
    return value > threshold;
};

std::cout << isAboveThreshold(15) << "\n"; // 1 (true)

threshold = 100;
std::cout << isAboveThreshold(15) << "\n"; // 여전히 1 — 캡처 시점(threshold=10)의 복사본을 쓰므로 바뀐 값과 무관
```

값 캡처(`[threshold]`)는 캡처하는 순간의 복사본을 쓰지만, 참조 캡처(`[&threshold]`)는 바깥 변수와 연결되어 이후 변경사항도 반영됩니다.

```cpp
int counter = 0;

auto increment = [&counter]() { // & 캡처: 참조로 캡처, 원본을 직접 수정
    counter++;
};

increment();
increment();
std::cout << counter << "\n"; // 2, 람다가 원본 counter를 직접 건드림
```

`[=]`는 사용하는 모든 바깥 변수를 값으로, `[&]`는 참조로 한꺼번에 캡처합니다. 어떤 변수를 어떻게 캡처하는지 명확히 하고 싶다면 `[threshold, &counter]`처럼 개별 지정하는 것이 더 안전합니다.

```cpp
[=]() { /* 사용하는 모든 바깥 변수를 값으로 캡처 */ };
[&]() { /* 사용하는 모든 바깥 변수를 참조로 캡처 */ };
```

## STL 알고리즘과 람다

18장에서 본 `<algorithm>` 함수들은 "조건을 판단하는 함수"를 인자로 받는 경우가 많은데, 이럴 때 람다가 특히 유용합니다. 함수를 따로 정의할 필요 없이 호출하는 자리에서 바로 로직을 작성할 수 있기 때문입니다.

```cpp
#include <algorithm>
#include <vector>

std::vector<int> nums = {5, 12, 8, 3, 20, 7};

int limit = 10;
int countAbove = std::count_if(nums.begin(), nums.end(), [limit](int n) {
    return n > limit;
});
std::cout << "10보다 큰 개수: " << countAbove << "\n"; // 2

std::sort(nums.begin(), nums.end(), [](int a, int b) {
    return a > b; // 내림차순 정렬을 위한 비교자
});

std::for_each(nums.begin(), nums.end(), [](int n) {
    std::cout << n << " ";
});
```

## 함수 객체 vs 람다

| | 함수 객체 (클래스) | 람다 |
|---|---|---|
| 재사용 | 이름 있는 타입으로 여러 곳에서 재사용하기 좋음 | 그 자리에서 한 번 쓰고 마는 로직에 적합 |
| 문법 | 클래스 정의가 필요해 상대적으로 장황함 | 간결하게 즉석에서 작성 |
| 상태 | 생성자로 초기화 | 캡처로 초기화 |

간단한 일회성 로직은 람다로, 여러 곳에서 재사용하거나 복잡한 상태/여러 연산자를 가진 로직은 이름 있는 함수 객체(또는 일반 클래스)로 만드는 것이 자연스럽습니다.

## 흔한 실수

- 참조로 캡처한 지역 변수가 람다보다 먼저 스코프를 벗어나면(예: 람다를 반환하거나 비동기로 나중에 실행), 람다 안에서 이미 사라진 변수를 참조하는 댕글링 참조가 됩니다. 람다가 함수 밖으로 나가서 나중에 호출될 가능성이 있다면 값 캡처(`[=]` 또는 `[변수명]`)를 쓰는 것이 안전합니다.
- `mutable`을 붙이지 않으면 값으로 캡처한 변수는 람다 본문에서 수정할 수 없습니다(캡처된 복사본이 기본적으로 `const`처럼 취급됨). 람다 내부에서 캡처한 값을 바꿔야 한다면 `[value]() mutable { value++; }`처럼 `mutable`을 붙여야 합니다.

이전 글: [19. 열거형](./19-enumerations.pub.md)

다음 글: [21. 전처리기와 매크로](./21-preprocessor-and-macros.pub.md)
