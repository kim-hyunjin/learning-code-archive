---
title: "[C++ 학습 노트 07] 포인터, 참조, 메모리 관리"
description: "포인터와 참조의 차이, new/delete로 힙 메모리를 다루는 법, 댕글링 포인터와 이중 해제 같은 흔한 함정을 정리합니다."
date: 2026-09-09
category: "Language"
categories:
  - Language
  - C++
tags:
  - C++
  - Pointers
  - Memory
summary: "포인터와 참조를 언제 구분해 써야 하는지, new/delete를 짝을 맞춰야 하는 이유, 댕글링 포인터·널 포인터 역참조·이중 해제를 코드로 짚습니다."
---

포인터와 참조, 그리고 `new`/`delete`로 하는 수동 메모리 관리는 C++이 다른 관리형 언어와 가장 크게 갈라지는 지점입니다. 이 글은 이후 09장(복사와 이동 의미론)과 13장(스마트 포인터)에서 다룰 내용의 기반이 되므로, 포인터가 가리키는 대상의 수명을 명확히 짚고 넘어갑니다.

## 포인터란

포인터는 "메모리 주소를 저장하는 변수"입니다. `&`는 어떤 변수의 주소를 얻고, `*`는 포인터가 가리키는 곳의 값을 얻습니다(역참조, dereference).

```cpp
int value = 42;
int* ptr = &value;   // ptr에 value의 주소를 저장

std::cout << ptr << "\n";   // 주소값 (예: 0x7ffee...)
std::cout << *ptr << "\n";  // 42, 역참조로 실제 값에 접근

*ptr = 100;                 // 포인터를 통해 원본 값을 변경
std::cout << value << "\n"; // 100
```

## 참조란

참조는 이미 존재하는 변수에 붙이는 "별명"입니다. 포인터와 달리 참조는 선언과 동시에 반드시 초기화해야 하고, 이후 다른 대상을 가리키도록 바꿀 수 없습니다.

```cpp
int original = 10;
int& alias = original; // alias는 original의 또 다른 이름

alias = 20;
std::cout << original << "\n"; // 20, 같은 변수이므로 원본도 바뀜
```

### 포인터 vs 참조

| | 포인터 | 참조 |
|---|---|---|
| null 가능 | 가능 (`nullptr`) | 불가능 |
| 재할당 | 다른 대상을 가리키도록 변경 가능 | 불가능 (처음 대상에 영구히 묶임) |
| 문법 | `*`, `&`로 명시적 역참조 필요 | 원본 변수처럼 그냥 사용 |

"이 값이 없을 수도 있다"는 걸 표현해야 하면 포인터(또는 `std::optional`)를, 단순히 "이 함수 안에서 원본을 참조/수정하고 싶다"면 참조를 쓰는 것이 자연스럽습니다.

## 함수에 포인터/참조 전달하기

함수 인자는 기본적으로 값으로 복사되어 전달됩니다. 원본을 수정하거나 큰 객체의 복사를 피하려면 포인터나 참조를 씁니다.

```cpp
void addOneByValue(int x) {
    x += 1; // 복사본만 바뀜, 호출자의 변수는 그대로
}

void addOneByPointer(int* x) {
    *x += 1; // 원본이 바뀜
}

void addOneByReference(int& x) {
    x += 1; // 원본이 바뀜, 포인터보다 문법이 간결
}

int main() {
    int n = 5;
    addOneByValue(n);     // n은 여전히 5
    addOneByPointer(&n);  // n은 6
    addOneByReference(n); // n은 7, &n처럼 주소를 넘길 필요 없음
    return 0;
}
```

읽기만 하고 수정하지 않을 큰 객체는 `const 타입&`으로 받아서 복사 비용 없이 안전하게 전달합니다.

```cpp
void printReport(const std::string& text) { // 복사 없이 읽기 전용으로 전달
    std::cout << text << "\n";
}
```

## 동적 메모리: new / delete

지역 변수는 함수가 끝나면 자동으로 사라지지만(스택), `new`로 할당한 메모리는 명시적으로 `delete`할 때까지 계속 살아있습니다(힙).

```cpp
int* p = new int(42);  // 힙에 int 하나를 할당하고 42로 초기화
std::cout << *p << "\n";
delete p;               // 반드시 해제해야 함
p = nullptr;             // 해제 후 댕글링 포인터를 막기 위한 관례

int* arr = new int[10]; // 배열 할당
delete[] arr;             // 배열은 반드시 delete[]로 해제 (delete와 다름)
```

`new`와 `delete`, `new[]`와 `delete[]`는 반드시 짝을 맞춰야 합니다. 짝이 틀리거나 아예 `delete`를 빼먹으면 각각 정의되지 않은 동작과 **메모리 누수(memory leak)**로 이어집니다.

```cpp
void leak() {
    int* p = new int(1);
    // delete p를 빼먹으면 이 함수가 끝나도 메모리는 회수되지 않음 — 메모리 누수
}
```

이런 실수를 원천적으로 줄이기 위해 실무 코드에서는 `new`/`delete`를 직접 쓰기보다 스마트 포인터(13장)를 사용합니다.

## 포인터 연산

배열 이름은 첫 원소를 가리키는 포인터처럼 동작하며, 포인터에 정수를 더하면 "그 타입 크기만큼" 주소가 이동합니다.

```cpp
int arr[3] = {10, 20, 30};
int* p = arr;         // 배열의 첫 원소를 가리킴

std::cout << *p << "\n";     // 10
std::cout << *(p + 1) << "\n"; // 20, p+1은 int 하나 크기(보통 4바이트)만큼 이동한 주소
std::cout << p[2] << "\n";     // 30, arr[2]와 동일한 의미
```

## 흔한 함정

- **댕글링 포인터**: 이미 해제되었거나, 함수가 끝나 사라진 지역 변수를 가리키는 포인터를 계속 쓰는 것.

```cpp
int* dangling() {
    int local = 10;
    return &local; // local은 함수가 끝나면 사라짐 — 이 주소를 반환하면 안 됨
}
```

- **널 포인터 역참조**: `nullptr`을 역참조하면 프로그램이 즉시 크래시됩니다. 포인터를 역참조하기 전에는 `nullptr` 여부를 확인하는 습관이 필요합니다.

```cpp
int* p = nullptr;
if (p != nullptr) {
    std::cout << *p;
} else {
    std::cout << "포인터가 비어있음\n";
}
```

- **이중 해제(double free)**: 같은 포인터를 두 번 `delete`하는 것도 정의되지 않은 동작입니다. `delete` 직후 포인터를 `nullptr`로 만들어두면, `delete nullptr`은 안전하게 아무 일도 하지 않으므로 실수로 두 번 지워도 크래시를 막을 수 있습니다.

이전 글: [06. 문자열](./06-strings.pub.md)

다음 글: [08. 클래스와 객체](./08-classes-and-objects.pub.md)
