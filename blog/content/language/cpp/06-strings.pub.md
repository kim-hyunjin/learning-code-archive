---
title: "[C++ 학습 노트 06] 문자열"
description: "널 종료 방식의 C 스타일 문자열이 가진 위험과 std::string이 이를 어떻게 해결하는지, npos 비교와 c_str() 수명 문제를 정리합니다."
date: 2026-09-09
category: "Language"
categories:
  - Language
  - C++
tags:
  - C++
  - Strings
summary: "버퍼 오버플로우에 취약한 C 스타일 문자열과 std::string의 차이, find()가 실패했을 때 반환하는 npos를 안전하게 비교하는 법을 정리합니다."
---

C++은 C에서 물려받은 문자 배열 방식 문자열과, 이를 안전하게 감싼 `std::string`을 함께 지원합니다. 이번 글에서는 왜 현대 C++에서 특별한 이유가 없다면 `std::string`을 기본으로 쓰는지, 그리고 그 과정에서 흔히 실수하는 지점을 다룹니다.

## C 스타일 문자열

C에서 물려받은 문자열은 문자(`char`) 배열이며, 끝을 알리는 널 종료 문자(`'\0'`)로 끝을 표시합니다.

```cpp
char greeting[] = "Hello"; // 실제로는 {'H','e','l','l','o','\0'} 6바이트

#include <cstring>
char buffer[20];
strcpy(buffer, greeting);       // 복사
strcat(buffer, ", World!");     // 이어붙이기
int len = strlen(buffer);       // 길이 (널 문자는 세지 않음)
int cmp = strcmp("abc", "abd"); // 사전순 비교, 음수/0/양수 반환
```

C 스타일 문자열은 버퍼 크기를 직접 관리해야 해서 실수하기 쉽습니다.

```cpp
char small[5];
strcpy(small, "Hello World"); // 버퍼(5바이트)보다 긴 문자열 복사 → 버퍼 오버플로우, undefined behavior
```

## std::string

`<string>` 헤더의 `std::string`은 크기를 자동으로 관리해주는 문자열 클래스입니다. 현대 C++에서는 특별한 이유가 없다면 C 스타일 문자열 대신 이것을 씁니다.

```cpp
#include <string>

std::string name = "Claude";
name += " Code";              // 이어붙이기
std::string greeting = "Hi, " + name + "!";

std::cout << "길이: " << name.length() << "\n"; // == .size()

if (name.find("Code") != std::string::npos) {
    std::cout << "포함되어 있음\n";
}

std::string sub = name.substr(0, 6); // "Claude" (0번 인덱스부터 6글자)

for (char c : name) {
    std::cout << c; // 문자열도 range-based for로 순회 가능
}
```

`find`가 찾지 못하면 실제 인덱스가 아니라 특별한 값 `std::string::npos`를 반환합니다. 이를 확인하지 않고 인덱스처럼 쓰면 버그가 됩니다.

```cpp
std::string s = "hello";
size_t pos = s.find("xyz");
// if (pos >= 0) 은 항상 참! npos는 아주 큰 부호 없는 정수라서 항상 0 이상이다.
if (pos != std::string::npos) { // 반드시 이렇게 비교해야 함
    std::cout << "찾음: " << pos << "\n";
} else {
    std::cout << "못 찾음\n";
}
```

## C 스타일과 std::string 상호 변환

```cpp
std::string s = "hello";
const char* cstr = s.c_str(); // std::string → C 스타일 문자열 (읽기 전용 포인터)

const char* raw = "world";
std::string fromRaw = raw;    // C 스타일 문자열 → std::string (암묵적 변환)
```

`c_str()`이 반환하는 포인터는 원본 `std::string` 객체가 살아있는 동안, 그리고 그 문자열을 수정하기 전까지만 유효합니다. 문자열을 수정한 뒤에도 예전에 받아둔 포인터를 계속 쓰면 위험합니다.

## 문자 단위 함수

`<cctype>` 헤더는 개별 문자를 검사/변환하는 함수를 제공합니다.

```cpp
#include <cctype>

char c = 'A';
std::cout << (bool)isalpha(c) << "\n"; // 알파벳인가
std::cout << (bool)isdigit(c) << "\n"; // 숫자인가
std::cout << (char)tolower(c) << "\n"; // 소문자로: 'a'
std::cout << (char)toupper('b') << "\n"; // 대문자로: 'B'
```

이 함수들은 `int`를 받고 `int`를 반환하도록 설계되어 있어서, `char`을 넘길 때 결과를 원래 타입으로 캐스팅해주는 것이 안전합니다.

## 흔한 실수

- `std::string`을 값으로 계속 넘기면 매번 복사가 일어납니다. 함수가 문자열을 읽기만 한다면 `const std::string&`으로 받는 것이 효율적입니다.
- 문자열을 `==`으로 비교하는 것은 `std::string`에서는 내용 비교로 잘 동작하지만, C 스타일 문자열(`char*`)끼리 `==`으로 비교하면 내용이 아니라 **포인터 주소**를 비교합니다. C 스타일 문자열의 내용 비교에는 반드시 `strcmp`를 써야 합니다.

이전 글: [05. 배열과 벡터](./05-arrays-and-vectors.pub.md)

다음 글: [07. 포인터, 참조, 메모리 관리](./07-pointers-references-and-memory.pub.md)
